import "server-only";

import path from "node:path";
import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  RawImage,
  cos_sim,
  env,
  type Processor,
} from "@huggingface/transformers";

const MODEL_ID = "Xenova/clip-vit-base-patch32";

/** 손그림이 현실적으로 도달하는 최대 유사도. 이 값에서 100점이 됩니다. */
const SKETCH_CEIL = 0.78;
/** 기준선이 너무 높은 사진에서 점수 구간이 찌그러지지 않도록 확보하는 최소 폭. */
const MIN_RANGE = 0.12;
/** 빈 캔버스를 대신하는 흰 정사각형의 한 변. CLIP 입력 크기와 같습니다. */
const SQUARE_SIDE = 224;
/** 이 알파값을 넘으면 그린 픽셀로 봅니다. */
const INK_ALPHA = 16;
/** 잘라낸 그림 주위에 남기는 여백 비율. */
const CROP_MARGIN = 0.08;

env.cacheDir = path.join(process.cwd(), ".cache", "transformers");

type Clip = {
  processor: Processor;
  model: CLIPVisionModelWithProjection;
};

let clipPromise: Promise<Clip> | null = null;
let blankEmbedPromise: Promise<number[]> | null = null;

/**
 * CLIP vision encoder를 한 번만 내려받아 프로세스 전체에서 재사용합니다.
 * 첫 호출에서 모델을 다운로드해 `.cache/transformers`에 캐시합니다.
 */
function loadClip(): Promise<Clip> {
  clipPromise ??= (async () => {
    const [processor, model] = await Promise.all([
      AutoProcessor.from_pretrained(MODEL_ID),
      CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, { dtype: "q8" }),
    ]);
    return { processor, model };
  })();

  return clipPromise;
}

async function embed(image: RawImage): Promise<number[]> {
  const { processor, model } = await loadClip();
  const inputs = await processor(image);
  const { image_embeds } = await model(inputs);

  return Array.from(image_embeds.data as Float32Array);
}

function whiteSquare(side: number = SQUARE_SIDE): RawImage {
  return new RawImage(
    new Uint8ClampedArray(side * side * 3).fill(255),
    side,
    side,
    3,
  );
}

/**
 * 아무것도 안 그린 흰 캔버스의 임베딩. 사진마다 이 값과의 유사도가 0.50~0.63으로
 * 다르게 나와서, 점수의 0점 기준선으로 씁니다.
 */
function blankEmbed(): Promise<number[]> {
  blankEmbedPromise ??= embed(whiteSquare());

  return blankEmbedPromise;
}

/**
 * 그린 영역만 잘라 흰 정사각형 가운데에 놓습니다. 투명 배경도 이때 흰색으로 덮습니다.
 *
 * CLIP은 짧은 변을 기준으로 가운데를 정사각형으로 잘라 쓰기 때문에, 이 정규화가 없으면
 * 800×420 캔버스의 가운데 420×420만 모델에 들어갑니다. 한쪽에 작게 그린 그림은
 * 절반이 잘려나가고 남은 것도 여백에 둘러싸여, 잘 그렸어도 빈 종이처럼 보입니다.
 */
function cropToInk(image: RawImage): RawImage {
  const { data, width, height } = image.rgba();

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] <= INK_ALPHA) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) return whiteSquare();

  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;
  const side = Math.round(
    Math.max(boxWidth, boxHeight) * (1 + CROP_MARGIN * 2),
  );
  const out = new Uint8ClampedArray(side * side * 3).fill(255);
  const offsetX = Math.round((side - boxWidth) / 2);
  const offsetY = Math.round((side - boxHeight) / 2);

  for (let y = 0; y < boxHeight; y++) {
    for (let x = 0; x < boxWidth; x++) {
      const src = ((minY + y) * width + (minX + x)) * 4;
      const dst = ((offsetY + y) * side + (offsetX + x)) * 3;
      const alpha = data[src + 3] / 255;

      out[dst] = data[src] * alpha + 255 * (1 - alpha);
      out[dst + 1] = data[src + 1] * alpha + 255 * (1 - alpha);
      out[dst + 2] = data[src + 2] * alpha + 255 * (1 - alpha);
    }
  }

  return new RawImage(out, side, side, 3);
}

/**
 * 그린 그림이 원본 고양이 사진과 얼마나 비슷한지 CLIP 임베딩 유사도로 채점합니다.
 * 빈 캔버스가 0점이 되도록 원본 사진별 기준선을 잡고 그 위를 100점까지 폅니다.
 * 그림은 그린 영역만 잘라 넣어, 캔버스 어디에 얼마나 크게 그렸는지는 점수에 영향이 없습니다.
 *
 * @param drawing - 캔버스를 PNG로 변환한 파일
 * @param referenceUrl - 따라 그린 원본 고양이 사진 URL
 * @returns 0~100 점수와 보정 전 코사인 유사도
 */
export async function scoreDrawing(drawing: Blob, referenceUrl: string) {
  const [drawingImage, referenceImage] = await Promise.all([
    RawImage.fromBlob(drawing).then(cropToInk),
    RawImage.fromURL(referenceUrl).then((image) => image.rgb()),
  ]);

  const [drawingEmbed, referenceEmbed, baselineEmbed] = await Promise.all([
    embed(drawingImage),
    embed(referenceImage),
    blankEmbed(),
  ]);

  const similarity = cos_sim(drawingEmbed, referenceEmbed);
  const floor = cos_sim(baselineEmbed, referenceEmbed);
  const ceil = Math.max(SKETCH_CEIL, floor + MIN_RANGE);
  const ratio = (similarity - floor) / (ceil - floor);
  const score = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);

  return { score, similarity };
}

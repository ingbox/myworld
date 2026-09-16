import "server-only";

import { uploadObjectToS3 } from "@/src/util/shared/s3";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * 캔버스에서 그린 고양이 그림을 S3에 올립니다. PNG만 받습니다.
 *
 * @param catId - 따라 그린 원본 고양이 id
 * @param file - 캔버스를 PNG로 변환한 파일
 * @returns S3 공개 URL
 * @throws 파일이 없거나 PNG가 아니거나 5MB를 넘는 경우
 */
export async function uploadDrawingToS3(catId: string, file: File) {
  if (!file || file.size === 0) {
    throw new Error("그림 파일이 없습니다.");
  }

  if (file.type !== "image/png") {
    throw new Error("PNG 그림만 업로드할 수 있습니다.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("그림 파일이 너무 큽니다. (최대 5MB)");
  }

  const key = `orm/drawings/${Date.now()}-${catId}.png`;
  const buffer = Buffer.from(await file.arrayBuffer());

  return uploadObjectToS3(key, buffer, "image/png");
}

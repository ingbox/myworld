import type { P5CanvasInstance, Sketch, SketchProps } from "@p5-wrapper/react";

export type MemoTool = "pen" | "eraser";

/** globals.css `--keyword-memo-paper` 와 동일하게 유지 */
const MEMO_PAPER = [255, 253, 245] as const;

export type MemoSketchProps = SketchProps & {
  tool: MemoTool;
  penColor: string;
  penWeight: number;
  canvasWidth: number;
  canvasHeight: number;
  storageKey: string;
  /** 증가할 때마다 캔버스 초기화 */
  clearToken: number;
};

type MemoP5 = P5CanvasInstance<SketchProps>;

function saveCanvas(p5: MemoP5, storageKey: string) {
  const canvas = p5.canvas as HTMLCanvasElement | null;
  if (!canvas || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey, canvas.toDataURL("image/png"));
  } catch {
    // quota exceeded 등 — 무시
  }
}

function pointerInside(p5: MemoP5) {
  return p5.mouseX >= 0 && p5.mouseX <= p5.width && p5.mouseY >= 0 && p5.mouseY <= p5.height;
}

export const createMemoSketch = (): Sketch<MemoSketchProps> => (p5) => {
  let props: MemoSketchProps = {
    tool: "pen",
    penColor: "#1e293b",
    penWeight: 2.5,
    canvasWidth: 320,
    canvasHeight: 360,
    storageKey: "cy-keyword-memo",
    clearToken: 0,
  };

  let drawing = false;
  let lastClearToken = props.clearToken;
  let loadGeneration = 0;

  const clearCanvas = () => {
    loadGeneration++;
    p5.noErase();
    p5.background(...MEMO_PAPER);
    p5.redraw();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(props.storageKey);
    }
  };

  const loadCanvas = () => {
    if (typeof localStorage === "undefined" || p5.width <= 0) return;

    const data = localStorage.getItem(props.storageKey);
    if (!data || !data.startsWith("data:image/")) {
      if (data) localStorage.removeItem(props.storageKey);
      return;
    }

    const generation = ++loadGeneration;

    p5.loadImage(
      data,
      (img) => {
        if (generation !== loadGeneration || !img || p5.width <= 0) return;
        p5.noErase();
        p5.background(...MEMO_PAPER);
        p5.image(img, 0, 0, p5.width, p5.height);
        p5.redraw();
      },
      () => {
        if (generation !== loadGeneration) return;
        localStorage.removeItem(props.storageKey);
      },
    );
  };

  const applyStroke = () => {
    p5.strokeCap("round");
    p5.strokeJoin("round");

    if (props.tool === "eraser") {
      p5.erase();
      p5.strokeWeight(props.penWeight * 3);
    } else {
      p5.noErase();
      const hex = props.penColor.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      p5.stroke(r, g, b);
      p5.strokeWeight(props.penWeight);
    }
  };

  const startDraw = () => {
    if (!pointerInside(p5 as MemoP5)) return;
    drawing = true;
    p5.beginShape();
    p5.noFill();
    applyStroke();
    p5.vertex(p5.mouseX, p5.mouseY);
  };

  const continueDraw = () => {
    if (!drawing) return;
    applyStroke();
    p5.vertex(p5.mouseX, p5.mouseY);
    p5.endShape();
    p5.beginShape();
    p5.vertex(p5.mouseX, p5.mouseY);
  };

  const endDraw = () => {
    if (!drawing) return;
    drawing = false;
    p5.endShape();
    p5.noErase();
    saveCanvas(p5 as MemoP5, props.storageKey);
  };

  p5.updateWithProps = (next: SketchProps) => {
    const prevW = props.canvasWidth;
    const prevH = props.canvasHeight;
    props = next as MemoSketchProps;

    if (p5.width <= 0) return;

    if (props.clearToken !== lastClearToken) {
      lastClearToken = props.clearToken;
      clearCanvas();
      return;
    }

    if (prevW !== props.canvasWidth || prevH !== props.canvasHeight) {
      p5.resizeCanvas(props.canvasWidth, props.canvasHeight);
      loadCanvas();
    }
  };

  p5.setup = () => {
    p5.createCanvas(props.canvasWidth, props.canvasHeight);
    p5.background(...MEMO_PAPER);

    if (props.clearToken !== lastClearToken) {
      lastClearToken = props.clearToken;
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(props.storageKey);
      }
    } else {
      loadCanvas();
    }

    p5.noLoop();
  };

  p5.draw = () => {};

  p5.mousePressed = startDraw;
  p5.mouseDragged = continueDraw;
  p5.mouseReleased = endDraw;

  p5.touchStarted = () => {
    startDraw();
    return false;
  };

  p5.touchMoved = () => {
    continueDraw();
    return false;
  };

  p5.touchEnded = () => {
    endDraw();
    return false;
  };
};

import type { P5CanvasInstance, Sketch, SketchProps } from "@p5-wrapper/react";

export type MemoTool = "pen" | "eraser";

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

function loadCanvas(p5: MemoP5, storageKey: string) {
  if (typeof localStorage === "undefined" || p5.width <= 0) return;
  const data = localStorage.getItem(storageKey);
  if (!data || !data.startsWith("data:image/")) {
    if (data) localStorage.removeItem(storageKey);
    return;
  }

  p5.loadImage(
    data,
    (img) => {
      if (!img || p5.width <= 0) return;
      p5.background(255, 252, 235);
      p5.image(img, 0, 0, p5.width, p5.height);
      p5.redraw();
    },
    () => {
      localStorage.removeItem(storageKey);
    },
  );
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

  const applyStroke = () => {
    if (props.tool === "eraser") {
      p5.stroke(255, 252, 235);
      p5.strokeWeight(props.penWeight * 3);
    } else {
      const hex = props.penColor.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      p5.stroke(r, g, b);
      p5.strokeWeight(props.penWeight);
    }
    p5.strokeCap("round");
    p5.strokeJoin("round");
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
    saveCanvas(p5 as MemoP5, props.storageKey);
  };

  p5.updateWithProps = (next: SketchProps) => {
    const prevW = props.canvasWidth;
    const prevH = props.canvasHeight;
    props = next as MemoSketchProps;

    if (p5.width <= 0) return;

    if (prevW !== props.canvasWidth || prevH !== props.canvasHeight) {
      p5.resizeCanvas(props.canvasWidth, props.canvasHeight);
      loadCanvas(p5 as MemoP5, props.storageKey);
    }

    if (props.clearToken !== lastClearToken) {
      lastClearToken = props.clearToken;
      p5.background(255, 252, 235);
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(props.storageKey);
      }
    }
  };

  p5.setup = () => {
    p5.createCanvas(props.canvasWidth, props.canvasHeight);
    p5.background(255, 252, 235);

    if (props.clearToken !== lastClearToken) {
      lastClearToken = props.clearToken;
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(props.storageKey);
      }
    } else {
      loadCanvas(p5 as MemoP5, props.storageKey);
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

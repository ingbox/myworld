'use client';

import { useEffect, useRef, useState } from 'react';
// NextReactP5Wrapper는 CSR 전용이므로 런타임에 직접 임포트하여 사용합니다.
import type { Sketch, SketchProps } from '@p5-wrapper/react';
import Matter from 'matter-js';

type MySketchProps = SketchProps & {
  width: number;
  height: number;
};

// 1. 스케치 함수 정의 (p5 및 matter cleanup 내장)
const createSketch = (): Sketch<MySketchProps> => (p5) => {
  const BASE_WIDTH = 1000;
  const BASE_HEIGHT = 600;
  let currentWidth = BASE_WIDTH;
  let currentHeight = BASE_HEIGHT;

  // Matter.js 모듈 선언
  const { Engine, World, Bodies, Mouse, MouseConstraint } = Matter;
  let engine: Matter.Engine;
  let world: Matter.World;
  let mConstraint: Matter.MouseConstraint;

  // 단어 클래스 정의 (수학적 크기 계산으로 p5 의존성 제거)
  class WordBody {
    text: string;
    size: number;
    color: string;
    body: Matter.Body;
    width: number;
    height: number;

    constructor(x: number, y: number, text: string, size: number, color: string) {
      this.text = text;
      this.size = size;
      this.color = color;

      // 수학적으로 충돌 박스 크기 계산 (textSize 에러 방지)
      this.width = this.text.length * (this.size * 0.72) + 15;
      this.height = this.size * 1.0;

      // Matter.js 사각형 물리 바디 생성
      this.body = Bodies.rectangle(x, y, this.width, this.height, {
        restitution: 0.4,
        friction: 0.1,
        density: 0.01,
      });

      // 물리 세계에 바디 추가
      World.add(world, this.body);
    }

    show() {
      const pos = this.body.position;
      const angle = this.body.angle;

      p5.push();
      p5.translate(pos.x, pos.y);
      p5.rotate(angle);
      p5.fill(this.color);
      p5.noStroke();
      p5.textSize(this.size);
      p5.text(this.text, 0, 0);
      p5.pop();
    }
  }

  let words: WordBody[] = [];
  const wordData = [
    { text: "취업준비", size: 90, color: '#b8730e' },
    { text: "재테크", size: 70, color: '#611612' },
    { text: "음악", size: 60, color: '#611612' },
    { text: "사랑", size: 55, color: '#333333' },
    { text: "헬스", size: 50, color: '#b8730e' },
    { text: "찬물샤워", size: 45, color: '#611612' },
    { text: "코딩테스트준비", size: 40, color: '#b8730e' },
    { text: "건강챙기기", size: 35, color: '#b8730e' },
    { text: "드래그 해 주세요", size: 35, color: '#611612' },
    { text: "맛집", size: 30, color: '#b8730e' },
    { text: "옷", size: 30, color: '#b8730e' },
  ];

  // 물리 엔진 초기화 함수
  const initPhysics = () => {
    // 기존 물리 세성 정리 (중복 생성 방지 핵심)
    if (engine) {
      World.clear(world, false);
      Engine.clear(engine);
    }

    engine = Engine.create();
    world = engine.world;
    world.gravity.y = 1.0;

    // 경계 생성
    const ground = Bodies.rectangle(BASE_WIDTH / 2, BASE_HEIGHT + 30, BASE_WIDTH, 100, { isStatic: true });
    const leftWall = Bodies.rectangle(-30, BASE_HEIGHT / 2, 100, BASE_HEIGHT, { isStatic: true });
    const rightWall = Bodies.rectangle(BASE_WIDTH + 30, BASE_HEIGHT / 2, 100, BASE_HEIGHT, { isStatic: true });
    World.add(world, [ground, leftWall, rightWall]);

    // 단어 배치
    words = wordData.map((item, idx) => {
      const startX = p5.random(200, BASE_WIDTH - 200);
      const startY = -100 - (idx * 80);
      return new WordBody(startX, startY, item.text, item.size, item.color);
    });

    // 마우스 제약 조건 설정 (타입 단언 추가)
    const canvasElement = p5.canvas as HTMLCanvasElement;
    if (canvasElement) {
      const mouse = Mouse.create(canvasElement);
      mConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: { visible: false }
        }
      });
      World.add(world, mConstraint);
    }
  };

  p5.setup = () => {
    p5.createCanvas(currentWidth, currentHeight);
    p5.textAlign(p5.CENTER, p5.CENTER);
    initPhysics();
  };

  p5.updateWithProps = (props) => {
    if (!props) return;
    if (props.width && props.height) {
      if (currentWidth !== props.width || currentHeight !== props.height) {
        currentWidth = props.width;
        currentHeight = props.height;
        p5.resizeCanvas(currentWidth, currentHeight);
        initPhysics(); // 화면 크기 변경 시 물리 리셋
      }
    }
  };

  p5.draw = () => {
    p5.background(255);

    const scaleX = currentWidth / BASE_WIDTH;
    const scaleY = currentHeight / BASE_HEIGHT;
    const currentScale = Math.min(scaleX, scaleY);

    p5.push();
    p5.scale(currentScale);

    const offsetX = (currentWidth / currentScale - BASE_WIDTH) / 2;
    const offsetY = (currentHeight / currentScale - BASE_HEIGHT) / 2;
    p5.translate(offsetX, offsetY);

    // [해결] setPosition 에러 방지 - 마우스 좌표 직접 대입
    if (mConstraint && mConstraint.mouse) {
      const actualMouseX = p5.mouseX / currentScale - offsetX;
      const actualMouseY = p5.mouseY / currentScale - offsetY;
      
      mConstraint.mouse.position.x = actualMouseX;
      mConstraint.mouse.position.y = actualMouseY;
    }

    if (engine) {
      Engine.update(engine);
    }

    for (const word of words) {
      word.show();
    }

    p5.pop();
  };

  // ⭐️⭐️⭐️ [중복 캔버스 해결 핵심] p5 인스턴스 언마운트 시 클린업
  (p5 as any).cleanup = () => {
    if (engine) {
      World.clear(world, false);
      Engine.clear(engine);
    }
    p5.remove(); // DOM에서 캔버스 완벽 제거
  };
};

// 2. 메인 컴포넌트
export default function WordCloudPhysicsPage() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // p5-wrapper 컴포넌트를 클라이언트 사이드에서만 로드하기 위한 상태
  const [P5Wrapper, setP5Wrapper] = useState<any>(null);
  const sketchRef = useRef<Sketch<MySketchProps>>(createSketch());

  // [CSS 해결] 부모 크기 동적 감지
  useEffect(() => {
    if (!wrapperRef.current) return;
    const initialRect = wrapperRef.current.getBoundingClientRect();
    setSize({ width: initialRect.width, height: initialRect.height });

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      requestAnimationFrame(() => {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      });
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // ⭐️⭐️⭐️ [next/dynamic 없이 CSR 구현] 마운트 시점에만 p5-wrapper 임포트
  useEffect(() => {
    import('@p5-wrapper/next').then((mod) => {
      setP5Wrapper(() => mod.NextReactP5Wrapper);
    });
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full h-full min-h-[500px] overflow-hidden bg-white">
      {size.width > 0 && size.height > 0 && P5Wrapper && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <P5Wrapper
            sketch={sketchRef.current}
            width={size.width}
            height={size.height}
          />
        </div>
      )}
    </div>
  );
}
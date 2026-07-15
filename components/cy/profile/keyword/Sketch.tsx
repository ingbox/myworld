'use client';

import { useEffect, useRef, useState } from 'react';
import { NextReactP5Wrapper } from '@p5-wrapper/next';
import { type Sketch, type SketchProps } from '@p5-wrapper/react';

type MySketchProps = SketchProps & {
    width: number;
    height: number;
};

const sketch: Sketch<MySketchProps> = (p5) => {
    // 1. 디자인 기준이 되는 가상의 원본 해상도 (예: 1000 x 500)
    const BASE_WIDTH = 1000;
    const BASE_HEIGHT = 500;

    // 현재 실제 캔버스 크기
    let currentWidth = BASE_WIDTH;
    let currentHeight = BASE_HEIGHT;

    p5.setup = () => {
        p5.createCanvas(currentWidth, currentHeight);
    };

    p5.updateWithProps = (props) => {
        if (!props) return;

        if (props.width && props.height) {
            currentWidth = props.width;
            currentHeight = props.height;
            p5.resizeCanvas(currentWidth, currentHeight);
        }
    };

    p5.draw = () => {
        p5.background(245); // 이제 배경색이 캔버스 전체에 꽉 찹니다.

        const scaleX = currentWidth / BASE_WIDTH;
        const scaleY = currentHeight / BASE_HEIGHT;

        p5.push();
        // ⭐️ 중요: 하나의 고정 배율 대신 가로(scaleX), 세로(scaleY)를 각각 따로 적용합니다.
        p5.scale(scaleX, scaleY);

        // 마우스 좌표도 가로/세로 각각의 비율로 나누어 보정합니다.
        const scaledMouseX = p5.mouseX / scaleX;
        const scaledMouseY = p5.mouseY / scaleY;

        p5.fill(0);
        p5.circle(scaledMouseX, scaledMouseY, 40);

        p5.textSize(20);
        p5.text(`Base: ${BASE_WIDTH} x ${BASE_HEIGHT}`, 20, 30);
        p5.text(`Real: ${Math.round(currentWidth)} x ${Math.round(currentHeight)}`, 20, 60);
        p5.text(`Scale: X(${(scaleX * 100).toFixed(0)}%) Y(${(scaleY * 100).toFixed(0)}%)`, 20, 90);

        p5.pop();
    };
};

export default function Page() {
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (!wrapperRef.current) return;

        const initialRect = wrapperRef.current.getBoundingClientRect();
        setSize({
            width: initialRect.width,
            height: initialRect.height,
        });

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

    // Page 컴포넌트의 return 부분
    return (
        <div
            ref={wrapperRef}
            // 부모 배경색을 p5 캔버스 배경색과 같은 회색 계열(bg-[#f5f5f5])로 맞추고 
            // flex-col, items-center, justify-center로 캔버스를 가운데 딱 붙입니다.
            className="relative w-full h-full min-h-[500px] bg-[#f5f5f5] overflow-hidden flex items-center justify-center"
        >
            {size.width > 0 && size.height > 0 && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                    <NextReactP5Wrapper
                        sketch={sketch}
                        width={size.width}
                        height={size.height}
                    />
                </div>
            )}
        </div>
    );
}
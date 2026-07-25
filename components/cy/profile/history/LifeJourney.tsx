"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPathPoint } from "@/lib/cy/profile/history/path";
import {
  JOURNEY_STAGES,
  stageHeight,
  stageOpacity,
  stagePosFromX,
} from "@/lib/cy/profile/history/stages";

const BG_SRC = "/images/profile/history/journey-bg-wide.png";
/** .history-bg-root 높이와 동일해야 함 */
const BG_HEIGHT = 520;
/** 원본 비율(1536x694) 기준 임시 폭 — 이미지 로드 후 실제 비율로 갱신됨 */
const DEFAULT_BG_WIDTH = Math.round((BG_HEIGHT * 1536) / 694);

export default function LifeJourney() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [bgWidth, setBgWidth] = useState(DEFAULT_BG_WIDTH);

  const updateProgress = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => el.removeEventListener("scroll", updateProgress);
  }, [updateProgress]);

  const path = getPathPoint(progress);
  const stagePos = stagePosFromX(path.x);
  const charLeft = path.x * bgWidth;
  const charBottom = (1 - path.y) * BG_HEIGHT;
  const charHeight = stageHeight(stagePos);

  return (
    <div className="history-bg-root">
      <div ref={scrollRef} className="history-bg-scroll">
        <div className="history-bg-panels">
          <div className="history-bg-panel" style={{ width: bgWidth }}>
            <Image
              src={BG_SRC}
              alt="인생 히스토리 배경"
              fill
              sizes="(max-width: 768px) 100vw, 1300px"
              preload
              draggable={false}
              style={{ objectFit: "contain" }}
              onLoad={(e) => {
                const { naturalWidth, naturalHeight } = e.currentTarget;
                if (naturalWidth && naturalHeight) {
                  setBgWidth(
                    Math.round((BG_HEIGHT * naturalWidth) / naturalHeight),
                  );
                }
              }}
            />

            {/* 길 위를 따라 이동하며 단계별로 디졸브되는 캐릭터 */}
            <div
              className="history-character-layer"
              style={{ left: charLeft, bottom: charBottom, height: charHeight }}
            >
              {JOURNEY_STAGES.map((stage, i) => {
                const opacity = stageOpacity(stagePos, i);
                if (opacity <= 0.01) return null;
                return (
                  <Image
                    key={`${stage.src}-${i}`}
                    src={stage.src}
                    alt={stage.label}
                    width={stage.naturalWidth}
                    height={stage.naturalHeight}
                    draggable={false}
                    className="history-character"
                    style={{
                      height: charHeight,
                      width: "auto",
                      opacity,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
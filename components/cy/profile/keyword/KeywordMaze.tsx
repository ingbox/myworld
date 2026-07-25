"use client";

import { useState } from "react";
import MemoPad from "@/components/cy/profile/keyword/MemoPad";

/** API 연동 전 퀴즈 영역 플레이스홀더 */
export default function KeywordMaze() {
  const [memoOpen, setMemoOpen] = useState(false);

  return (
    <div className="keyword-maze-root">
      <div className="keyword-maze-quiz">
        <p className="keyword-maze-label">KEYWORD MAZE</p>
        <h2 className="keyword-maze-title">키워드 미궁</h2>
        <p className="keyword-maze-desc">
          단계를 클리어할 때마다 다음 문제가 열리는 온라인 미궁이 준비 중이에요.
          문제를 풀 때 메모장을 열어 자유롭게 메모하세요.
        </p>

        <div className="keyword-maze-card">
          <span className="keyword-maze-stage">STAGE 1</span>
          <p className="keyword-maze-question">
            (문제 API 연동 후 이곳에 퀴즈가 표시됩니다)
          </p>
          <input
            type="text"
            className="keyword-maze-input"
            placeholder="정답 입력"
            disabled
            aria-label="정답 입력"
          />
          <button type="button" className="keyword-maze-submit" disabled>
            확인
          </button>
        </div>
      </div>

      <MemoPad open={memoOpen} onOpenChange={setMemoOpen} />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import ActionButton from "@/src/components/game/ActionButton";
import ChoiceBox from "@/src/components/game/ChoiceBox";
import DPad from "@/src/components/game/DPad";
import { type Dir } from "@/src/util/main/chip";
import tutorialCopy from "@/src/util/main/tutorial.json";

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

type IntroPage = {
  kind: "intro";
  title?: string;
  lines: string[];
};

type ControlsPage = {
  kind: "controls";
  title: string;
  desktop: {
    label: string;
    moveTitle: string;
    moveKeys: string[];
    moveHint: string;
    actionTitle: string;
    actionKeys: string[];
    actionHint: string;
  };
  mobile: {
    label: string;
    lines: string[];
  };
};

type TutorialPage = IntroPage | ControlsPage;

type Props = {
  onStart: () => void;
};

function KeyCap({ label }: { label: string }) {
  return (
    <span className="inline-flex min-w-8 items-center justify-center rounded-sm border border-[#e8d5b0] bg-[#2a2018] px-1.5 py-0.5 font-dotum text-xs text-[#f4ead8]">
      {label}
    </span>
  );
}

function PageBody({ page }: { page: TutorialPage }) {
  if (page.kind === "intro") {
    return (
      <div className="max-w-md text-center">
        {page.title ? (
          <p className="mb-6 font-dotum text-2xl text-[#e8d5b0]">{page.title}</p>
        ) : null}
        <div className="space-y-4 font-dotum text-base leading-relaxed text-[#f4ead8] sm:text-lg">
          {page.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg text-[#f4ead8]">
      <p className="mb-5 text-center font-dotum text-2xl text-[#e8d5b0]">{page.title}</p>
      <div className="space-y-5 font-dotum">
        <section className="rounded-md border border-[#e8d5b0]/40 bg-[#1a1210]/80 p-4">
          <p className="mb-3 text-sm tracking-wide text-[#e8d5b0]">
            🖥️ {page.desktop.label}
          </p>
          <p className="mb-2 text-sm text-[#e8d5b0]">{page.desktop.moveTitle}</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {page.desktop.moveKeys.map((key) => (
              <KeyCap key={key} label={key} />
            ))}
          </div>
          <p className="mb-4 text-sm leading-relaxed">{page.desktop.moveHint}</p>
          <p className="mb-2 text-sm text-[#e8d5b0]">{page.desktop.actionTitle}</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {page.desktop.actionKeys.map((key) => (
              <KeyCap key={key} label={key} />
            ))}
          </div>
          <p className="text-sm leading-relaxed">{page.desktop.actionHint}</p>
        </section>
        <section className="rounded-md border border-[#e8d5b0]/40 bg-[#1a1210]/80 p-4">
          <p className="mb-3 text-sm tracking-wide text-[#e8d5b0]">
            📱 {page.mobile.label}
          </p>
          <div className="space-y-2 text-sm leading-relaxed">
            {page.mobile.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * 처음 온 사람에게 검은 화면으로 소개를 보여 준 뒤, 시작 여부를 묻습니다.
 * 아니오는 처음부터 다시, 예는 게임을 엽니다.
 */
export default function TutorialScreen({ onStart }: Props) {
  const pages = tutorialCopy.pages as TutorialPage[];
  const [page, setPage] = useState(0);
  const [choice, setChoice] = useState<{ pick: "yes" | "no" } | null>(null);
  const last = page >= pages.length - 1;
  const current = pages[page];

  const confirm = useCallback(() => {
    if (choice) {
      if (choice.pick === "yes") {
        onStart();
        return;
      }
      setChoice(null);
      setPage(0);
      return;
    }
    if (!last) {
      setPage((n) => n + 1);
      return;
    }
    setChoice({ pick: "yes" });
  }, [choice, last, onStart]);

  const onHoldStart = useCallback(
    (dir: Dir) => {
      if (!choice) return;
      if (dir === "left" || dir === "up") setChoice({ pick: "yes" });
      if (dir === "right" || dir === "down") setChoice({ pick: "no" });
    },
    [choice],
  );

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter" || e.code === "KeyZ") {
        e.preventDefault();
        if (!e.repeat) confirm();
        return;
      }
      const dir = KEY_DIR[e.code];
      if (!dir) return;
      e.preventDefault();
      if (e.repeat) return;
      onHoldStart(dir);
    };

    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [confirm, onHoldStart]);

  return (
    <div data-tutorial className="fixed inset-0 overflow-hidden bg-black">
      {!choice && current ? (
        <div className="absolute inset-0 flex items-center justify-center overflow-y-auto px-5 pb-36 pt-10">
          <div key={page} style={{ animation: "exhibit-line 0.4s ease-out" }}>
            <PageBody page={current} />
          </div>
        </div>
      ) : null}
      {choice ? (
        <ChoiceBox
          text={tutorialCopy.prompt}
          pick={choice.pick}
          onPick={(pick) => setChoice({ pick })}
          onConfirm={confirm}
        />
      ) : (
        <p className="pointer-events-none absolute inset-x-0 bottom-28 text-center font-dotum text-xs text-[#e8d5b0]/80 sm:bottom-12 animate-pulse">
          다음 &gt;
        </p>
      )}
      <DPad onHoldStart={onHoldStart} onHoldEnd={() => {}} />
      <ActionButton onConfirm={confirm} hint />
    </div>
  );
}

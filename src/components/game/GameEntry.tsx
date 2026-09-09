"use client";

import { useCallback, useState } from "react";
import HouseWorld from "@/src/components/game/HouseWorld";
import TutorialScreen from "@/src/components/game/TutorialScreen";
import { markGameStarted } from "@/src/util/main/mark-game-started";

type Props = {
  started: boolean;
};

/**
 * 첫 방문이면 튜토리얼을 먼저 보여 주고, 시작하면 마을로 들어갑니다.
 */
export default function GameEntry({ started }: Props) {
  const [play, setPlay] = useState(started);

  const onStart = useCallback(() => {
    setPlay(true);
    void markGameStarted();
  }, []);

  if (!play) {
    return <TutorialScreen onStart={onStart} />;
  }

  return <HouseWorld />;
}

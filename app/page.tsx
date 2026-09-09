import { Suspense } from "react";
import { cookies } from "next/headers";
import GameEntry from "@/src/components/game/GameEntry";
import { GAME_STARTED_COOKIE, isGameStartedCookie } from "@/src/util/main/tutorial";

export default function Home() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <HomeEntry />
    </Suspense>
  );
}

async function HomeEntry() {
  const jar = await cookies();
  const started = isGameStartedCookie(jar.get(GAME_STARTED_COOKIE)?.value);
  return <GameEntry started={started} />;
}

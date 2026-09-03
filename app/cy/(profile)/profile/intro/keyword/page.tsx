import { auth } from "@/app/auth";
import KeywordMaze from "@/components/cy/profile/intro/keyword/KeywordMaze";
import KeywordMazeSkeleton from "@/components/cy/profile/intro/keyword/KeywordMazeSkeleton";
import { getCurrentStateByEmail } from "@/src/lib/api/cy/profile/intro/keyword/service";
import { Suspense } from "react";

async function KeywordMazeLoader() {
  const session = await auth();
  const state = await getCurrentStateByEmail(session?.user?.email);

  if (!state) {
    return (
      <div className="p-7 text-sm text-slate-500">등록된 문제가 없습니다.</div>
    );
  }

  return (
    <KeywordMaze
      initialNode={state.node}
      initialHistory={state.history}
      isLoggedIn={!!session?.user?.email}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<KeywordMazeSkeleton />}>
      <KeywordMazeLoader />
    </Suspense>
  );
}

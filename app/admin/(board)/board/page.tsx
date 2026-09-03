import BoardEditor from "@/components/admin/board/Editor";
import AdminNavigation from "@/components/layout/AdminNavigation";
import { getBoardTypeList } from "@/src/lib/api/shared/board/service";
import { Suspense } from "react";

function BoardEditorFallback() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-slate-400 animate-pulse">
      불러오는 중...
    </div>
  );
}

async function BoardEditorLoader() {
  const typeList = await getBoardTypeList();
  return <BoardEditor typeList={typeList} />;
}

export default function Page() {
  return (
    <div>
      <AdminNavigation />
      <Suspense fallback={<BoardEditorFallback />}>
        <BoardEditorLoader />
      </Suspense>
    </div>
  );
}

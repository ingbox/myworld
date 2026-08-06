import KeywordEditor from "@/components/admin/profile/intro/keyword/Editor";
import AdminNavigation from "@/components/layout/AdminNavigation";
import { getKeywordNodeList } from "@/lib/services/admin/profile/intro/keyword/action";
import { Suspense } from "react";

function KeywordEditorFallback() {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-slate-400 animate-pulse">
      불러오는 중...
    </div>
  );
}

async function KeywordEditorLoader() {
  const nodeList = await getKeywordNodeList();
  return <KeywordEditor nodeList={nodeList} />;
}

export default function Page() {
  return (
    <div>
      <AdminNavigation />
      <Suspense fallback={<KeywordEditorFallback />}>
        <KeywordEditorLoader />
      </Suspense>
    </div>
  );
}

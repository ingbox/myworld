import Editor from "@/components/admin/photo/Editor";
import AdminNavigation from "@/components/layout/AdminNavigation";
import { getPhotoTypeList } from "@/src/lib/api/cy/photo/service";
import { Suspense } from "react";

export default async function Page() {

  // 카테고리 가져오기
  const typeList = await getPhotoTypeList();

  return (
    <div>
      <AdminNavigation />
      {/* Tiptap Editor */}
      <Suspense>
        <Editor typeList={typeList} />
      </Suspense>
    </div>
  );
}
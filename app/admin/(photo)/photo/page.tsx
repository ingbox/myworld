import { getPhotoTypeList } from "@/app/actions/common/photo";
import Editor from "@/components/admin/photo/Editor";
import AdminNavigation from "@/components/layout/AdminNavigation";

export default async function Page() {

   // 카테고리 가져오기
   const typeList = await getPhotoTypeList();

  return (
    <div>
        <AdminNavigation />
        {/* Tiptap Editor */}
        <Editor typeList={typeList}/>
    </div>
  );
}
import Editor from "@/components/admin/photo/Editor";
import AdminNavigation from "@/components/layout/AdminNavigation";

export default async function Page() {
  return (
    <div>
        <AdminNavigation />
        {/* Tiptap Editor */}
        <Editor />
    </div>
  );
}
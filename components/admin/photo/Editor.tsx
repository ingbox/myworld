'use client';
import { createPhoto } from "@/app/actions/admin/photo";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import type { Editor } from "@tiptap/react";
import { useState } from "react";

export default function Page({typeList}: {
    typeList: { id: number; name: string }[];
  }) {
    const [title, setTitle] = useState<string>("");
    const [editor, setEditor] = useState<Editor | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const typeId = formData.get("photoType"); // 👈 핵심
        await createPhoto({
          title,
          content: editor?.getHTML() || "",
          type: Number(typeId), // 👈 숫자로 변환
        });
      
      };
    return (
        <div className="px-7 py-5">
            {/* Tiptap Editor */}
            <form onSubmit={handleSubmit}>
                <div className="flex gap-2">
                    <input className="w-full p-2 border-gray-300 rounded-sm border" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <select className="border border-gray-300 rounded-sm" name="photoType" id="photoType" defaultValue={0}>
                        <option value="0">선택 안함</option>
                        {
                            typeList.map((list: any) => (
                                <option value={list.id} key={list.id}>{list.name}</option>
                            ))}
                    </select>
                </div>
                <SimpleEditor onEditorReady={setEditor} />
                <button type="submit">확인</button>
            </form>

        </div>
    );
}
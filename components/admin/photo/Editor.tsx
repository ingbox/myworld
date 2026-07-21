'use client';

import { createPhoto } from "@/app/actions/admin/photo";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import type { Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PhotoEditor({
  typeList,
}: {
  typeList: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    const typeId = Number(formData.get("photoType"));

    setIsSubmitting(true);
    try {
      await createPhoto({
        title,
        content: editor?.getHTML() || "",
        type: typeId,
      });

      const photoPath =
        typeId > 0 ? `/cy/photo/1?type=${typeId}` : "/cy/photo/1";
      router.push(photoPath);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-hidden px-6 py-4">
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="mb-3 flex shrink-0 items-center gap-2">
          <input
            className="h-9 min-w-0 flex-1 rounded border border-gray-300 px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#459ebe]"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            required
          />
          <select
            className="h-9 shrink-0 rounded border border-gray-300 bg-white px-2 text-sm text-gray-600 outline-none focus:border-[#459ebe]"
            name="photoType"
            id="photoType"
            defaultValue={0}
          >
            <option value="0">선택 안함</option>
            {typeList.map((list) => (
              <option value={list.id} key={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-[432px] shrink-0 overflow-hidden rounded border border-gray-300">
          <SimpleEditor onEditorReady={setEditor} />
        </div>

        <div className="mt-3 flex shrink-0 justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="h-9 min-w-[88px] rounded bg-[#459ebe] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "저장 중..." : "확인"}
          </button>
        </div>
      </form>
    </div>
  );
}

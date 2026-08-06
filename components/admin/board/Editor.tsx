"use client";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { createBoard } from "@/lib/services/admin/board/action";
import type { Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BoardEditor({
  typeList,
}: {
  typeList: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [boardType, setBoardType] = useState(
    typeList[0]?.id ? String(typeList[0].id) : "",
  );
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const typeId = Number(boardType);
    if (!Number.isFinite(typeId) || typeId <= 0) {
      setError("게시판 종류를 선택해 주세요.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createBoard({
        title,
        content: editor?.getHTML() || "",
        type: typeId,
      });

      const path =
        result.boardId != null
          ? `/cy/board/${result.boardId}`
          : `/cy/board?type=${typeId}`;
      router.push(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 저장에 실패했습니다.");
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
            name="boardType"
            id="boardType"
            value={boardType}
            onChange={(e) => setBoardType(e.target.value)}
            required
          >
            {typeList.length === 0 ? (
              <option value="">게시판 없음</option>
            ) : (
              typeList.map((list) => (
                <option value={list.id} key={list.id}>
                  {list.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="h-108 shrink-0 overflow-hidden rounded border border-gray-300">
          <SimpleEditor onEditorReady={setEditor} />
        </div>

        {error && (
          <p className="mt-2 shrink-0 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-3 flex shrink-0 justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting || !title.trim() || !boardType || typeList.length === 0
            }
            className="h-9 min-w-22 rounded bg-[#459ebe] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "저장 중..." : "확인"}
          </button>
        </div>
      </form>
    </div>
  );
}

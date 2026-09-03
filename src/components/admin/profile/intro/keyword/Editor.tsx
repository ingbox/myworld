"use client";

import { SimpleEditor } from "@/components/shared/tiptap/templates/simple/simple-editor";
import { createKeywordNode } from "@/src/lib/api/admin/profile/intro/keyword/action";
import type { KeywordRouteInput } from "@/src/lib/api/admin/profile/intro/keyword/types";
import type { Editor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type NodeOption = {
  id: number;
  title: string | null;
  is_start: boolean;
};

type RouteField = {
  answer: string;
  nextNodeId: string;
};

const EMPTY_ROUTE: RouteField = { answer: "", nextNodeId: "" };

export default function KeywordEditor({
  nodeList,
}: {
  nodeList: NodeOption[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isStart, setIsStart] = useState(nodeList.length === 0);
  const [routes, setRoutes] = useState<RouteField[]>([
    { ...EMPTY_ROUTE },
    { ...EMPTY_ROUTE },
    { ...EMPTY_ROUTE },
  ]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRoute = (index: number, patch: Partial<RouteField>) => {
    setRoutes((prev) =>
      prev.map((route, i) => (i === index ? { ...route, ...patch } : route)),
    );
  };

  const addRoute = () => {
    setRoutes((prev) => [...prev, { ...EMPTY_ROUTE }]);
  };

  const removeRoute = (index: number) => {
    setRoutes((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    const payload: KeywordRouteInput[] = routes.map((route) => ({
      answer: route.answer,
      nextNodeId:
        route.nextNodeId === "" ? null : Number(route.nextNodeId),
    }));

    try {
      await createKeywordNode({
        title,
        content: editor?.getHTML() || "",
        isStart,
        routes: payload,
      });

      router.push("/cy/profile/intro/keyword");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "문제 저장에 실패했습니다.");
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
            placeholder="스테이지 제목 (예: STAGE 1)"
            required
          />
          <label className="flex shrink-0 items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isStart}
              onChange={(e) => setIsStart(e.target.checked)}
            />
            시작 문제
          </label>
        </div>

        <div className="mb-3 h-72 shrink-0 overflow-hidden rounded border border-gray-300">
          <SimpleEditor onEditorReady={setEditor} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded border border-gray-200 bg-[#fafafa] p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">정답 분기</p>
            <button
              type="button"
              onClick={addRoute}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              + 분기 추가
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {routes.map((route, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="h-8 min-w-0 flex-1 rounded border border-gray-300 px-2 text-sm outline-none focus:border-[#459ebe]"
                  type="text"
                  value={route.answer}
                  onChange={(e) =>
                    updateRoute(index, { answer: e.target.value })
                  }
                  placeholder="정답"
                  required
                />
                <select
                  className="h-8 w-44 shrink-0 rounded border border-gray-300 bg-white px-2 text-sm outline-none focus:border-[#459ebe]"
                  value={route.nextNodeId}
                  onChange={(e) =>
                    updateRoute(index, { nextNodeId: e.target.value })
                  }
                >
                  <option value="">미궁 종료</option>
                  {nodeList.map((node) => (
                    <option key={node.id} value={node.id}>
                      #{node.id} {node.title ?? `STAGE ${node.id}`}
                      {node.is_start ? " (시작)" : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeRoute(index)}
                  disabled={routes.length <= 1}
                  className="h-8 shrink-0 rounded border border-gray-300 px-2 text-xs text-gray-500 disabled:opacity-40"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="mt-2 shrink-0 text-sm text-red-500">{error}</p>
        )}

        <div className="mt-3 flex shrink-0 justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="h-9 min-w-22 rounded bg-[#459ebe] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "저장 중..." : "확인"}
          </button>
        </div>
      </form>
    </div>
  );
}

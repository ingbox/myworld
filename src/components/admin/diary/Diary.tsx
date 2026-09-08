"use client";

import { useState } from "react";
import Form from "next/form";
import { useCreateDiary } from "@/src/hooks/admin/diary/calendar/use-create-diary";
import { createDiarySchema } from "@/src/lib/api/admin/diary/calendar/schema";

export default function Diary({ diaryDate }: { diaryDate: string }) {
    const { mutate: createDiary } = useCreateDiary();
    const [errors, setErrors] = useState<{ content?: string }>({});

    const handleCreateDiary = async (formData: FormData) => {
        const parsed = createDiarySchema.safeParse({
            content: formData.get("content"),
            diaryDate,
        });

        if (!parsed.success) {
            const fieldErrors = parsed.error.flatten().fieldErrors;
            setErrors({
                content: fieldErrors.content?.[0],
            });
            return;
        }

        setErrors({});
        createDiary(parsed.data, {
            onError: () => {
                setErrors({ content: "다이어리 추가에 실패했습니다. 다시 시도해주세요." });
            },
        });
    };

    return (
        <Form action={handleCreateDiary}>
            <textarea
                name="content"
                className="w-full h-20 p-2 border border-zinc-300 rounded-md"
                onChange={() => setErrors((prev) => ({ ...prev, content: undefined }))}
            />
            <div className="flex justify-between">
                <div>
                    {errors.content && (
                        <p className="text-xs text-red-500">{errors.content}</p>
                    )}
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-bold
        
        ">
                    저장
                </button>
            </div>
        </Form>
    );
}
import { createDiary } from "@/src/lib/api/admin/diary/calendar/actions";
import { diaryKeys } from "@/src/hooks/cy/diary/use-diary";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Form from "next/form";


export default function Diary({ diaryDate }: { diaryDate: string }) {

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: createDiary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: diaryKeys.list(diaryDate) });
            alert("다이어리가 추가되었습니다!");
        },
        onError: () => {
            alert("다이어리 추가에 실패했습니다. 다시 시도해주세요.");
        }
    });

    const handleCreateDiary = async (formData: FormData) => {
        const content = formData.get('content') as string;
        mutation.mutate({
            content: content,
            diaryDate: diaryDate,
        });
    };

    return (
        <Form action={handleCreateDiary}>
            <textarea name="content" className="w-full h-20 p-2 border border-zinc-300 rounded-md" />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Save
            </button>
        </Form>
    );
}
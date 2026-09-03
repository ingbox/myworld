'use client';

import { createBoardComment } from "@/src/lib/api/cy/board/comment/action";
import Form from "next/form";
import { useRouter } from "next/navigation";

interface Props {
    boardId: number;
    parentId: number;
    userName: string;
    userEmail: string;
    onClose: () => void;
}

export default function CommentReplyForm({
    boardId,
    parentId,
    userName,
    userEmail,
    onClose,
}: Props) {
    const router = useRouter();

    return (
        <Form
            className="mt-1"
            action={async (formData) => {
                await createBoardComment(formData);
                onClose();
                router.refresh();
            }}
        >
            <input type="hidden" name="board_id" value={boardId} />
            <input type="hidden" name="parent_id" value={parentId} />
            <input type="hidden" name="user_name" value={userName} />
            <input type="hidden" name="user_email" value={userEmail} />
            <div className="flex gap-2">
                <textarea
                    className="flex-1 h-10 text-[15px] text-gray-600 bg-white border border-gray-300 p-1"
                    name="content"
                    minLength={1}
                    maxLength={1000}
                    required
                    autoFocus
                />
                <button
                    className="text-sm w-10 h-10 border border-gray-400 text-gray-500 bg-white rounded-sm"
                    type="submit"
                >
                    확인
                </button>
            </div>
        </Form>
    );
}

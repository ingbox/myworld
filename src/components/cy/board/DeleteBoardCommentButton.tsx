'use client';

import { deleteBoardComment } from "@/src/lib/api/cy/board/comment/action";
import { useRouter } from "next/navigation";

interface Props {
    user?: {
        email?: string | null;
        role?: string;
    };
    commentId: number;
    boardId: number;
    commentUserEmail: string;
}

export default function DeleteBoardCommentButton({
    user,
    commentId,
    boardId,
    commentUserEmail,
}: Props) {
    const router = useRouter();

    const handleDelete = async () => {
        const confirmed = window.confirm("정말 삭제하시겠습니까?");
        if (!confirmed) return;
        await deleteBoardComment(commentId, boardId);
        router.refresh();
    };

    if (commentUserEmail !== user?.email && user?.role !== "ADMIN") {
        return null;
    }

    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="inline align-middle ml-1 cursor-pointer"
            style={{ verticalAlign: "middle" }}
            onClick={handleDelete}
            role="button"
            aria-label="댓글 삭제"
        >
            <rect width="100" height="100" fill="transparent" stroke="#6B7280" strokeWidth="5" />
            <line x1="20" y1="20" x2="80" y2="80" stroke="#6B7280" strokeWidth="5" />
            <line x1="80" y1="20" x2="20" y2="80" stroke="#6B7280" strokeWidth="5" />
        </svg>
    );
}

'use client'
import { deleteProfileComment } from "@/lib/services/cy/home/comment/action";

interface Props {
    user?: {
        email?: string;
        role?: string;
    };
    commentId: string;
    commentUserEmail: string;
}

export default function DeleteProfileCommentButton({
    user,
    commentId,
    commentUserEmail,
}: Props) {

    const handleDelete = async () => {
        const confirmed = window.confirm("정말 삭제하시겠습니까?");
        if (!confirmed) return;
        await deleteProfileComment(commentId);
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
            onClick={handleDelete}
        >
            <rect width="100" height="100" fill="transparent" stroke="#6B7280" strokeWidth="5" />
            <line x1="20" y1="20" x2="80" y2="80" stroke="#6B7280" strokeWidth="5" />
            <line x1="80" y1="20" x2="20" y2="80" stroke="#6B7280" strokeWidth="5" />
        </svg>
    );
}

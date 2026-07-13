'use client'
import { deleteComment } from "@/lib/services/cy/visitor/action";

export default function Comment({ user, comment }: { user: any, comment: any }) {

    const handleDelete = async () => {
        const confirm = window.confirm('정말 삭제하시겠습니까?');
        if (!confirm) return;
        deleteComment(comment.id);
    }

    return (
        <>
            {/* 댓글 삭제 버튼 */}
            {
                (comment.user_email === user?.email || user?.role === "ADMIN") &&

                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline align-middle ml-1 cursor-pointer"
                    style={{ verticalAlign: 'middle' }}
                    onClick={() => handleDelete()}
                >
                    <rect width="100" height="100" fill="transparent" stroke="#6B7280" strokeWidth="5" />
                    <line x1="20" y1="20" x2="80" y2="80" stroke="#6B7280" strokeWidth="5" />
                    <line x1="80" y1="20" x2="20" y2="80" stroke="#6B7280" strokeWidth="5" />
                </svg>
            }
        </>
    )
}
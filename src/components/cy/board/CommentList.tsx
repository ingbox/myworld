'use client';

import Image from "next/image";
import { useState } from "react";
import CommentReplyForm from "./CommentReplyForm";
import DeleteBoardCommentButton from "./DeleteBoardCommentButton";

export interface BoardComment {
    id: number;
    board_id: number;
    parent_id: number | null;
    user_name: string;
    user_email: string;
    content: string;
    created_at_formatted: string;
}

interface User {
    name?: string | null;
    email?: string | null;
    role?: string;
}

interface Props {
    boardId: number;
    comments: BoardComment[];
    user: User | null;
}

export default function CommentList({ boardId, comments, user }: Props) {
    const [openReplyParentId, setOpenReplyParentId] = useState<number | null>(null);

    const handleReplyClick = (parentId: number) => {
        setOpenReplyParentId((current) => (current === parentId ? null : parentId));
    };

    return (
        <div className="p-2 bg-[#f4f4f2] mx-7">
            {comments
                .filter((comment) => comment.parent_id === null)
                .map((parent) => (
                    <div key={parent.id} className="mb-2">
                        <span className="max-w-13.75 inline-block text-[#4a60ab]">{parent.user_name}</span>
                        <span className="inline-block">&nbsp;:&nbsp;</span>
                        <span className="inline-block">{parent.content}&nbsp;</span>
                        <span className="inline-block text-xs text-gray-500">({parent.created_at_formatted}) &nbsp;</span>
                        {user && (
                            <>
                                <button
                                    type="button"
                                    className="inline-block align-middle cursor-pointer border-0 bg-transparent p-0"
                                    onClick={() => handleReplyClick(parent.id)}
                                    aria-label="답글"
                                >
                                    <Image
                                        src="/images/cy/board/reply.png"
                                        className="inline-block"
                                        alt="reply"
                                        width={12}
                                        height={12}
                                    />
                                </button>
                                <DeleteBoardCommentButton
                                    user={user}
                                    commentId={parent.id}
                                    boardId={boardId}
                                    commentUserEmail={parent.user_email}
                                />
                            </>
                        )}
                        {user && openReplyParentId === parent.id && (
                            <div className="ml-13.75 mt-1">
                                <CommentReplyForm
                                    boardId={boardId}
                                    parentId={parent.id}
                                    userName={user.name ?? ""}
                                    userEmail={user.email ?? ""}
                                    onClose={() => setOpenReplyParentId(null)}
                                />
                            </div>
                        )}
                        <div className="ml-13.75">
                            {comments
                                .filter((child) => child.parent_id === parent.id)
                                .map((child) => (
                                    <div key={child.id}>
                                        <span className="text-xs inline-block text-[#4a60ab]">↳&nbsp;</span>
                                        <span className="max-w-13.75 inline-block text-[#4a60ab]">{child.user_name}</span>
                                        <span className="inline-block">&nbsp;:&nbsp;</span>
                                        <span>{child.content}&nbsp;</span>
                                        <span className="inline-block text-xs text-gray-500">({child.created_at_formatted})</span>
                                        {user && (
                                            <DeleteBoardCommentButton
                                                user={user}
                                                commentId={child.id}
                                                boardId={boardId}
                                                commentUserEmail={child.user_email}
                                            />
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
        </div>
    );
}

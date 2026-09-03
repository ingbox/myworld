'use server';

import { auth } from "@/app/auth";
import pool from "@/src/lib/db";
import { updateTag } from "next/cache";
import {
    DELETE_BOARD_COMMENT,
    DELETE_BOARD_COMMENT_REPLIES,
    GET_BOARD_COMMENT_BY_ID,
    INSERT_BOARD_COMMENT,
} from "./queries";

/**
 * 게시글 댓글 또는 대댓글을 작성합니다.
 * 로그인한 사용자만 가능하며, 작성 후 `boardCommentList:{boardId}` 캐시를 갱신합니다.
 *
 * @param formData - `board_id`, `content` 필수. 대댓글이면 `parent_id`도 넣습니다.
 * @throws 로그인하지 않았거나 `board_id`/`content`가 비어 있는 경우
 */
export async function createBoardComment(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("로그인이 필요합니다.");
    }

    const boardId = Number(formData.get("board_id"));
    const parentIdRaw = formData.get("parent_id") as string;
    const parentId = parentIdRaw ? Number(parentIdRaw) : null;
    const content = (formData.get("content") as string)?.trim();

    if (!boardId || !content) {
        throw new Error("잘못된 요청입니다.");
    }

    await pool.query(INSERT_BOARD_COMMENT, [
        boardId,
        parentId,
        content,
        session.user.email,
        session.user.name ?? "",
        new Date(),
    ]);

    updateTag(`boardCommentList:${boardId}`);
}

/**
 * 게시글 댓글을 삭제합니다. 대댓글이 있으면 함께 지웁니다.
 * 작성자 본인 또는 ADMIN만 삭제할 수 있습니다.
 *
 * @param id - 삭제할 댓글 id
 * @param boardId - 캐시 갱신용 게시글 id
 * @throws 로그인하지 않았거나, 댓글이 없거나, 삭제 권한이 없는 경우
 */
export async function deleteBoardComment(id: number, boardId: number) {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("로그인이 필요합니다.");
    }

    const { rows } = await pool.query(GET_BOARD_COMMENT_BY_ID, [id]);
    const comment = rows[0];

    if (!comment) {
        throw new Error("댓글을 찾을 수 없습니다.");
    }

    const isOwner = comment.user_email === session.user.email;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
        throw new Error("삭제 권한이 없습니다.");
    }

    await pool.query(DELETE_BOARD_COMMENT_REPLIES, [id]);
    await pool.query(DELETE_BOARD_COMMENT, [id]);
    updateTag(`boardCommentList:${boardId}`);
}

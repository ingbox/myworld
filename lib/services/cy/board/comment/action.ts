'use server';

import { auth } from "@/app/auth";
import pool from "@/lib/db";
import { updateTag } from "next/cache";
import {
    DELETE_BOARD_COMMENT,
    DELETE_BOARD_COMMENT_REPLIES,
    GET_BOARD_COMMENT_BY_ID,
    INSERT_BOARD_COMMENT,
    UPDATE_BOARD_COMMENT,
} from "./queries";

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

export async function updateBoardComment(id: number, content: string) {
    const result = await pool.query(UPDATE_BOARD_COMMENT, [id, content]);
    return result.rows[0];
}

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

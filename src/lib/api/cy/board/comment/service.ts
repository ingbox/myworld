import "server-only";

import pool from "@/src/lib/db";
import { GET_BOARD_COMMENT_LIST } from "./queries";
import { cacheTag } from "next/cache";
import type { BoardCommentData } from "./types";

/**
 * 게시글에 달린 댓글·대댓글을 작성 시각 오름차순으로 조회합니다.
 *
 * @param boardId - 게시글 id
 * @returns 해당 글의 댓글 목록. 대댓글은 `parent_id`로 연결됩니다.
 */
export async function getBoardCommentList(
    boardId: number
): Promise<BoardCommentData[]> {
    "use cache";
    cacheTag(`boardCommentList:${boardId}`);

    const result = await pool.query(GET_BOARD_COMMENT_LIST, [boardId]);
    return result.rows as BoardCommentData[];
}
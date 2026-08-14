import "server-only";

import pool from "@/lib/db";
import { GET_BOARD_COMMENT_LIST } from "./queries";
import { cacheTag } from "next/cache";

export async function getBoardCommentList(boardId: number) {
    "use cache";
    cacheTag(`boardCommentList:${boardId}`);

    const result = await pool.query(GET_BOARD_COMMENT_LIST, [boardId]);
    return result.rows;
}
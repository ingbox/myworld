// lib/services/cy/board/service.ts
import "server-only";

import { cacheTag } from "next/cache";
import pool from "@/lib/db";
import {
  GET_BOARD_LIST,
  SELECT_BOARD_TOTAL_COUNT,
  GET_BOARD_CONTENT,
} from "./queries";

type BoardPaginationResult = {
  boards: any[];
  totalCount: number;
};

export async function getBoardList(
  page: number,
  type = 0
): Promise<BoardPaginationResult> {
  "use cache";

  cacheTag("boardList");

  const pageNum = Math.max(1, page);
  const limit = 10;
  const offset = (pageNum - 1) * limit;

  const [list, total] = await Promise.all([
    pool.query(GET_BOARD_LIST, [limit, offset, type]),
    pool.query(SELECT_BOARD_TOTAL_COUNT, [type]),
  ]);

  return {
    boards: list.rows,
    totalCount: Number(total.rows[0]?.total_count ?? 0),
  };
}

export async function getBoardContent(id: number) {
  "use cache";
  cacheTag(`boardContent-${id}`);

  const result = await pool.query(GET_BOARD_CONTENT, [id]);
  if (result.rows.length === 0) {
    throw new Error("게시글을 찾을 수 없습니다.");
  }

  return result.rows[0];
}
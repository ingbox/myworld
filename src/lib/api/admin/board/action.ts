"use server";

import pool from "@/src/lib/db";
import { updateTag } from "next/cache";
import { INSERT_BOARD } from "./queries";
import type { CreateBoardRequest, CreateBoardResult } from "./types";

/**
 * 관리자에서 게시글을 작성합니다.
 * 작성 후 목록·종류·홈 최근글·컨텐츠 카운트 캐시를 갱신합니다.
 *
 * @param data - 제목, 본문, 게시판 종류 id
 * @param data.title - 게시글 제목
 * @param data.content - 게시글 본문
 * @param data.type - 게시판 종류 id. `0` 이하는 허용하지 않습니다.
 * @returns `{ success: true, boardId }`
 * @throws 종류가 없거나 DB 저장에 실패한 경우
 */
export async function createBoard({
  title,
  content,
  type,
}: CreateBoardRequest): Promise<CreateBoardResult> {
  if (!Number.isFinite(type) || type <= 0) {
    throw new Error("게시판 종류를 선택해 주세요.");
  }

  try {
    const result = await pool.query(INSERT_BOARD, [title, content, type]);
    const boardId = result.rows[0]?.id as number | undefined;

    updateTag("boardList");
    updateTag("boardType");
    updateTag("updatedNews");
    updateTag("contentCount");

    return { success: true, boardId };
  } catch (err) {
    console.error("createBoard err:", err);
    throw new Error("게시글 생성 실패");
  }
}

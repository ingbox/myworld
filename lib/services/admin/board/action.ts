"use server";

import pool from "@/lib/db";
import { updateTag } from "next/cache";
import { INSERT_BOARD } from "./queries";

export async function createBoard({
  title,
  content,
  type,
}: {
  title: string;
  content: string;
  type: number;
}) {
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

"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import pool from "@/src/lib/db";
import { INCREMENT_BOARD_VIEW } from "./queries";

const BOARD_VIEWS_COOKIE = "board_views";
const BOARD_VIEWS_MAX_AGE = 60 * 60 * 24;
const BOARD_VIEWS_MAX_LEN = 3500;

/**
 * 조회 쿠키에 게시글 id를 추가합니다.
 * 이미 본 글이면 `null`을 반환하고, 쿠키가 너무 길면 앞에서부터 잘라냅니다.
 *
 * @param raw - 기존 `board_views` 쿠키 값 (`id,id,...`)
 * @param boardId - 이번에 본 게시글 id
 * @returns 갱신된 쿠키 문자열. 이미 포함된 id면 `null`
 */
function appendBoardViewId(raw: string, boardId: string) {
  const ids = raw.split(",").map((value) => value.trim()).filter(Boolean);
  if (ids.includes(boardId)) {
    return null;
  }

  let next = [...ids, boardId].join(",");
  while (next.length > BOARD_VIEWS_MAX_LEN) {
    const rest = next.split(",");
    rest.shift();
    next = rest.join(",");
  }

  return next;
}

/**
 * 게시글 조회수를 1 올립니다.
 * 같은 브라우저에서 하루 동안 이미 본 글은 쿠키로 걸러 중복 집계하지 않습니다.
 *
 * @param boardId - 조회수를 올릴 게시글 id. 유효하지 않으면 아무 작업도 하지 않습니다.
 */
export async function trackBoardView(boardId: number) {
  if (!Number.isFinite(boardId) || boardId <= 0) {
    return;
  }

  const id = String(boardId);
  const cookieStore = await cookies();
  const raw = cookieStore.get(BOARD_VIEWS_COOKIE)?.value ?? "";
  const next = appendBoardViewId(raw, id);

  if (!next) {
    return;
  }

  await pool.query(INCREMENT_BOARD_VIEW, [boardId]);
  revalidateTag("boardList", { expire: 0 });

  cookieStore.set(BOARD_VIEWS_COOKIE, next, {
    path: "/",
    maxAge: BOARD_VIEWS_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
  });
}

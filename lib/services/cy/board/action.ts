"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import pool from "@/lib/db";
import { INCREMENT_BOARD_VIEW } from "./queries";

const BOARD_VIEWS_COOKIE = "board_views";
const BOARD_VIEWS_MAX_AGE = 60 * 60 * 24;
const BOARD_VIEWS_MAX_LEN = 3500;

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

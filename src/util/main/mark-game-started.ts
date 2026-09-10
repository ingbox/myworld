"use server";

import { cookies } from "next/headers";
import {
  GAME_STARTED_COOKIE,
  GAME_STARTED_MAX_AGE,
} from "@/src/util/main/tutorial";
import {
  createPlayerId,
  decodePlayerCookie,
  encodePlayerCookie,
} from "@/src/util/main/player-cookie";
import { ensureGamePlayer } from "@/src/lib/api/main/service";

function playerCookieOptions() {
  return {
    path: "/",
    maxAge: GAME_STARTED_MAX_AGE,
    sameSite: "lax" as const,
    httpOnly: true,
  };
}

/**
 * `game-started`에서 방문자 식별값을 읽습니다. 없거나 서명이 틀리면 null입니다.
 */
export async function getPlayerId() {
  const jar = await cookies();
  return decodePlayerCookie(jar.get(GAME_STARTED_COOKIE)?.value);
}

/**
 * 식별값이 없으면 만들고, 있으면 그대로 둡니다. 예전 `"1"` 쿠키는 UUID로 바꿉니다.
 */
export async function ensurePlayer() {
  const jar = await cookies();
  const current = decodePlayerCookie(jar.get(GAME_STARTED_COOKIE)?.value);
  if (current) {
    try {
      await ensureGamePlayer(current);
    } catch {
      /* 테이블이 아직 없어도 게임은 진행합니다. */
    }
    return current;
  }
  const id = createPlayerId();
  jar.set(GAME_STARTED_COOKIE, encodePlayerCookie(id), playerCookieOptions());
  try {
    await ensureGamePlayer(id);
  } catch {
    /* 테이블이 아직 없어도 게임은 진행합니다. */
  }
  return id;
}

/** 튜토리얼에서 시작을 고르면 다시 보지 않도록 기록하고 식별값을 둡니다. */
export async function markGameStarted() {
  await ensurePlayer();
}

"use server";

import { cookies } from "next/headers";
import {
  GAME_STARTED_COOKIE,
  GAME_STARTED_MAX_AGE,
} from "@/src/util/main/tutorial";

/** 튜토리얼에서 시작을 고르면 다시 보지 않도록 기록합니다. */
export async function markGameStarted() {
  const jar = await cookies();
  jar.set(GAME_STARTED_COOKIE, "1", {
    path: "/",
    maxAge: GAME_STARTED_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
  });
}

import "server-only";

import pool from "@/src/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_FRIEND_COOLDOWN, SELECT_FRIENDS } from "./queries";
import type { FriendStatus } from "./types";

/**
 * 현재 사용자가 일촌인지, 해제 후 24시간 쿨다운 중인지를 조회합니다.
 *
 * @param userEmail - 상태를 확인할 사용자 이메일
 * @returns `isFriend` — 일촌 여부, `isInCooldown` — 재신청 대기 여부
 */
export async function getFriendStatus(userEmail: string): Promise<FriendStatus> {
  "use cache";
  cacheTag("friends");

  const [friendsResult, cooldownResult] = await Promise.all([
    pool.query(SELECT_FRIENDS, [userEmail]),
    pool.query(SELECT_FRIEND_COOLDOWN, [userEmail]),
  ]);

  return {
    isFriend: (friendsResult.rows?.length ?? 0) > 0,
    isInCooldown: (cooldownResult.rows?.length ?? 0) > 0,
  };
}
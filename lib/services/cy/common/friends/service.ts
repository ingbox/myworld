import "server-only";

import pool from "@/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_FRIEND_COOLDOWN, SELECT_FRIENDS } from "./queries";

export async function getFriendStatus(userEmail: string) {
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
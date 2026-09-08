import "server-only";

import pool from "@/src/lib/db";
import { cacheTag } from "next/cache";
import { SELECT_EMOJI, SELECT_STATUS_MESSAGE } from "./queries";
import type { EmojiData, StatusMessageData } from "./types";

/**
 * 가장 최근에 저장한 TODAY IS 이모지를 조회합니다.
 *
 * @returns 이모지 행. 없으면 null
 */
export async function getEmoji(): Promise<EmojiData | null> {
    "use cache";
    cacheTag("emoji");

    const result = await pool.query(SELECT_EMOJI);
    return (result.rows[0] as EmojiData | undefined) ?? null;
}

/**
 * 가장 최근에 저장한 상태 메시지를 조회합니다.
 *
 * @returns 상태 메시지 행. 없으면 null
 */
export async function getStatusMessage(): Promise<StatusMessageData | null> {
    "use cache";
    cacheTag("statusMessage");

    const result = await pool.query(SELECT_STATUS_MESSAGE);
    return (result.rows[0] as StatusMessageData | undefined) ?? null;
}
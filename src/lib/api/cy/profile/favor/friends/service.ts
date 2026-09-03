"use server";
import pool from "@/src/lib/db";
import { SELECT_FRIENDS } from "./queries";
import { cacheTag } from "next/cache";
import type { FriendData } from "./types";

/**
 * 일촌 목록을 이름 검색과 함께 조회합니다.
 * `search`가 빈 문자열이면 전체 일촌을 반환합니다.
 *
 * @param search - 이름 부분 검색어. 대소문자를 가리지 않습니다.
 * @returns `{ email, name, image_url }` 목록
 */
export async function getFriends(search: string): Promise<FriendData[]> {
    "use cache";
    cacheTag("friends");

    const result = await pool.query(SELECT_FRIENDS, [search])
    return (result.rows as FriendData[]) ?? [];
}

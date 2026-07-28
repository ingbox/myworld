"use server";
import pool from "@/lib/db";
import { SELECT_FRIENDS } from "./queries";
import { cacheTag } from "next/cache";

export async function getFriends(search: string) {
    "use cache";
    cacheTag("friends");

    const result = await pool.query(SELECT_FRIENDS, [search])
    return result.rows ?? [];
}

"use server"

import pool from "@/lib/db";
import { CREATE_ROOM } from "./queries";

export async function createRoom(user_email: string) {
    const result = await pool.query(CREATE_ROOM, [user_email]);
    return result.rows[0] as {
        id: string;
        user_email: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    };
}
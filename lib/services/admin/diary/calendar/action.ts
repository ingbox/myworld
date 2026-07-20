"use server"

import pool from "@/lib/db";
import { CREATE_DIARY_EVENT } from "./queries";

export default async function createDiaryEvent(data: any) {
    try {
        const { title, allDay, start, end, repeat, color, memo } = data;

        const startAt = allDay ? `${start}T00:00:00` : start;
        const endAt = allDay ? `${end}T23:59:59` : end;

        const result = await pool.query(CREATE_DIARY_EVENT, [title, allDay, startAt, endAt, repeat, color, memo, new Date(), new Date(), null]);
        return result.rows[0] as {
            id: string;
            title: string;
            allDay: boolean;
            start: Date;
            end: Date;
            repeat: string;
            color: string;
            memo: string;
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
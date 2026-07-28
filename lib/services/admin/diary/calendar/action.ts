"use server"

import pool from "@/lib/db";
import { CREATE_DIARY_EVENT, GET_DIARY_LIST, INSERT_DIARY } from "./queries";

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


export async function createDiary(data: any) {
    try {
        const { content, diaryDate } = data;
        const result = await pool.query(INSERT_DIARY, [content, diaryDate]);
        return result.rows[0].id;
    } catch (error) {
        console.error(error);
        throw new Error('다이어리 생성에 실패했습니다.');
    }
}

export async function getDiaryList(diaryDate: string) {
    try {
        const result = await pool.query(GET_DIARY_LIST, [diaryDate]);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new Error('다이어리 목록 조회에 실패했습니다.');
    }
}
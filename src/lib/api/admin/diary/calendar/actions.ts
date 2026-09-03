"use server";

import pool from "@/src/lib/db";
import { updateTag } from "next/cache";
import { CREATE_DIARY_EVENT, INSERT_DIARY } from "./queries";
import type {
  CreateDiaryEventRequest,
  CreateDiaryRequest,
  DiaryEventData,
} from "./types";

/**
 * 관리자에서 다이어리 캘린더 일정을 생성합니다.
 * 종일 일정이면 시작은 00:00, 종료는 23:59:59로 맞춥니다.
 *
 * @param data - 제목, 종일 여부, 시작/종료, 반복, 색, 메모
 * @returns 생성된 일정 행
 * @throws DB 저장에 실패한 경우
 */
export default async function createDiaryEvent(data: CreateDiaryEventRequest) {
  try {
    const { title, allDay, start, end, repeat, color, memo } = data;

    const startAt = allDay ? `${start}T00:00:00` : start;
    const endAt = allDay ? `${end}T23:59:59` : end;

    const result = await pool.query(CREATE_DIARY_EVENT, [
      title,
      allDay,
      startAt,
      endAt,
      repeat,
      color,
      memo,
      new Date(),
      new Date(),
      null,
    ]);
    updateTag("diaryEvents");
    return result.rows[0] as DiaryEventData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * 관리자에서 특정 날짜의 다이어리 글을 작성합니다.
 *
 * @param data - 본문과 다이어리 날짜
 * @param data.content - 다이어리 본문
 * @param data.diaryDate - 글을 붙일 날짜
 * @returns 생성된 다이어리 id
 * @throws 저장에 실패한 경우
 */
export async function createDiary(data: CreateDiaryRequest) {
  try {
    const { content, diaryDate } = data;
    const result = await pool.query(INSERT_DIARY, [content, diaryDate]);
    return result.rows[0].id as number;
  } catch (error) {
    console.error(error);
    throw new Error("다이어리 생성에 실패했습니다.");
  }
}

"use server";

import pool from "@/src/lib/db";
import { GET_DIARY_LIST } from "./queries";
import { getDiaryEvents as getDiaryEventsFromService } from "./service";
import type { DiaryData, DiaryEventsResponse } from "./types";

/**
 * 특정 날짜의 다이어리 글을 조회합니다.
 *
 * @param diaryDate - 조회할 날짜 (`YYYY-MM-DD` 등 DB에 넣는 형식)
 * @returns 해당 날짜의 다이어리 목록
 * @throws 조회에 실패한 경우
 */
export async function getDiaryList(diaryDate: string) {
  try {
    const result = await pool.query(GET_DIARY_LIST, [diaryDate]);
    return result.rows as DiaryData[];
  } catch (error) {
    console.error(error);
    throw new Error("다이어리 목록 조회에 실패했습니다.");
  }
}

/**
 * 다이어리 캘린더 일정을 조회합니다. 클라이언트 훅에서 호출합니다.
 *
 * @returns `{ events }` — 반복/종일 여부를 포함한 일정 배열
 */
export async function getDiaryEvents(): Promise<DiaryEventsResponse> {
  return getDiaryEventsFromService();
}

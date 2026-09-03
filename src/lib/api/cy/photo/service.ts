import "server-only";

import pool from "@/src/lib/db";
import { cacheTag } from "next/cache";
import {
  GET_PHOTO_LIST,
  SELECT_PHOTO_TOTAL_COUNT,
  SELECT_PHOTO_TYPE,
} from "./queries";
import type { PhotoData, PhotoPaginationResult, PhotoTypeData } from "./types";

/**
 * 사진첩 목록을 페이지 단위로 조회합니다.
 * 한 페이지당 3개이며, `photoList` 캐시를 사용합니다.
 *
 * @param page - 1부터 시작하는 페이지 번호. 1보다 작으면 1로 보정됩니다.
 * @param type - 사진첩 종류 id. 없거나 `0`이면 전체를 조회합니다.
 * @returns 사진 목록과 전체 개수
 */
export async function getPhotoList(
  page: number,
  type?: number
): Promise<PhotoPaginationResult> {
  "use cache";
  cacheTag("photoList");
  cacheTag(`photoList-${page}-${type ?? 0}`);

  const pageNum = Math.max(1, page);

  const limit = 3;
  const offset = (pageNum - 1) * limit;

  const list = await pool.query(
    GET_PHOTO_LIST,
    [limit, offset, type ?? 0]
  );

  const total = await pool.query(
    SELECT_PHOTO_TOTAL_COUNT,
    [type ?? 0]
  );

  return {
    photos: list.rows as PhotoData[],
    totalCount: Number(total.rows[0]?.total_count ?? 0),
  };
}

/**
 * 사진첩 종류 목록을 조회합니다. id가 `0`인 기본값은 제외합니다.
 *
 * @returns `{ id, name }` 형태의 종류 목록
 */
export async function getPhotoTypeList(): Promise<PhotoTypeData[]> {
    "use cache";
    cacheTag("photoType");
  
    const result = await pool.query(SELECT_PHOTO_TYPE);
    return result.rows as PhotoTypeData[];
  }
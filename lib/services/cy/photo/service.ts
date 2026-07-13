import "server-only";

import pool from "@/lib/db";
import { cacheTag } from "next/cache";
import {
  GET_PHOTO_LIST,
  SELECT_PHOTO_TOTAL_COUNT,
  SELECT_PHOTO_TYPE,
} from "./queries";


type PhotoPaginationResult = {
  photos: any[];
  totalCount: number;
};


export async function getPhotoList(page: number, type?: number) {
  "use cache";
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


  const result: PhotoPaginationResult = {
    photos: list.rows,
    totalCount: Number(total.rows[0]?.total_count ?? 0),
  };

  return result;
}

export async function getPhotoTypeList() {
    "use cache";
    cacheTag("photoType");
  
    const result = await pool.query(SELECT_PHOTO_TYPE);
    return result.rows;
  }
import "server-only";

import pool from "@/src/lib/db";
import {
    SELECT_ALL_JUKEBOX_PAGINATED,
    SELECT_JUKEBOX_TOTAL_COUNT,
} from "./queries";
import { cacheTag } from "next/cache";
import type { JukeboxData, JukeboxPaginationResult } from "./types";

/**
 * 주크박스 곡 목록을 페이지 단위로 조회합니다.
 * 한 페이지당 10개이며, `jukeboxList` 캐시를 사용합니다.
 *
 * @param page - 1부터 시작하는 페이지 번호
 * @returns 곡 목록(`id`, `title`, `artist`, `download_url`)과 전체 개수
 */
export async function getJukeboxList(
    page: number = 1
): Promise<JukeboxPaginationResult> {
    "use cache";
    cacheTag('jukeboxList');
    
    const offset = (page - 1) * 10;

    const list = await pool.query(
        SELECT_ALL_JUKEBOX_PAGINATED,
        [offset]
    );

    const total = await pool.query(
        SELECT_JUKEBOX_TOTAL_COUNT
    );

    return {
        jukebox: list.rows as JukeboxData[],
        totalCount: Number(total.rows[0]?.total_count ?? 0),
    };
}
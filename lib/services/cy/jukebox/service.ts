import "server-only";

import pool from "@/lib/db";
import {
    SELECT_ALL_JUKEBOX_PAGINATED,
    SELECT_JUKEBOX_TOTAL_COUNT,
} from "./queries";
import { cacheTag } from "next/cache";

type JukeboxPaginationResult = {
    jukebox: any[];
    totalCount: number;
};


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
        jukebox: list.rows,
        totalCount: Number(total.rows[0]?.total_count ?? 0),
    };
}
import { cacheTag } from "next/cache";
import { JukeboxAdminList } from "./types";
import pool from "@/src/lib/db";
import { SELECT_ALL_JUKEBOX_ADMIN_LIST } from "./queries";

export async function getJukeboxList(): Promise<JukeboxAdminList[]> {
    "use cache";
    cacheTag('jukeboxAdminList');
    
    const list = await pool.query(
        SELECT_ALL_JUKEBOX_ADMIN_LIST,
    );

    return list.rows as JukeboxAdminList[];
  
}
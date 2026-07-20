import { cacheTag } from "next/cache";
import { SELECT_DIARY_EVENTS } from "./queries";
import pool from "@/lib/db";

export async function getDiaryEvents() {
    "use cache";
    cacheTag("diaryEvents");
    
    const list = await pool.query(SELECT_DIARY_EVENTS);
  
    const resp = {
      events: list.rows,
    };
  
    return resp;
}
  
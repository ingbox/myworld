import pool from "@/lib/db";
import { Elysia, t } from "elysia";
import { GET_ROOM_LIST, CREATE_ROOM } from "./queries";

const app = new Elysia({ prefix: "/api/chat" })
  // 방 목록 조회
  .get("/room", async () => {
    const result = await pool.query(GET_ROOM_LIST);
    return {
      result: result.rows,
    };
  })

export const GET = app.fetch;
export const POST = app.fetch;
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
  // 방 생성
  .post("/room", async ({ body }) => {
    const { user_email } = body;
    const result = await pool.query(CREATE_ROOM, [user_email]);
    const room = result.rows[0];
    return { result: room };
  }, {
    body: t.Object({
      user_email: t.String()
    })
  });

export const GET = app.fetch;
export const POST = app.fetch;
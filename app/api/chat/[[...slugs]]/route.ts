import pool from "@/lib/db";
import { Elysia, t } from "elysia";
import { CREATE_ROOM } from "./queries";

const app = new Elysia({ prefix: "/api/chat" })
  // 💡 방 생성 API만 깔끔하게 남겨둡니다.
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
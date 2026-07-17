import { Elysia, t } from "elysia";

import { cors } from "@elysia/cors";

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const GET_MESSAGES_LATEST = `
SELECT *
FROM chats
WHERE room_id = $1
ORDER BY created_at DESC
LIMIT $2;
`;

const GET_MESSAGES_BEFORE = `
SELECT *
FROM chats
WHERE room_id = $1
  AND created_at < $2::timestamptz
ORDER BY created_at DESC
LIMIT $3;
`;

const INSERT_MESSAGE = `
INSERT INTO chats (
    room_id,
    message,
    sender,
    name,
    created_at,
    updated_at
)
VALUES (
    $1,
    $2,
    $3,
    $4,
    NOW(),
    NOW()
)
RETURNING *;
`;

const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
    })
  )
  .ws("/ws/:roomId", {
    params: t.Object({
      roomId: t.String(),
    }),
    open(ws) {
      const { roomId } = ws.data.params;
      ws.subscribe(roomId);
      console.log(`🟢 JOIN ${roomId}`);
    },

    close(ws) {
      const { roomId } = ws.data.params;
      ws.unsubscribe(roomId);
      console.log(`🔴 LEAVE ${roomId}`);
    },
  })

  .get(
    "/messages/:roomId",
    async ({ params, query }) => {
      const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);

      const result = query.before
        ? await pool.query(GET_MESSAGES_BEFORE, [
            params.roomId,
            query.before,
            limit,
          ])
        : await pool.query(GET_MESSAGES_LATEST, [params.roomId, limit]);

      // DB는 최신순(DESC)으로 가져온 뒤, 화면 표시용으로 시간순(ASC)으로 뒤집음
      return result.rows.reverse();
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        before: t.Optional(t.String()),
      }),
    },
  )

  .post(
    "/message",
    async ({ body }) => {

      const result = await pool.query(INSERT_MESSAGE, [
        body.roomId,
        body.message,
        body.sender,
        body.name,
      ]);

      const saved = result.rows[0];
      app.server?.publish(body.roomId, JSON.stringify(saved));
      return saved;
    },
    {
      body: t.Object({
        roomId: t.String(),
        sender: t.String(),
        name: t.String(),
        message: t.String(),
      }),
    }
  )
  .listen(3005);

console.log("🚀 Chat Server Running :3005");
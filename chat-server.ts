import { Elysia, t } from "elysia";

import { cors } from "@elysia/cors";

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const GET_MESSAGES = `
SELECT *
FROM chats
WHERE room_id = $1
ORDER BY created_at ASC;
`;

const INSERT_MESSAGE = `
INSERT INTO chats (
    room_id,
    message,
    sender,
    created_at,
    updated_at
)
VALUES (
    $1,
    $2,
    $3,
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

  .get("/messages/:roomId", async ({ params }) => {
    const result = await pool.query(GET_MESSAGES, [params.roomId]);
    return result.rows;
  })

  .post(
    "/message",
    async ({ body }) => {

      const result = await pool.query(INSERT_MESSAGE, [
        body.roomId,
        body.message,
        body.sender,
      ]);

      const saved = result.rows[0];
      app.server?.publish(body.roomId, JSON.stringify(saved));
      return saved;
    },
    {
      body: t.Object({
        roomId: t.String(),
        sender: t.String(),
        message: t.String(),
      }),
    }
  )
  .listen(3005);

console.log("🚀 Chat Server Running :3005");
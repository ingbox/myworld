import { Elysia, t } from "elysia";
import { cors } from "@elysia/cors";
import Redis from "ioredis";
import pg from "pg";

const redis = new Redis(process.env.REDIS_URL as string);

function recentKey(roomId: string) {
  return `chat:recent:${roomId}`;
}

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

      if (query.before) {
        const result = await pool.query(GET_MESSAGES_BEFORE, [
          params.roomId,
          query.before,
          limit,
        ]);
        return result.rows.reverse();
      }

      const cached = await redis.get(recentKey(params.roomId));
      if (cached) {
        console.log("Redis HIT", params.roomId);
        return JSON.parse(cached);
      }

      console.log("Redis MISS", params.roomId);
      const result = await pool.query(GET_MESSAGES_LATEST, [
        params.roomId,
        limit,
      ]);

      const messages = result.rows.reverse();
      await redis.set(recentKey(params.roomId), JSON.stringify(messages), "EX", 300);
      return messages;

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
      await redis.del(recentKey(body.roomId));
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
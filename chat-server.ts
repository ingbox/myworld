import { Elysia, t } from "elysia";
import { cors } from "@elysia/cors";
import Redis from "ioredis";
import pg from "pg";

const redis = new Redis(process.env.REDIS_URL as string);

const CAT_SOUND_ROOM = "cats-sounds";
const CAT_SOUND_KEY = "cat:sounds";
const TWO_HOURS_SEC = 2 * 60 * 60;
const TWO_HOURS_MS = TWO_HOURS_SEC * 1000;
const CAT_SOUND_MAX = 100;
const AMBIENT_SOUNDS = ["야옹", "냐옹", "냥", "먀아", "그르릉", "하악", "냥냥", "미야우"];

function recentKey(roomId: string) {
  return `chat:recent:${roomId}`;
}

type CatSound = {
  id: string;
  text: string;
  createdAt: number;
};

async function pruneCatSounds() {
  await redis.zremrangebyscore(CAT_SOUND_KEY, 0, Date.now() - TWO_HOURS_MS);
}

async function addCatSound(text: string): Promise<CatSound> {
  const sound: CatSound = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    createdAt: Date.now(),
  };

  await pruneCatSounds();
  await redis.zadd(CAT_SOUND_KEY, sound.createdAt, JSON.stringify(sound));
  await redis.zremrangebyrank(CAT_SOUND_KEY, 0, -CAT_SOUND_MAX - 1);
  await redis.expire(CAT_SOUND_KEY, TWO_HOURS_SEC);

  return sound;
}

async function listCatSounds(): Promise<CatSound[]> {
  await pruneCatSounds();
  const rows = await redis.zrange(CAT_SOUND_KEY, "0", "-1");
  return rows.map((row) => JSON.parse(row) as CatSound);
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

  .get("/cat-sounds", async () => listCatSounds())

  .post(
    "/cat-sound",
    async ({ body, set }) => {
      const text = body.text.trim();
      if (!text) {
        set.status = 400;
        return { error: "text is required" };
      }

      const sound = await addCatSound(text);
      app.server?.publish(CAT_SOUND_ROOM, JSON.stringify(sound));
      return sound;
    },
    {
      body: t.Object({
        text: t.String({ minLength: 1, maxLength: 30 }),
      }),
    },
  )

  .listen(3005);

setInterval(() => {
  const text = AMBIENT_SOUNDS[Math.floor(Math.random() * AMBIENT_SOUNDS.length)];
  app.server?.publish(
    CAT_SOUND_ROOM,
    JSON.stringify({
      id: `ambient-${Date.now()}`,
      text,
      createdAt: Date.now(),
      ambient: true,
    }),
  );
}, 1500);

console.log("🚀 Chat Server Running :3005");
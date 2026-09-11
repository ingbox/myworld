-- 게임 방문자, 아이템 목록, 보유, 사용 기록
-- psql "$DATABASE_URL" -f src/lib/api/main/schema.sql

CREATE TABLE IF NOT EXISTS game_player (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_item (
  no INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  can_use BOOLEAN NOT NULL DEFAULT FALSE,
  can_album BOOLEAN NOT NULL DEFAULT FALSE,
  max_count INTEGER,
  max_per_player INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT game_item_max_count_chk CHECK (max_count IS NULL OR max_count >= 0),
  CONSTRAINT game_item_max_per_player_chk CHECK (max_per_player IS NULL OR max_per_player >= 0)
);

ALTER TABLE game_item ADD COLUMN IF NOT EXISTS max_count INTEGER;
ALTER TABLE game_item ADD COLUMN IF NOT EXISTS max_per_player INTEGER;
ALTER TABLE game_item DROP COLUMN IF EXISTS blurb;
ALTER TABLE game_item DROP COLUMN IF EXISTS sprite;
ALTER TABLE game_item DROP COLUMN IF EXISTS slug;
ALTER TABLE game_item DROP COLUMN IF EXISTS id;

CREATE TABLE IF NOT EXISTS game_player_item (
  player_id UUID NOT NULL REFERENCES game_player (id),
  item_no INTEGER NOT NULL REFERENCES game_item (no),
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (player_id, item_no)
);

CREATE INDEX IF NOT EXISTS game_player_item_item_no_idx
  ON game_player_item (item_no);

CREATE TABLE IF NOT EXISTS game_item_use (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES game_player (id),
  item_no INTEGER NOT NULL REFERENCES game_item (no),
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS game_item_use_player_idx
  ON game_item_use (player_id, used_at DESC);

CREATE INDEX IF NOT EXISTS game_item_use_item_idx
  ON game_item_use (item_no);

INSERT INTO game_item (no, name, can_use, can_album, max_count, max_per_player)
VALUES (1, '마녀의 캔디', TRUE, TRUE, NULL, 3)
ON CONFLICT (no) DO UPDATE SET
  name = EXCLUDED.name,
  can_use = EXCLUDED.can_use,
  can_album = EXCLUDED.can_album,
  max_count = EXCLUDED.max_count,
  max_per_player = EXCLUDED.max_per_player,
  updated_at = NOW();

INSERT INTO game_item (no, name, can_use, can_album, max_count, max_per_player)
VALUES (2, '돗돔', TRUE, TRUE, NULL, NULL)
ON CONFLICT (no) DO UPDATE SET
  name = EXCLUDED.name,
  can_use = EXCLUDED.can_use,
  can_album = EXCLUDED.can_album,
  max_count = EXCLUDED.max_count,
  max_per_player = EXCLUDED.max_per_player,
  updated_at = NOW();

-- 동굴 관문 문제. gate 0 은 낚시터 입구. 그다음부터는 안쪽 관문입니다.
CREATE TABLE IF NOT EXISTS game_cave_puzzle (
  gate INTEGER PRIMARY KEY CHECK (gate >= 0),
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS game_player_cave (
  player_id UUID NOT NULL REFERENCES game_player (id),
  gate INTEGER NOT NULL REFERENCES game_cave_puzzle (gate) ON DELETE CASCADE,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (player_id, gate)
);

CREATE INDEX IF NOT EXISTS game_player_cave_player_idx
  ON game_player_cave (player_id, solved_at DESC);

INSERT INTO game_cave_puzzle (gate, prompt, answer)
VALUES (0, '봉인된 동굴이다. 입구에 새겨진 글자를 맞춰라.', '열려야 참깨야')
ON CONFLICT (gate) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  answer = EXCLUDED.answer;

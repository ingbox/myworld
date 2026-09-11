export const UPSERT_GAME_PLAYER = `
  INSERT INTO game_player (id, created_at, last_seen_at)
  VALUES ($1::uuid, NOW(), NOW())
  ON CONFLICT (id)
  DO UPDATE SET last_seen_at = NOW()
  RETURNING id
`;

export const UPSERT_GAME_ITEM = `
  INSERT INTO game_item (
    no, name, can_use, can_album, max_count, max_per_player, updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, NOW())
  ON CONFLICT (no)
  DO UPDATE SET
    name = EXCLUDED.name,
    can_use = EXCLUDED.can_use,
    can_album = EXCLUDED.can_album,
    max_count = EXCLUDED.max_count,
    max_per_player = EXCLUDED.max_per_player,
    updated_at = NOW()
`;

export const SELECT_GAME_ITEM_LIST = `
  SELECT no, name, can_use, can_album, max_count, max_per_player
  FROM game_item
  ORDER BY no ASC
`;

export const SELECT_GAME_ITEM_BY_NO = `
  SELECT no, name, can_use, can_album, max_count, max_per_player
  FROM game_item
  WHERE no = $1
  LIMIT 1
`;

export const LOCK_GAME_ITEM = `
  SELECT no, name, can_use, can_album, max_count, max_per_player
  FROM game_item
  WHERE no = $1
  FOR UPDATE
`;

export const SELECT_ITEM_CIRCULATING = `
  SELECT COALESCE(SUM(count), 0)::int AS circulating
  FROM game_player_item
  WHERE item_no = $1
`;

export const SELECT_PLAYER_ITEMS = `
  SELECT
    i.no,
    i.name,
    i.can_use,
    i.can_album,
    i.max_count,
    i.max_per_player,
    p.count
  FROM game_player_item p
  JOIN game_item i ON i.no = p.item_no
  WHERE p.player_id = $1::uuid
    AND p.count > 0
  ORDER BY i.no ASC
`;

export const SELECT_PLAYER_HAS_ITEM = `
  SELECT count
  FROM game_player_item
  WHERE player_id = $1::uuid
    AND item_no = $2
  LIMIT 1
`;

export const LOCK_PLAYER_ITEM = `
  SELECT count
  FROM game_player_item
  WHERE player_id = $1::uuid
    AND item_no = $2
  FOR UPDATE
`;

export const UPSERT_PLAYER_ITEM = `
  INSERT INTO game_player_item (player_id, item_no, count, obtained_at, updated_at)
  VALUES ($1::uuid, $2, $3, NOW(), NOW())
  ON CONFLICT (player_id, item_no)
  DO UPDATE SET
    count = game_player_item.count + EXCLUDED.count,
    updated_at = NOW()
  RETURNING count
`;

export const DECREMENT_PLAYER_ITEM = `
  UPDATE game_player_item
  SET count = count - 1, updated_at = NOW()
  WHERE player_id = $1::uuid
    AND item_no = $2
    AND count >= 1
  RETURNING count
`;

export const INSERT_ITEM_USE = `
  INSERT INTO game_item_use (player_id, item_no, used_at)
  VALUES ($1::uuid, $2, NOW())
  RETURNING id, player_id, item_no, used_at
`;

export const SELECT_PLAYER_USES = `
  SELECT id, player_id, item_no, used_at
  FROM game_item_use
  WHERE player_id = $1::uuid
  ORDER BY used_at DESC
`;

export const SELECT_ITEM_USES = `
  SELECT id, player_id, item_no, used_at
  FROM game_item_use
  WHERE item_no = $1
  ORDER BY used_at DESC
`;

export const SELECT_PLAYER_HAS_USED_ITEM = `
  SELECT 1
  FROM game_item_use
  WHERE player_id = $1::uuid
    AND item_no = $2
  LIMIT 1
`;

export const SELECT_CAVE_PUZZLE_GATES = `
  SELECT gate
  FROM game_cave_puzzle
  ORDER BY gate ASC
`;

export const SELECT_CAVE_PUZZLE = `
  SELECT gate, prompt, answer
  FROM game_cave_puzzle
  WHERE gate = $1
  LIMIT 1
`;

export const SELECT_PLAYER_CAVE_GATES = `
  SELECT gate
  FROM game_player_cave
  WHERE player_id = $1::uuid
  ORDER BY gate ASC
`;

export const SELECT_PLAYER_CAVE_SOLVED = `
  SELECT 1
  FROM game_player_cave
  WHERE player_id = $1::uuid
    AND gate = $2
  LIMIT 1
`;

export const INSERT_PLAYER_CAVE = `
  INSERT INTO game_player_cave (player_id, gate, solved_at)
  VALUES ($1::uuid, $2, NOW())
  ON CONFLICT (player_id, gate) DO NOTHING
`;

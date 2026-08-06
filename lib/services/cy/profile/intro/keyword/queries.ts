export const SELECT_START_NODE = `
  SELECT id, title, content
  FROM keyword_node
  WHERE is_start = TRUE AND deleted_at IS NULL
  LIMIT 1
`;

export const SELECT_NODE_BY_ID = `
  SELECT id, title, content
  FROM keyword_node
  WHERE id = $1 AND deleted_at IS NULL
  LIMIT 1
`;

export const SELECT_ROUTES_BY_NODE_ID = `
  SELECT answer, next_node_id
  FROM keyword_route
  WHERE node_id = $1
  ORDER BY sort_order
`;

export const SELECT_PROGRESS_BY_USER_ID = `
  SELECT current_node_id, node_history
  FROM keyword_progress
  WHERE user_id = $1
  LIMIT 1
`;

export const SELECT_USER_ID_BY_EMAIL = `
  SELECT id FROM users WHERE email = $1 LIMIT 1
`;

export const UPSERT_KEYWORD_PROGRESS = `
  INSERT INTO keyword_progress (user_id, current_node_id, node_history, updated_at)
  VALUES ($1, $2, $3, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_node_id = EXCLUDED.current_node_id,
    node_history = EXCLUDED.node_history,
    updated_at = NOW()
`;

export const DELETE_KEYWORD_PROGRESS_BY_USER_ID = `
  DELETE FROM keyword_progress WHERE user_id = $1
`;
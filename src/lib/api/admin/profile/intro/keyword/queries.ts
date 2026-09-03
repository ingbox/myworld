export const SELECT_KEYWORD_NODE_LIST = `
  SELECT id, title, is_start
  FROM keyword_node
  WHERE deleted_at IS NULL
  ORDER BY id
`;

export const INSERT_KEYWORD_NODE = `
  INSERT INTO keyword_node (title, content, is_start)
  VALUES ($1, $2, $3)
  RETURNING id
`;

export const CLEAR_KEYWORD_START_NODES = `
  UPDATE keyword_node
  SET is_start = FALSE
  WHERE is_start = TRUE AND deleted_at IS NULL
`;

export const INSERT_KEYWORD_ROUTE = `
  INSERT INTO keyword_route (node_id, answer, next_node_id, sort_order)
  VALUES ($1, $2, $3, $4)
`;

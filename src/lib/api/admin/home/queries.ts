export const SELECT_MINIROOM_ITEMS = `
  SELECT id, name, url, width, height
  FROM miniroom_item
  WHERE deleted_at IS NULL
  ORDER BY id DESC
`;

export const INSERT_MINIROOM_ITEM = `
  INSERT INTO miniroom_item (name, url, width, height)
  VALUES ($1, $2, $3, $4)
  RETURNING id, name, url, width, height
`;

export const SELECT_MINIROOM = `
  SELECT id, layers, url, created_at, updated_at
  FROM miniroom
  ORDER BY id ASC
  LIMIT 1
`;

export const INSERT_MINIROOM = `
  INSERT INTO miniroom (layers, created_at, updated_at)
  VALUES ($1::jsonb, NOW(), NOW())
  RETURNING id, layers, url, created_at, updated_at
`;

export const UPDATE_MINIROOM = `
  UPDATE miniroom
  SET layers = $1::jsonb, updated_at = NOW()
  WHERE id = $2
  RETURNING id, layers, url, created_at, updated_at
`;

export const DELETE_MINIROOM_ITEM = `
  UPDATE miniroom_item
  SET deleted_at = NOW()
  WHERE id = $1 AND deleted_at IS NULL
  RETURNING id
`;
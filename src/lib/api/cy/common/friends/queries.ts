export const SELECT_FRIENDS = `
  SELECT u.email, u.name, u.image_url
  FROM friends f
  JOIN users u ON f.user_id = u.id
  WHERE 
  f.user_id = (SELECT id FROM users WHERE email = $1)
  AND f.deleted_at IS NULL;
`;

export const INSERT_FRIEND = `
  INSERT INTO friends (user_id, created_at)
  SELECT id, NOW()
  FROM users
  WHERE email = $1
  ON CONFLICT (user_id) DO UPDATE
  SET deleted_at = NULL;
`;

export const DELETE_FRIEND = `
  UPDATE friends
  SET deleted_at = NOW()
  WHERE user_id = (SELECT id FROM users WHERE email = $1)
  AND deleted_at IS NULL;
`;

export const SELECT_FRIEND_COOLDOWN = `
  SELECT deleted_at
  FROM friends f
  WHERE f.user_id = (SELECT id FROM users WHERE email = $1)
  AND f.deleted_at IS NOT NULL
  AND f.deleted_at > NOW() - INTERVAL '24 hours'
  LIMIT 1;
`;
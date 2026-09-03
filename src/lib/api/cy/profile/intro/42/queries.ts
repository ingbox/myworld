export const GET_ASK_MESSAGES_LATEST = `
  SELECT id, user_email, role, content, created_at
  FROM ask_messages
  WHERE user_email = $1
    AND deleted_at IS NULL
  ORDER BY created_at DESC
  LIMIT $2
`;

export const GET_ASK_MESSAGES_BEFORE = `
  SELECT id, user_email, role, content, created_at
  FROM ask_messages
  WHERE user_email = $1
    AND deleted_at IS NULL
    AND created_at < $2::timestamptz
  ORDER BY created_at DESC
  LIMIT $3
`;

export const INSERT_ASK_MESSAGE = `
  INSERT INTO ask_messages (user_email, role, content, created_at)
  VALUES ($1, $2, $3, NOW())
  RETURNING id, user_email, role, content, created_at
`;

export const COUNT_ASK_USER_TODAY = `
  SELECT COUNT(*)::int AS count
  FROM ask_messages
  WHERE user_email = $1
    AND role = 'user'
    AND (created_at AT TIME ZONE 'Asia/Seoul')::date
      = (NOW() AT TIME ZONE 'Asia/Seoul')::date
`;


export const GET_ASK_MESSAGES_FOR_AI = `
  SELECT role, content
  FROM (
    SELECT role, content, created_at
    FROM ask_messages
    WHERE user_email = $1
      AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT $2
  ) recent
  ORDER BY created_at ASC
`;

export const RESET_ASK_MESSAGES = `
  UPDATE ask_messages
  SET deleted_at = NOW()
  WHERE user_email = $1
    AND deleted_at IS NULL
`;
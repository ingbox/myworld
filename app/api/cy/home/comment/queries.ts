export const INSERT_PROFILE_COMMENT = `
  INSERT INTO profile_comment (
    user_email, user_name, content
  ) VALUES ($1, $2, $3)
  RETURNING *;
`;

export const SELECT_PROFILE_COMMENT = `
SELECT
  id,
  user_email,
  user_name,
  content,
  TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul',
    'YYYY.MM.DD'
  ) AS created_at_formatted
  FROM profile_comment
  WHERE
  deleted_at IS NULL
  AND
  parent_id IS NULL
  ORDER BY created_at DESC
  LIMIT 10;
`;

export const SELECT_PROFILE_COMMENT_COMMENT = `
  SELECT
  id,
  user_email,
  user_name,
  parent_id,
  content,
  TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul',
  'YYYY.MM.DD'
) AS created_at_formatted
  FROM profile_comment
  WHERE
  deleted_at IS NULL
  AND
  parent_id = ANY($1)
`;
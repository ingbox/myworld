export const GET_BOARD_LIST = `
SELECT id, title,
  TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul',
  'YYYY.MM.DD'
  ) AS created_at_formatted
  FROM board
  WHERE 
  deleted_at IS NULL
  AND ($3 = 0 OR type_id = $3)
  ORDER BY created_at DESC LIMIT $1 OFFSET $2;
`;

export const SELECT_BOARD_TOTAL_COUNT = `
  SELECT 
    COUNT(*) AS total_count 
  FROM board 
  WHERE
  ($1 = 0 OR type_id = $1)
  AND deleted_at IS NULL;
`;

export const GET_BOARD_CONTENT = `
SELECT
    b.id,
    b.title,
    b.content,
    b.type_id,
    b.created_at,
    TO_CHAR(b.created_at, 'YYYY.MM.DD HH24:MI') AS created_at_formatted
FROM board b
WHERE b.id = $1
AND deleted_at IS NULL
LIMIT 1
`;
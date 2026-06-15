export const GET_PHOTO_LIST = `
SELECT id, title, content, 
  TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul',
  'YYYY.MM.DD HH24:MI'
  ) AS created_at_formatted
  FROM photo
  WHERE 
  deleted_at IS NULL
  AND ($3 = 0 OR type_id = $3)
  ORDER BY created_at DESC LIMIT $1 OFFSET $2;
`;

export const SELECT_PHOTO_TOTAL_COUNT = `
  SELECT 
    COUNT(*) AS total_count 
  FROM photo 
  WHERE
  ($1 = 0 OR type_id = $1)
  AND deleted_at IS NULL;
`;
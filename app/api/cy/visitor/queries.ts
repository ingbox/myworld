export const INSERT_VISITOR = `
  INSERT INTO visitor (
    user_email, user_name, profile_image_url, content, is_secret, ip_address
  ) VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;
`;

export const SELECT_ALL_VISITORS_PAGINATED = `
SELECT
  id,
  user_email,
  user_name,
  profile_image_url,
  CASE
    -- Admin은 모든 content 보기
    WHEN $3 = 'ADMIN' THEN content
    -- 로그인하지 않은 경우: is_secret=true인 글은 숨김, 나머지는 content 출력
    WHEN $3 IS NULL AND is_secret = true THEN NULL
    -- 일반 유저: is_secret=true이면서 본인이 아닐 경우 content 숨기기
    WHEN $3 = 'USER' AND user_email <> $2 AND is_secret = true THEN NULL
    -- 그 외 situações (예: 로그인하지 않은 상태이거나 일반 유저, 그리고 is_secret=false 또는 본인의 글) → content 허용
    ELSE content
  END AS content,
  is_secret,
TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul',
  'YYYY.MM.DD HH24:MI'
) AS created_at_formatted
  FROM visitor
  WHERE
  deleted_at IS NULL
  AND
  parent_id IS NULL
  ORDER BY created_at DESC
  LIMIT 10 OFFSET $1;
`;

export const SELECT_ALL_VISITORS_COMMENTS = `
  SELECT
  id,
  user_email,
  user_name,
  parent_id,
  CASE
    -- Admin은 모든 content 보기
    WHEN $3 = 'ADMIN' THEN content
    -- 로그인하지 않은 경우: is_secret=true인 글은 숨김, 나머지는 content 출력
    WHEN $3 IS NULL AND is_secret = true THEN NULL
    -- 일반 유저: is_secret=true이면서 본인이 아닐 경우 content 숨기기
    WHEN $3 = 'USER' AND user_email <> $2 AND is_secret = true THEN NULL
    -- 그 외 situações (예: 로그인하지 않은 상태이거나 일반 유저, 그리고 is_secret=false 또는 본인의 글) → content 허용
    ELSE content
  END AS content,
  TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul',
  'YYYY.MM.DD HH24:MI'
) AS created_at_formatted
  FROM visitor
  WHERE
  deleted_at IS NULL
  AND
  parent_id = ANY($1)
`;

export const SELECT_VISITOR_TOTAL_COUNT = `
  SELECT COUNT(*) AS total_count FROM visitor WHERE deleted_at IS NULL AND parent_id IS NULL;
`;

export const SELECT_VISITOR_PROFILE_IMAGE = `
  SELECT profile_image_url, s3_image_url FROM visitor WHERE profile_image_url = $1;
`;

export const UPDATE_VISITOR_IS_SECRET = `
  UPDATE visitor SET is_secret = true WHERE id = $1;
`;
export const SELECT_CONTENT_COUNT = `
SELECT
  -- photo
  
  (SELECT COUNT(*) FROM photo WHERE deleted_at IS NULL) AS photo_total,

  (SELECT COUNT(*) FROM photo 
    WHERE deleted_at IS NULL 
    AND created_at >= CURRENT_DATE 
    AND created_at < CURRENT_DATE + INTERVAL '1 day'
  ) AS photo_today,

  -- visitor

  (SELECT COUNT(*) FROM visitor WHERE deleted_at IS NULL) AS visitor_total,

  (SELECT COUNT(*) FROM visitor 
    WHERE deleted_at IS NULL 
    AND created_at >= CURRENT_DATE 
    AND created_at < CURRENT_DATE + INTERVAL '1 day'
  ) AS visitor_today,

  -- jukebox

  (SELECT COUNT(*) FROM jukebox WHERE deleted_at IS NULL) AS jukebox_total,

  (SELECT COUNT(*) FROM jukebox 
    WHERE deleted_at IS NULL 
    AND created_at >= CURRENT_DATE 
    AND created_at < CURRENT_DATE + INTERVAL '1 day'
  ) AS jukebox_today,

  -- board

  (SELECT COUNT(*) FROM board WHERE deleted_at IS NULL) AS board_total,

  (SELECT COUNT(*) FROM board
    WHERE deleted_at IS NULL 
    AND created_at >= CURRENT_DATE 
    AND created_at < CURRENT_DATE + INTERVAL '1 day'
  ) AS board_today;
`;

export const SELECT_UPDATED_NEWS = `
SELECT 
    id,
    content AS content,
    created_at,
    'visitor' AS type
FROM visitor
WHERE parent_id IS NULL
AND deleted_at IS NULL

UNION ALL

SELECT 
    id,
    title AS content,
    created_at,
    'photo' AS type
FROM photo
WHERE deleted_at IS NULL

UNION ALL

SELECT
    id,
    title AS content,
    created_at,
    'board' AS type
FROM board
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 4;
;
`;

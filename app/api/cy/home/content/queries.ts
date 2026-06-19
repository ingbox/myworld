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
  ) AS jukebox_today;
`;

export const SELECT_JUKEBOX_TOTAL_COUNT = `
  SELECT COUNT(*) AS total_count FROM jukebox;
`;
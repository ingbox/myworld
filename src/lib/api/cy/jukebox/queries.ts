export const SELECT_ALL_JUKEBOX_PAGINATED = `
SELECT
  id,
  title,
  artist,
  download_url
  FROM jukebox
  ORDER BY id
  LIMIT 10 OFFSET $1;
`;

export const SELECT_JUKEBOX_TOTAL_COUNT = `
  SELECT COUNT(*) AS total_count FROM jukebox;
`;
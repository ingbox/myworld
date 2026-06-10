export const GET_PHOTO_LIST = `
SELECT * FROM photo WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2;
`;

export const SELECT_PHOTO_TOTAL_COUNT = `
  SELECT COUNT(*) AS total_count FROM photo WHERE deleted_at IS NULL;
`;
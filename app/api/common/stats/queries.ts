export const GET_USER_STATS = `
  SELECT *
  FROM user_stats
  WHERE user_id = $1;
`
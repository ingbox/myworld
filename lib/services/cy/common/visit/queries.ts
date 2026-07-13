export const SELECT_VISIT_COUNT = `
SELECT
  SUM(visit_count) AS total_count,
  SUM(CASE WHEN visit_date = CURRENT_DATE THEN visit_count ELSE 0 END) AS today_count
FROM visit_counts;
`;
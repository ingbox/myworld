export const SELECT_VISIT_COUNT = `
SELECT
  SUM(visit_count) AS total_count,
  SUM(CASE WHEN visit_date = CURRENT_DATE THEN visit_count ELSE 0 END) AS today_count
FROM visit_counts;
`;

export const INSERT_VISIT_COUNT = `
  INSERT INTO visit_counts (visit_date, visit_count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (visit_date)
  DO UPDATE SET visit_count = visit_counts.visit_count + 1,
    updated_at = NOW();
`



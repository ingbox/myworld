export const INSERT_VISIT_COUNT = `
  INSERT INTO visit_counts (visit_date, visit_count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (visit_date)
  DO UPDATE SET visit_count = visit_counts.visit_count + 1,
    updated_at = NOW();
`
export const SELECT_REPORT_LOG = `
  SELECT * FROM visitor_report_logs WHERE visitor_id = $1 AND user_email = $2;
`;

export const UPDATE_VISITOR_REPORT = `
  UPDATE visitor SET report = report + 1 WHERE id = $1;
`;

export const INSERT_REPORT_LOG = `
  INSERT INTO visitor_report_logs (visitor_id, user_email) VALUES ($1, $2);
`;
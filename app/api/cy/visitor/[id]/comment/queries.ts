export const INSERT_VISITOR_COMMENT = `
  INSERT INTO visitor (
    user_email, user_name, content, ip_address, parent_id
  ) VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;
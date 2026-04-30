export const DELETE_VISITOR_COMMENT = `
  UPDATE visitor SET deleted_at = NOW() WHERE id = $1;
`;
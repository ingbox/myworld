export const UPDATE_VISITOR = `
  UPDATE visitor SET content = $1, updated_at = NOW() WHERE id = $2;
`;

export const DELETE_VISITOR = `
  UPDATE visitor SET deleted_at = NOW() WHERE id = $1;
`;
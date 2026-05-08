export const UPDATE_VISITOR_IS_SECRET = `
  UPDATE visitor SET is_secret = true WHERE id = $1;
`;
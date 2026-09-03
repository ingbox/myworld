export const INSERT_BOARD = `
INSERT INTO board (
  title,
  content,
  type_id
) VALUES ($1, $2, $3)
RETURNING id;
`;

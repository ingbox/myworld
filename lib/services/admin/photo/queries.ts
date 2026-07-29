export const INSERT_PHOTO = `
INSERT INTO photo (
  title,
  content,
  type_id
) VALUES ($1, $2, $3);
`;

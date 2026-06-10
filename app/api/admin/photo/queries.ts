export const INSERT_PHOTO = `
INSERT INTO photo (
  title,
  content
) VALUES ($1, $2);
`;
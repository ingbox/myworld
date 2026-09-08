export const SELECT_EMOJI = `
  SELECT emoji
  FROM emoji
  ORDER BY id DESC
  LIMIT 1;
`;

export const SELECT_STATUS_MESSAGE = `
  SELECT content
  FROM status_message
  ORDER BY id DESC
  LIMIT 1;
`;
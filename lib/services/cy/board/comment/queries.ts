export const GET_BOARD_COMMENT_LIST = `
  SELECT id, board_id, parent_id, user_name, user_email, content, 
   TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul',
  'YYYY.MM.DD HH24:MI'
) AS created_at_formatted
  FROM board_comment
  WHERE board_id = $1
  ORDER BY created_at ASC
`;

export const GET_BOARD_COMMENT_COUNT = `
  SELECT COUNT(*) FROM board_comment
  WHERE board_id = $1
`;

export const INSERT_BOARD_COMMENT = `
  INSERT INTO board_comment (board_id, parent_id, content, user_email, user_name, created_at)
  VALUES ($1, $2, $3, $4, $5, $6)
`;

export const GET_BOARD_COMMENT_BY_ID = `
  SELECT id, board_id, parent_id, user_email
  FROM board_comment
  WHERE id = $1
`;

export const DELETE_BOARD_COMMENT_REPLIES = `
  DELETE FROM board_comment
  WHERE parent_id = $1
`;

export const UPDATE_BOARD_COMMENT = `
  UPDATE board_comment
  SET content = $2
  WHERE id = $1
`;

export const DELETE_BOARD_COMMENT = `
  DELETE FROM board_comment
  WHERE id = $1
`;
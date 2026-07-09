export const GET_BOARD_CONTENT = `
SELECT
    b.id,
    b.title,
    b.content,
    b.type_id,
    b.created_at,
    TO_CHAR(b.created_at, 'YYYY.MM.DD HH24:MI') AS created_at_formatted
FROM board b
WHERE b.id = $1
AND deleted_at IS NULL
LIMIT 1
`;
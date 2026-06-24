export const SELECT_UPDATED_NEWS = `
SELECT 
    id,
    content AS content,
    created_at,
    'visitor' AS type
FROM visitor
WHERE parent_id IS NULL
UNION ALL
SELECT 
    id,
    title AS content,
    created_at,
    'photo' AS type
FROM photo
ORDER BY created_at DESC
LIMIT 4
;
`;

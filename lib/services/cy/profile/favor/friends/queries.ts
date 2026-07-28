export const SELECT_FRIENDS = `
    SELECT u.email, u.name, u.image_url
    FROM friends f
    JOIN users u ON f.user_id = u.id
    WHERE f.deleted_at IS NULL
    AND ($1 = '' OR u.name ILIKE '%' || $1 || '%')
    ORDER BY u.name;
`;
export const CREATE_DIARY_EVENT = `
    INSERT INTO diary_events (title, all_day, start, "end", repeat, color, memo, created_at, updated_at, deleted_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
`;

export const INSERT_DIARY = `
    INSERT INTO diary (content, diary_date)
    VALUES ($1, $2)
    RETURNING id
`;

export const GET_DIARY_LIST = `
    SELECT * FROM diary
    WHERE diary_date = to_date($1, 'YYYY-MM-DD')
    AND deleted_at IS NULL
    ORDER BY created_at ASC
`;
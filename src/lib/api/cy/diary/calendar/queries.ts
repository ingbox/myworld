export const GET_DIARY_LIST = `
    SELECT * FROM diary
    WHERE diary_date = to_date($1, 'YYYY-MM-DD')
    AND deleted_at IS NULL
    ORDER BY created_at ASC
`;

export const SELECT_DIARY_EVENTS = `
    SELECT * FROM diary_events
    WHERE deleted_at IS NULL
    ORDER BY start DESC
`;

export const SELECT_DIARY_EVENTS = `
    SELECT * FROM diary_events
    WHERE deleted_at IS NULL
    ORDER BY start DESC
`;
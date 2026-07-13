export const GET_ROOM_LIST = `
    SELECT *
    FROM rooms
    WHERE deleted_at IS NULL
    ORDER BY updated_at DESC;
`;

export const SELECT_ALL_JUKEBOX_ADMIN_LIST = `
    SELECT * FROM jukebox
    WHERE deleted_at IS NULL;
    ;
`;

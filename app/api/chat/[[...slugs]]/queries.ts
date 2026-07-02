export const CREATE_ROOM = `
WITH updated AS (
    UPDATE rooms
       SET updated_at = NOW()
     WHERE user_email = $1
       AND deleted_at IS NULL
     RETURNING *
),
inserted AS (
    INSERT INTO rooms (
        user_email,
        created_at,
        updated_at
    )
    SELECT
        $1,
        NOW(),
        NOW()
    WHERE NOT EXISTS (SELECT 1 FROM updated)
    RETURNING *
)
SELECT * FROM updated
UNION ALL
SELECT * FROM inserted;
`

export const INSERT_MESSAGE = `
  INSERT INTO chats (room_id, message, sender, created_at, updated_at)
  VALUES ($1, $2, $3, NOW(), NOW())
  RETURNING *;
`;
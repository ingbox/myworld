export const GET_USER_STATS = `
  SELECT *
  FROM user_stats
  WHERE user_id = $1;
`
export const UPDATE_USER_STATS = `
  UPDATE user_stats
    SET 
      erotic = $1::int,
      erotic_diff = $1::int - $6::int,
      famous = $2::int,
      famous_diff = $2::int - $7::int,
      friendly = $3::int,
      friendly_diff = $3::int - $8::int,
      karma = $4::int,
      karma_diff = $4::int - $9::int,
      kind = $5::int,
      kind_diff = $5::int - $10::int
    WHERE user_id = $11;
`;
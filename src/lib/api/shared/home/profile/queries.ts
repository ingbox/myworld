export const SELECT_PROFILE_IMAGE = `
 SELECT image_url
  FROM profile_images
  WHERE user_email = $1
  ORDER BY created_at DESC
  LIMIT 1;
`;
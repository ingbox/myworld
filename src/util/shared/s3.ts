// lib/uploadToS3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadObjectToS3(
  key: string,
  body: Buffer,
  contentType: string,
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;
}

export async function getSignedURL(key: string, contentType?: string) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key, // 예: 'uploads/filename.png'
    ...(contentType ? { ContentType: contentType } : {}),
  };

  console.log("@@@params", params);

  const command = new PutObjectCommand(params);

  const signedURL = await getSignedUrl(s3, command, {
    expiresIn: 60,
    ...(contentType ? { signableHeaders: new Set(['content-type']) } : {}),
  })

  console.log("@@@signedURL", signedURL);

  // 업로드된 파일의 URL 반환
  return { success: { url: signedURL } }
}
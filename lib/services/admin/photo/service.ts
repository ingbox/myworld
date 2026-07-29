import "server-only";

import { uploadObjectToS3 } from "@/lib/s3";
import { isHeicFile, resolveImageMeta } from "@/lib/image-meta";

const HEIC_MESSAGE =
  "HEIC/HEIF 파일은 웹에서 표시할 수 없습니다. JPG로 변환한 뒤 다시 업로드해 주세요.";

export async function uploadImage(file: File) {
  if (!file) {
    throw new Error("파일이 없습니다.");
  }

  if (isHeicFile(file)) {
    throw new Error(HEIC_MESSAGE);
  }

  const { contentType, ext } = resolveImageMeta(file);

  if (!ext) {
    throw new Error("지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP)");
  }

  const baseName = file.name.replace(/\.[^/.]+$/i, "") || "image";
  const key = `cy/photo/${Date.now()}-${baseName}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const url = await uploadObjectToS3(key, buffer, contentType);

  return { url };
}

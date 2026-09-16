"use server";

import { prisma } from "@/src/lib/prisma";
import { scoreDrawing } from "./score";
import { uploadDrawingToS3 } from "./upload";
import type { CreateDrawingRequest, CreateDrawingResult } from "./types";

/**
 * 그린 고양이 그림을 S3에 올리고, CLIP으로 채점한 점수와 함께 `cat_drawing`에 저장합니다.
 * 채점이 실패해도 그림은 남기고 `score`만 `null`로 둡니다.
 *
 * @param data.catId - 따라 그린 원본 고양이 id
 * @param data.file - 캔버스를 PNG로 변환한 파일
 * @returns 저장된 그림 한 건
 * @throws 원본 고양이가 없거나 업로드·저장에 실패한 경우
 */
export async function createDrawing({
  catId,
  file,
}: CreateDrawingRequest): Promise<CreateDrawingResult> {
  const cat = await prisma.cat.findUnique({
    where: { id: catId },
    select: { id: true, url: true },
  });

  if (!cat) {
    throw new Error("원본 고양이를 찾을 수 없습니다.");
  }

  const [imageUrl, score] = await Promise.all([
    uploadDrawingToS3(cat.id, file),
    scoreDrawing(file, cat.url)
      .then((result) => result.score)
      .catch((err) => {
        console.error("scoreDrawing err:", err);
        return null;
      }),
  ]);

  const drawing = await prisma.catDrawing.create({
    data: {
      catId: cat.id,
      imageUrl,
      score,
    },
    select: {
      id: true,
      catId: true,
      imageUrl: true,
      score: true,
      createdAt: true,
    },
  });

  return { drawing: { ...drawing, catUrl: cat.url } };
}

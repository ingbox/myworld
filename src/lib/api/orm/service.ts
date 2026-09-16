"use server";

import { prisma } from "@/src/lib/prisma";
import type {
  CatData,
  CatDrawingListResult,
  CatPaginationResult,
} from "./types";

const PAGE_SIZE = 10;
const CAROUSEL_SIZE = 30;

export async function getCatList(
  excludeIds: string[] = [],
): Promise<CatPaginationResult> {
  const catsPromise =
    excludeIds.length === 0
      ? prisma.$queryRaw<CatData[]>`
          SELECT id, url FROM cat
          ORDER BY RANDOM()
          LIMIT ${PAGE_SIZE}
        `
      : prisma.$queryRaw<CatData[]>`
          SELECT id, url FROM cat
          WHERE NOT (id = ANY(${excludeIds}))
          ORDER BY RANDOM()
          LIMIT ${PAGE_SIZE}
        `;

  const [cats, totalCount] = await Promise.all([
    catsPromise,
    prisma.cat.count(),
  ]);

  return {
    cats,
    totalCount,
  };
}

/**
 * 캐러셀에 뿌릴 최근 그림 목록을 가져옵니다.
 *
 * @param limit - 가져올 개수, 기본 30장
 * @returns 최신순 그림 목록과 전체 개수
 */
export async function getDrawingList(
  limit: number = CAROUSEL_SIZE,
): Promise<CatDrawingListResult> {
  const [rows, totalCount] = await Promise.all([
    prisma.catDrawing.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        catId: true,
        imageUrl: true,
        score: true,
        createdAt: true,
        cat: { select: { url: true } },
      },
    }),
    prisma.catDrawing.count(),
  ]);

  const drawings = rows.map(({ cat, ...drawing }) => ({
    ...drawing,
    catUrl: cat.url,
  }));

  return { drawings, totalCount };
}

export async function getRandomCat(
  excludeIds: string[] = [],
): Promise<CatData | null> {
  const cats =
    excludeIds.length === 0
      ? await prisma.$queryRaw<CatData[]>`
          SELECT id, url FROM cat
          ORDER BY RANDOM()
          LIMIT 1
        `
      : await prisma.$queryRaw<CatData[]>`
          SELECT id, url FROM cat
          WHERE NOT (id = ANY(${excludeIds}))
          ORDER BY RANDOM()
          LIMIT 1
        `;

  return cats[0] ?? null;
}

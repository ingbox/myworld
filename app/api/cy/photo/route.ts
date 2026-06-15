import { NextRequest, NextResponse } from 'next/server';
import { GET_PHOTO_LIST, SELECT_PHOTO_TOTAL_COUNT } from './queries';
import pool from '@/lib/db';

type PhotoPaginationResult = {
  photos: any[];
  totalCount: number;
};

export async function GET(req: NextRequest): Promise<NextResponse> {

  const pageStr = req.nextUrl.searchParams.get('page') ?? '1';
  const type = Number(req.nextUrl.searchParams.get('type') ?? '0');
  const pageNum = Math.max(1, Number(pageStr));
  // 한 페이지에 3개씩 조회
  const limit = 3;
  const offset = (pageNum - 1) * 3;

  try {
    const list = await pool.query(GET_PHOTO_LIST, [limit, offset, type]);
    const total = await pool.query(SELECT_PHOTO_TOTAL_COUNT, [type]);
    const resp: PhotoPaginationResult = {
      photos: list.rows,
      totalCount: total.rows[0]?.total_count ?? 0,
    };
    return NextResponse.json(resp);
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
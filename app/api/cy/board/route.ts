import { NextRequest, NextResponse } from 'next/server';
import { GET_BOARD_LIST, SELECT_BOARD_TOTAL_COUNT } from './queries';
import pool from '@/lib/db';

type BoardPaginationResult = {
  boards: any[];
  totalCount: number;
};

export async function GET(req: NextRequest): Promise<NextResponse> {

  const pageStr = req.nextUrl.searchParams.get('page') ?? '1';
  const type = Number(req.nextUrl.searchParams.get('type') ?? '0');
  const pageNum = Math.max(1, Number(pageStr));
  // 한 페이지에 3개씩 조회
  const limit = 10;
  const offset = (pageNum - 1) * 3;

  try {
    const list = await pool.query(GET_BOARD_LIST, [limit, offset, type]);
    const total = await pool.query(SELECT_BOARD_TOTAL_COUNT, [type]);
    const resp: BoardPaginationResult = {
      boards: list.rows,
      totalCount: total.rows[0]?.total_count ?? 0,
    };
    return NextResponse.json(resp);
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
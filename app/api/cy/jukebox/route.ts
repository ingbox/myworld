import { NextRequest, NextResponse } from 'next/server';
import { SELECT_ALL_JUKEBOX_PAGINATED, SELECT_JUKEBOX_TOTAL_COUNT } from './queries';
import pool from '@/lib/db';


type JukeboxPaginationResult = {
    jukebox: any[];
    totalCount: number;
  };

// ====== GET Handler – 주크박스 음악 목록 조회 + 페이지네이션 ======
export async function GET(req: NextRequest): Promise<NextResponse> {
    const pageStr = req.nextUrl.searchParams.get('page') ?? '1';
    const pageNum = Math.max(1, Number(pageStr));
    const offset = (pageNum - 1) * 10;

    console.log("@@@:",pageStr);
  
    try {
      const list = await pool.query(SELECT_ALL_JUKEBOX_PAGINATED, [offset]);
      const total = await pool.query(SELECT_JUKEBOX_TOTAL_COUNT);
      const resp: JukeboxPaginationResult = {
        jukebox: list.rows,
        totalCount: total.rows[0]?.total_count ?? 0,
      };
  
      return NextResponse.json(resp);
    } catch (err) {
      console.error('GET err:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }
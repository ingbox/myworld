import { NextRequest, NextResponse } from 'next/server';
import { SELECT_VISIT_COUNT, INSERT_VISIT_COUNT } from './queries';
import pool from '@/lib/db';

// ====== GET Handler – 프로필 이미지 가져오기 ======
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const visitCount = await pool.query(SELECT_VISIT_COUNT);
    return NextResponse.json(visitCount.rows[0] ?? null);
  
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await pool.query(INSERT_VISIT_COUNT);
    return NextResponse.json(
      { message: '방문 통계 증가' },
      { status: 200 }
    );

  } catch (err) {

    console.error('POST err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
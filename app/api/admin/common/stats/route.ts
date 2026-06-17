import { NextRequest, NextResponse } from 'next/server';
import { GET_USER_STATS, UPDATE_USER_STATS } from './queries';
import pool from '@/lib/db';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const { erotic, famous, friendly, karma, kind, user_id } = body;
  // user_id 없으면 1로 고정
  const userId = user_id ?? 1;

  try {
    // 기존 값 조회
    const prevResult = await pool.query(GET_USER_STATS, [userId]);
    if (prevResult.rows.length === 0) {
      return NextResponse.json({ error: 'user_stats 없음' }, { status: 404 });
    }

    const prev = prevResult.rows[0];

    const result = await pool.query(UPDATE_USER_STATS, [
      erotic,
      famous,
      friendly,
      karma,
      kind,
      prev.erotic,
      prev.famous,
      prev.friendly,
      prev.karma,
      prev.kind,
      userId,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
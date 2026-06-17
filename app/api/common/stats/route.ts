import { NextRequest, NextResponse } from 'next/server';
import { GET_USER_STATS } from './queries';
import pool from '@/lib/db';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = 1; // 지금은 고정
    const result = await pool.query(GET_USER_STATS, [userId]);
    const stats = result.rows[0]; // 원본

    const userStats = Object.fromEntries(
      Object.keys(stats)
        .filter(key => !key.endsWith('_diff'))
        .filter(key => typeof stats[key as keyof typeof stats] === 'number')
        .map(key => [
          key,
          {
            value: Number(stats[key as keyof typeof stats]),
            diff: Number(stats[`${key}_diff` as keyof typeof stats] ?? 0),
          },
        ])
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'user_stats 없음' }, { status: 404 });
    }
    return NextResponse.json(userStats);
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
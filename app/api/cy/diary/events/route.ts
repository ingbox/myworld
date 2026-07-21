import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { SELECT_DIARY_EVENTS } from '@/lib/services/cy/diary/queries';

export async function GET() {
  try {
    const { rows } = await pool.query(SELECT_DIARY_EVENTS);
    return NextResponse.json({ events: rows });
  } catch (err) {
    console.error('GET /api/cy/diary/events err:', err);
    return NextResponse.json({ error: '일정을 불러오지 못했습니다.' }, { status: 500 });
  }
}

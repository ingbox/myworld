import { NextRequest, NextResponse } from 'next/server';
import { SELECT_CONTENT_COUNT } from './queries';
import pool from '@/lib/db';

// ====== GET Handler –  ======
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const result = await pool.query(SELECT_CONTENT_COUNT);
    const row = result.rows[0];
    const resp = {
      photo: {
        total: Number(row.photo_total ?? 0),
        today: Number(row.photo_today ?? 0),
      },
      visitor: {
        total: Number(row.visitor_total ?? 0),
        today: Number(row.visitor_today ?? 0),
      },

      jukebox: {
        total: Number(row.jukebox_total ?? 0),
        today: Number(row.jukebox_today ?? 0),
      },
    };

    return NextResponse.json(resp);
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
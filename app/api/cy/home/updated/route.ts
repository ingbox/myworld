import { NextRequest, NextResponse } from 'next/server';
import { SELECT_UPDATED_NEWS } from './queries';
import pool from '@/lib/db';

// ====== GET Handler –  ======
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const result = await pool.query(SELECT_UPDATED_NEWS);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
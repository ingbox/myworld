import { NextRequest, NextResponse } from 'next/server';
import { INSERT_VISIT_COUNT } from './queries';
import pool from '@/lib/db';

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
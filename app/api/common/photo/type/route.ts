import { NextRequest, NextResponse } from 'next/server';
import { SELECT_PHOTO_TYPE } from './queries';
import pool from '@/lib/db';

// ====== GET Handler – 사진첩 카테고리 가져오기 ======
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const photoType = await pool.query(SELECT_PHOTO_TYPE);
    return NextResponse.json(photoType.rows ?? null);
  
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
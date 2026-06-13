import { NextRequest, NextResponse } from 'next/server';
import { SELECT_PROFILE_IMAGE } from './queries';
import pool from '@/lib/db';

// ====== GET Handler – 프로필 이미지 가져오기 ======
export async function GET(req: NextRequest): Promise<NextResponse> {
  // 유저 이메일 가져오기
  const email = req.nextUrl.searchParams.get('email');

  try {
    const profileImage = await pool.query(SELECT_PROFILE_IMAGE, [email]);
    return NextResponse.json(profileImage.rows[0]?.image_url ?? null);
  
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
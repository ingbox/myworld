import { NextRequest, NextResponse } from 'next/server';
import {  INSERT_PHOTO } from './queries';
import pool from '@/lib/db';

// ====== POST Handler – 사진첩 생성 ======
export async function POST(req: NextRequest): Promise<NextResponse> {
    const { title, content, type } = await req.json();
    try {
      const result = await pool.query(INSERT_PHOTO, [title, content, type]);
      return NextResponse.json(result);
    } catch (err) {
      console.error('GET err:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }
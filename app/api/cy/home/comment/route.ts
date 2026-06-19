// app/cy/visitor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  INSERT_PROFILE_COMMENT,
  SELECT_PROFILE_COMMENT,
  SELECT_PROFILE_COMMENT_COMMENT
} from './queries';
import pool from '@/lib/db';

type PostFormData = {
  content?: string;
  user_name?: string;
  user_email?: string;
};

// ====== POST Handler – 새 방문자 정보 삽입 / 이미지 업로드 처리 ======
export async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData();
  const data: PostFormData = {
    content: formData.get('content') as string | undefined,
    user_name: formData.get('user_name') as string | undefined,
    user_email: formData.get('user_email') as string | undefined
  };

  try {
    const values = [
      data.user_email,
      data.user_name,
      data.content,
    ];
    const insert = await pool.query(INSERT_PROFILE_COMMENT, values);
    return NextResponse.json(insert.rows[0]);

  } catch (err) {
    console.error('POST err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ====== GET Handler – 방문자 목록 조회 + 페이지네이션 ======
export async function GET(req: NextRequest): Promise<NextResponse> {

  try {
    const list = await pool.query(SELECT_PROFILE_COMMENT);

    const resp = {
      comments: list.rows
    };
    
    const comments = await pool.query(SELECT_PROFILE_COMMENT_COMMENT, [resp.comments.map((visitor) => visitor.id)]);

    const groupedComments = comments.rows.reduce((acc, comment) => {
      if (!acc[comment.parent_id]) {
        acc[comment.parent_id] = [];
      }
      acc[comment.parent_id].push(comment);
      return acc;
    }, {});

    resp.comments.forEach(visitor => {
      visitor.comments = groupedComments[visitor.id] || [];
    });

    return NextResponse.json(resp);
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
// app/cy/visitor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  INSERT_VISITOR,
  SELECT_ALL_VISITORS_COMMENTS,
  SELECT_ALL_VISITORS_PAGINATED,
  SELECT_VISITOR_PROFILE_IMAGE,
  SELECT_VISITOR_TOTAL_COUNT,
} from './queries';
import pool from '@/lib/db';
import { getSignedURL } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';

type VisitorsPaginationResult = {
  visitors: any[];
  totalCount: number;
};

type PostFormData = {
  content?: string;
  user_name?: string;
  user_email?: string;
  profile_image?: string;
};

// ====== POST Handler – 새 방문자 정보 삽입 / 이미지 업로드 처리 ======
export async function POST(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData();
  const data: PostFormData = {
    content: formData.get('content') as string | undefined,
    user_name: formData.get('user_name') as string | undefined,
    user_email: formData.get('user_email') as string | undefined,
    profile_image: formData.get('profile_image') as string | undefined,
  };

  // let s3_image_url: string | null = null;
  const rawIp = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const ip = rawIp.split(',')[0].trim();
  const normalizedIp = ip === '::1' ? '127.0.0.1' : ip;


  console.log("@@@data", data);
  console.log("@@@normalizedIp", normalizedIp);

  try {
    // const existing = await pool.query(SELECT_VISITOR_PROFILE_IMAGE, [data.profile_image]);
    // if (existing.rows.length < 1 && data.profile_image) {
    //   const uuid = uuidv4();
    //   const date = new Date().toISOString().slice(0, 10);
    //   const res = await fetch(data.profile_image);
    //   if (!res.ok) throw new Error('Failed to fetch profile image');
    //   const contentType = res.headers.get('content-type') ?? '';
    //   const ext = contentType.includes('png')
    //     ? '.png'
    //     : contentType.includes('jpeg')
    //     ? '.jpg'
    //     : contentType.includes('gif')
    //     ? '.gif'
    //     : '';
    //   const key = `cy/visitor/${date}/${uuid}${ext}`;
    //   const blob = await res.blob();
    //   const signed = await getSignedURL(key);
    //   const uploadUrl = signed.success?.url;
    //   if (!uploadUrl) throw new Error('Failed to get signed URL');
    //   const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': blob.type } });
    //   if (!uploadRes.ok) throw new Error('Failed to upload image to S3');
    //   s3_image_url = uploadUrl.split('?')[0];
    // } else if (existing.rows[0]?.s3_image_url) {
      // s3_image_url = existing.rows[0].s3_image_url;
    // }

    const values = [
      data.user_email,
      data.user_name,
      data.profile_image,
      data.content,
      false,
      normalizedIp,
    ];
    const insert = await pool.query(INSERT_VISITOR, values);
    return NextResponse.json(insert.rows[0]);
  } catch (err) {
    console.error('POST err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ====== GET Handler – 방문자 목록 조회 + 페이지네이션 ======
export async function GET(req: NextRequest): Promise<NextResponse> {
  const pageStr = req.nextUrl.searchParams.get('page') ?? '1';
  const userEmail = req.nextUrl.searchParams.get('user_email');
  const userRole = req.nextUrl.searchParams.get('user_role');
  const pageNum = Math.max(1, Number(pageStr));
  const offset = (pageNum - 1) * 10;

  try {
    const list = await pool.query(SELECT_ALL_VISITORS_PAGINATED, [offset, userEmail, userRole]);
    const total = await pool.query(SELECT_VISITOR_TOTAL_COUNT);
    const resp: VisitorsPaginationResult = {
      visitors: list.rows,
      totalCount: total.rows[0]?.total_count ?? 0,
    };
    const comments = await pool.query(SELECT_ALL_VISITORS_COMMENTS, [resp.visitors.map((visitor) => visitor.id), userEmail, userRole]);

    const groupedComments = comments.rows.reduce((acc, comment) => {
      if (!acc[comment.parent_id]) {
        acc[comment.parent_id] = [];
      }
      acc[comment.parent_id].push(comment);
      return acc;
    }, {});

    resp.visitors.forEach(visitor => {
      visitor.comments = groupedComments[visitor.id] || [];
    });

    return NextResponse.json(resp);
  } catch (err) {
    console.error('GET err:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
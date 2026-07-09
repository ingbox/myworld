import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { INSERT_VISITOR_COMMENT } from "./queries";

type PostFormData = {
  id?: string;
  content?: string;
  user_name?: string;
  user_email?: string;
};

// ====== POST Handler – 새 방문자 정보 삽입 / 이미지 업로드 처리 ======
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const formData = await req.formData();

    const data: PostFormData = {
      id: id as string | undefined,
      content: formData.get('content') as string | undefined,
      user_name: formData.get('user_name') as string | undefined,
      user_email: formData.get('user_email') as string | undefined,
    };

    const rawIp = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    const normalizedIp = ip === '::1' ? '127.0.0.1' : ip;

    try {

      const values = [
        data.user_email,
        data.user_name,
        data.content,
        normalizedIp,
        data.id
      ];

      const insert = await pool.query(INSERT_VISITOR_COMMENT, values);
      
      return Response.json({
        success: true,
        message: '작성 완료.'
    });
    } catch (error) {

    }
}
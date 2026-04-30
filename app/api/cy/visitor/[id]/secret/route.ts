import { UPDATE_VISITOR_IS_SECRET } from './queries';
import pool from '@/lib/db';
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { rows } = await pool.query(UPDATE_VISITOR_IS_SECRET, [id]);          
    return Response.json({
        success: true,
        message: '방명록이 비밀로 설정되었습니다.'
    });
}
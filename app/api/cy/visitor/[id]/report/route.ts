import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { UPDATE_VISITOR_REPORT, INSERT_REPORT_LOG, SELECT_REPORT_LOG } from './queries';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userEmail } = await req.json();

    try {
        const { rows: reportLog } = await pool.query(SELECT_REPORT_LOG, [id, userEmail]);

        if (reportLog.length > 0) {
            return Response.json({
                success: false,
                message: '이미 신고되었습니다.'
            });
        } else {
            const { rows } = await pool.query(UPDATE_VISITOR_REPORT, [id]);
            const { rows: reportLog } = await pool.query(INSERT_REPORT_LOG, [id, userEmail]);
            return Response.json({
                success: true,
                message: '신고하였습니다.'
            });
        }
    } catch (error) {
        return Response.json({
            success: false,
            message: '신고에 실패하였습니다.'
        });
    }
}
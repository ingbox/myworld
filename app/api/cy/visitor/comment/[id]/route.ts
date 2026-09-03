import { NextRequest } from "next/server";
import pool from "@/src/lib/db";
import { DELETE_VISITOR_COMMENT } from "./queries";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { rows } = await pool.query(DELETE_VISITOR_COMMENT, [id]);
        return Response.json({ success: true, message: '댓글이 삭제되었습니다.' });
    } catch (err) {
        console.log("err:", err);
        if (err instanceof Error) {
            return Response.json({ error: err.message }, { status: 500 });
        }
        return Response.json({ error: 'Unknown error' }, { status: 500 });
    }
}
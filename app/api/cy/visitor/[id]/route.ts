import { NextRequest } from "next/server";
import pool from "@/src/lib/db";
import { UPDATE_VISITOR, DELETE_VISITOR } from "./queries";


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { content } = await req.json();
    try {
        const { rows } = await pool.query(UPDATE_VISITOR, [content, id]);
        return Response.json({ success: true, message: '댓글이 수정되었습니다.' });
    } catch (err) {
        console.log("err:", err);
        if (err instanceof Error) {
            return Response.json({ error: err.message }, { status: 500 });
        }
        return Response.json({ error: 'Unknown error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { rows } = await pool.query(DELETE_VISITOR, [id]);
        return Response.json({ success: true, message: '댓글이 삭제되었습니다.' });
    } catch (err) {
        console.log("err:", err);
        if (err instanceof Error) {
            return Response.json({ error: err.message }, { status: 500 });
        }
        return Response.json({ error: 'Unknown error' }, { status: 500 });
    }
}
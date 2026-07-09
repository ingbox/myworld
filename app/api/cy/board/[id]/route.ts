import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { GET_BOARD_CONTENT } from './queires';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    const { id } = await params;

    console.log("@@@@@@:", id);

    try {
      const result = await pool.query(GET_BOARD_CONTENT, [id]);
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "게시글을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
  
      return NextResponse.json(result.rows[0]);
  
    } catch (err) {
      console.error("GET err:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }
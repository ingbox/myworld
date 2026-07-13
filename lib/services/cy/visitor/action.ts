"use server";

import { headers } from "next/headers";
import { updateTag } from "next/cache";
import pool from "@/lib/db";
import { INSERT_VISITOR, INSERT_VISITOR_COMMENT, SELECT_REPORT_LOG, INSERT_REPORT_LOG, UPDATE_VISITOR_REPORT, UPDATE_VISITOR_IS_SECRET, UPDATE_VISITOR, DELETE_VISITOR, DELETE_VISITOR_COMMENT } from "./queries";
import { auth } from "@/app/auth";

export async function createVisitor(formData: FormData) {
    const content = formData.get("content") as string;
    const userName = formData.get("user_name") as string;
    const userEmail = formData.get("user_email") as string;
    const profileImage = formData.get("profile_image") as string;

    const forwardedFor = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
    const ip = forwardedFor.split(",")[0].trim();
    const normalizedIp = ip === "::1" ? "127.0.0.1" : ip;

    await pool.query(INSERT_VISITOR, [
        userEmail,
        userName,
        profileImage,
        content,
        false,
        normalizedIp,
    ]);

    updateTag("visitorList");
}

export async function createVisitorComment(formData: FormData) {
    const visitorId = formData.get("visitor_id") as string;
    const content = formData.get("content") as string;
    const userName = formData.get("user_name") as string;
    const userEmail = formData.get("user_email") as string;
    const forwardedFor = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
    const ip = forwardedFor.split(",")[0].trim();
    const normalizedIp = ip === "::1" ? "127.0.0.1" : ip;

    await pool.query(INSERT_VISITOR_COMMENT, [
        userEmail,
        userName,
        content,
        normalizedIp,
        visitorId,
    ]);

    updateTag("visitorList");
}


interface ReportParams {
    visitorId: number;
}

export async function reportVisitor({
    visitorId,
}: ReportParams) {

    try {
        const session = await auth();
        const userEmail = session?.user?.email;

        if (!userEmail) {
            return {
                success: false,
                message: "로그인이 필요합니다.",
            };
        }

        const { rows: reportLog } = await pool.query(
            SELECT_REPORT_LOG,
            [visitorId, userEmail]
        );

        if (reportLog.length > 0) {
            return {
                success: false,
                message: "이미 신고되었습니다.",
            };
        }

        await pool.query(
            UPDATE_VISITOR_REPORT,
            [visitorId]
        );

        await pool.query(
            INSERT_REPORT_LOG,
            [visitorId, userEmail]
        );

        updateTag("visitorList");

        return {
            success: true,
            message: "신고하였습니다.",
        };

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "신고에 실패하였습니다.",
        };
    }
}

export async function secretVisitor(visitorId: string) {
    try {
      await pool.query(
        UPDATE_VISITOR_IS_SECRET,
        [visitorId]
      );
      updateTag("visitorList");
      return {
        success: true,
        message: "방명록이 비밀로 설정되었습니다.",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "비밀 설정에 실패했습니다.",
      };
    }
  }

  export async function editVisitor(
    visitorId: string,
    content: string
  ) {
    try {
      await pool.query(
        UPDATE_VISITOR,
        [content, visitorId]
      );
      updateTag("visitorList");
    } catch (error) {
      console.error(error);
      throw new Error("방명록 수정 실패");
    }
  }

  export async function deleteVisitor({
    visitorId,
  }: {
    visitorId: string;
  }) {
    try {
      await pool.query(
        DELETE_VISITOR,
        [visitorId]
      );
      updateTag("visitorList");
    } catch (error) {
      console.error("deleteVisitor error:", error);
      throw new Error("방명록 삭제 실패");
    }
  }

  export async function deleteComment(commentId: string) {
    try {
      await pool.query(
        DELETE_VISITOR_COMMENT,
        [commentId]
      );
      updateTag("visitorList");
    } catch (error) {
      console.error("deleteComment error:", error);
      throw new Error("댓글 삭제 실패");
    }
  }
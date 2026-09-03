"use server";

import { headers } from "next/headers";
import { updateTag } from "next/cache";
import pool from "@/src/lib/db";
import { INSERT_VISITOR, INSERT_VISITOR_COMMENT, SELECT_REPORT_LOG, INSERT_REPORT_LOG, UPDATE_VISITOR_REPORT, UPDATE_VISITOR_IS_SECRET, UPDATE_VISITOR, DELETE_VISITOR, DELETE_VISITOR_COMMENT } from "./queries";
import { auth } from "@/app/auth";
import type {
  DeleteVisitorRequest,
  ReportVisitorRequest,
  VisitorActionResult,
} from "./types";

/**
 * 방명록 글을 작성합니다. 클라이언트 IP를 함께 저장하고 `visitorList` 캐시를 갱신합니다.
 *
 * @param formData - `content`, `user_name`, `user_email`, `profile_image`
 */
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

/**
 * 방명록 글에 댓글을 작성합니다. `visitorList` 캐시를 갱신합니다.
 *
 * @param formData - `visitor_id`, `content`, `user_name`, `user_email`
 */
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


/**
 * 방명록 글을 신고합니다. 같은 사용자는 한 글에 한 번만 신고할 수 있습니다.
 *
 * @param params - 신고할 방명록 id
 * @param params.visitorId - 방명록 id
 * @returns 성공 여부와 안내 메시지. 미로그인·중복 신고·실패 시 `success: false`
 */
export async function reportVisitor({
    visitorId,
}: ReportVisitorRequest): Promise<VisitorActionResult> {

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

/**
 * 방명록 글을 비밀글로 바꿉니다. 본문 공개 여부는 목록 조회 시 권한에 따라 가려집니다.
 *
 * @param visitorId - 비밀로 설정할 방명록 id
 * @returns 성공 여부와 안내 메시지
 */
export async function secretVisitor(
    visitorId: string
): Promise<VisitorActionResult> {
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

/**
 * 방명록 글 본문을 수정합니다.
 *
 * @param visitorId - 수정할 방명록 id
 * @param content - 새 본문
 * @throws 수정에 실패한 경우
 */
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

/**
 * 방명록 글을 소프트 삭제합니다. (`deleted_at` 기록)
 *
 * @param params.visitorId - 삭제할 방명록 id
 * @throws 삭제에 실패한 경우
 */
  export async function deleteVisitor({
    visitorId,
  }: DeleteVisitorRequest) {
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

/**
 * 방명록 댓글을 소프트 삭제합니다. (`deleted_at` 기록)
 *
 * @param commentId - 삭제할 댓글 id
 * @throws 삭제에 실패한 경우
 */
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
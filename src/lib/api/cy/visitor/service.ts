import "server-only";

import pool from "@/src/lib/db";

import {
  SELECT_ALL_VISITORS_PAGINATED,
  SELECT_VISITOR_TOTAL_COUNT,
  SELECT_ALL_VISITORS_COMMENTS,
} from "./queries";

import { cacheTag } from "next/cache";
import type {
  VisitorCommentData,
  VisitorData,
  VisitorListParams,
  VisitorPaginationResult,
} from "./types";

/**
 * 방명록 목록과 각 글의 댓글을 페이지 단위로 조회합니다.
 * 비밀글은 `userRole`/`userEmail`에 따라 본문이 `null`로 가려집니다.
 *
 * @param params - 페이지와 현재 사용자 정보
 * @param params.page - 1부터 시작하는 페이지 번호. 한 페이지당 10개입니다.
 * @param params.userEmail - 로그인한 사용자 이메일. 본인 비밀글 조회에 사용합니다.
 * @param params.userRole - `ADMIN`이면 비밀글 본문까지 모두 볼 수 있습니다.
 * @returns 방명록 목록(`comments` 포함)과 전체 개수
 */
export async function getVisitorList({
  page,
  userEmail,
  userRole,
}: VisitorListParams): Promise<VisitorPaginationResult> {
  "use cache";
  cacheTag("visitorList");

  const offset = (page - 1) * 10;
  const list = await pool.query(
    SELECT_ALL_VISITORS_PAGINATED,
    [offset, userEmail, userRole]
  );

  const total = await pool.query(SELECT_VISITOR_TOTAL_COUNT);
  const resp: VisitorPaginationResult = {
    visitors: list.rows as VisitorData[],
    totalCount: Number(total.rows[0]?.total_count ?? 0),
  };

  if (resp.visitors.length === 0) {
    return resp;
  }

  const comments = await pool.query(
    SELECT_ALL_VISITORS_COMMENTS,
    [resp.visitors.map((v) => v.id), userEmail, userRole]
  );

  const groupedComments = (comments.rows as VisitorCommentData[]).reduce(
    (acc, comment) => {
      (acc[comment.parent_id] ??= []).push(comment);
      return acc;
    },
    {} as Record<number, VisitorCommentData[]>
  );

  resp.visitors.forEach((visitor) => {
    visitor.comments = groupedComments[visitor.id] ?? [];
  });

  return resp;
}
import "server-only";

import pool from "@/lib/db";

import {
  SELECT_ALL_VISITORS_PAGINATED,
  SELECT_VISITOR_TOTAL_COUNT,
  SELECT_ALL_VISITORS_COMMENTS,
} from "./queries";

import { cacheTag } from "next/cache";

interface PaginationParams {
  page: number;
  userEmail?: string;
  userRole?: string;
}

export async function getVisitorList({
  page,
  userEmail,
  userRole,
}: PaginationParams) {
  "use cache";
  cacheTag("visitorList");

  const offset = (page - 1) * 10;
  const list = await pool.query(
    SELECT_ALL_VISITORS_PAGINATED,
    [offset, userEmail, userRole]
  );

  const total = await pool.query(SELECT_VISITOR_TOTAL_COUNT);
  const resp = {
    visitors: list.rows,
    totalCount: total.rows[0]?.total_count ?? 0,
  };

  if (resp.visitors.length === 0) {
    return resp;
  }

  const comments = await pool.query(
    SELECT_ALL_VISITORS_COMMENTS,
    [resp.visitors.map((v) => v.id), userEmail, userRole]
  );

  const groupedComments = comments.rows.reduce((acc, comment) => {
    (acc[comment.parent_id] ??= []).push(comment);
    return acc;
  }, {} as Record<number, typeof comments.rows>);

  resp.visitors.forEach((visitor) => {
    visitor.comments = groupedComments[visitor.id] ?? [];
  });

  return resp;
}
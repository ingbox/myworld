import "server-only";

import pool from "@/src/lib/db";
import {
  SELECT_PROFILE_COMMENT,
  SELECT_PROFILE_COMMENT_COMMENT
} from "./queries";
import { cacheTag } from "next/cache";
import type {
  ProfileCommentData,
  ProfileCommentListResult,
  ProfileCommentReplyData,
} from "./types";

/**
 * 홈 일촌평(프로필 댓글) 최근 10개를 조회합니다.
 * 각 댓글에 대댓글을 `comments`로 붙여 반환합니다.
 *
 * @returns `{ comments }` — 최상위 댓글과 그 대댓글
 */
export async function getProfileComment(): Promise<ProfileCommentListResult> {
  "use cache";
  cacheTag("profileComment");
  
  const list = await pool.query(SELECT_PROFILE_COMMENT);

  const resp: ProfileCommentListResult = {
    comments: (list.rows as Omit<ProfileCommentData, "comments">[]).map(
      (comment) => ({
        ...comment,
        comments: [],
      })
    ),
  };

  const comments = await pool.query(
    SELECT_PROFILE_COMMENT_COMMENT,
    [resp.comments.map((comment) => comment.id)]
  );

  const groupedComments = (comments.rows as ProfileCommentReplyData[]).reduce(
    (acc, comment) => {
      if (!acc[comment.parent_id]) {
        acc[comment.parent_id] = [];
      }
      acc[comment.parent_id].push(comment);
      return acc;
    },
    {} as Record<number, ProfileCommentReplyData[]>
  );

  resp.comments.forEach((comment) => {
    comment.comments = groupedComments[comment.id] ?? [];
  });
  return resp;
}
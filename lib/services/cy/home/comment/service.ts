import "server-only";

import pool from "@/lib/db";
import {
  SELECT_PROFILE_COMMENT,
  SELECT_PROFILE_COMMENT_COMMENT
} from "./queries";
import { cacheTag } from "next/cache";

export async function getProfileComment() {
  "use cache";
  cacheTag("profileComment");
  
  const list = await pool.query(SELECT_PROFILE_COMMENT);

  const resp = {
    comments: list.rows,
  };

  const comments = await pool.query(
    SELECT_PROFILE_COMMENT_COMMENT,
    [resp.comments.map((comment) => comment.id)]
  );

  const groupedComments = comments.rows.reduce((acc, comment) => {

    if (!acc[comment.parent_id]) {
      acc[comment.parent_id] = [];
    }
    acc[comment.parent_id].push(comment);
    return acc;
  }, {} as Record<number, typeof comments.rows>);

  resp.comments.forEach((comment) => {
    comment.comments = groupedComments[comment.id] ?? [];
  });
  return resp;
}
"use client";

import { useEffect } from "react";
import { trackBoardView } from "@/src/lib/api/cy/board/action";

export default function TrackBoardView({ id }: { id: number }) {
  useEffect(() => {
    trackBoardView(id).catch(() => {});
  }, [id]);

  return null;
}

"use client";

import { useEffect } from "react";
import { trackBoardView } from "@/lib/services/cy/board/action";

export default function TrackBoardView({ id }: { id: number }) {
  useEffect(() => {
    trackBoardView(id).catch(() => {});
  }, [id]);

  return null;
}

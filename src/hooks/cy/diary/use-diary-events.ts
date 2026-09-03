"use client";

import { useQuery } from "@tanstack/react-query";
import { getDiaryEvents } from "@/src/lib/api/cy/diary/calendar/actions";

export const diaryEventKeys = {
  all: ["diaryEvents"] as const,
};

export function useDiaryEvents() {
  return useQuery({
    queryKey: diaryEventKeys.all,
    queryFn: getDiaryEvents,
  });
}

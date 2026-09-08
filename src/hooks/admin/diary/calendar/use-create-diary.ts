"use client";

import { diaryKeys } from "@/src/hooks/cy/diary/calendar/use-diary";
import { createDiary } from "@/src/lib/api/admin/diary/calendar/action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDiary,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: diaryKeys.list(variables.diaryDate),
      });
    },
  });
}
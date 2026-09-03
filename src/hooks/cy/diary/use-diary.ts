import { getDiaryList } from "@/src/lib/api/cy/diary/calendar/actions";
import { useQuery } from "@tanstack/react-query";

export const diaryKeys = {
  all: ["diary"] as const,
  list: (diaryDate: string) => [...diaryKeys.all, diaryDate] as const,
};

export const useDiary = (diaryDate: string) => {
  return useQuery({
    queryKey: diaryKeys.list(diaryDate),
    queryFn: () => getDiaryList(diaryDate),
  });
};
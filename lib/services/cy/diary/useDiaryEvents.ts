'use client';

import { useQuery } from '@tanstack/react-query';
import { diaryKeys } from '@/lib/services/cy/diary/diaryKeys';
import { fetchDiaryEvents } from '@/lib/services/cy/diary/fetchDiaryEvents';

export function useDiaryEvents() {
  return useQuery({
    queryKey: diaryKeys.all,
    queryFn: fetchDiaryEvents,
  });
}

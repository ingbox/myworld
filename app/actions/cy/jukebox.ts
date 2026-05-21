// app/actions/jukebox.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

// ====== 방명록 목록 조회 (페이지 + 이메일 옵션) ======
export async function getJukeboxList(page : number) {
    const url = getBaseUrl();
  
    const query = new URLSearchParams({ page: String(page) });

    const response = await fetch(
      `${url}/api/cy/jukebox?${query.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { tags: ['jukeboxList'] },
      }
    );
  
    if (!response.ok) {
      throw new Error('주크박스 음악 목록 조회 실패');
    }
    return response.json();
  }
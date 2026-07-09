// app/actions/cy/photo.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

// ====== 사진첩 목록 조회 ======
export async function getBoardList(page: number, type?: number) {
  const url = getBaseUrl();

  const query = new URLSearchParams({
    page: String(page),
    ...(type !== undefined && { type: String(type) }),
  });

  const response = await fetch(
    `${url}/api/cy/board?${query.toString()}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { tags: ['boardList'] },
    }
  );

  if (!response.ok) {
    throw new Error('게시판 목록 조회 실패');
  }
  return response.json();
}
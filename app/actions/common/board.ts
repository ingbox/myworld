// app/actions/common/board.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

// ====== 게시판 목록 조회 ======
export async function getBoardTypeList(type?: number) {
  const url = getBaseUrl();
  const response = await fetch(
      `${url}/api/common/board/type`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { tags: ['boardType'] },
      }
    );

    if (!response.ok) {
      throw new Error('게시판 카테고리 조회 실패');
    }
    return response.json();
}
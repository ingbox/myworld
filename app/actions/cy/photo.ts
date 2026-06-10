// app/actions/cy/photo.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

// ====== 사진첩 목록 조회 ======
export async function getPhotoList(page : number) {
    const url = getBaseUrl();
  
    const query = new URLSearchParams({ page: String(page) });

    const response = await fetch(
      `${url}/api/cy/photo?${query.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { tags: ['photoList'] },
      }
    );
  
    if (!response.ok) {
      throw new Error('사진첩 목록 조회 실패');
    }
    return response.json();
  }
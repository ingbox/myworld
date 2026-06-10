// app/actions/admin/photo.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

// ====== 사진첩 생성 ======
export async function createPhoto({title, content}: {title: string, content: string}) {
    const url = getBaseUrl();
 
    const response = await fetch(
      `${url}/api/admin/photo`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
        next: { tags: ['photo'] },
      }
    );
  
    if (!response.ok) {
      throw new Error('사진첩 생성 실패');
    }
    return response.json();
  }
// app/actions/admin/home.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

// ====== 프로필 이미지 가져오기 ======
export async function getProfileImage({userEmail}: {userEmail: string}) {
    const url = getBaseUrl();
 
    const response = await fetch(
      `${url}/api/admin/home?email=${userEmail}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { tags: ['profileImage'] },
      }
    );
  
    if (!response.ok) {
      throw new Error('프로필 이미지 가져오기 실패');
    }
    return response.json();
  }
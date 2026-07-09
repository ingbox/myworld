'use server';
import { getBaseUrl } from '@/app/actions/url';

export async function getPhotoTypeList() {
    const url = getBaseUrl();
    const response = await fetch(
        `${url}/api/common/photo/type`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          next: { tags: ['photoType'] },
        }
      );

      if (!response.ok) {
        throw new Error('사진첩 카테고리 가져오기 실패');
      }
      return response.json();
    
  }
// app/actions/cy/home.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';
import { updateTag } from 'next/cache';

// ====== 컨텐츠 개수 조회 ======
export async function getContentCount() {
  const url = getBaseUrl();

  const response = await fetch(
    `${url}/api/cy/home/content`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { tags: ['contentCount'] },
    }
  );

  if (!response.ok) {
    throw new Error('컨텐츠 카운트 조회 실패');
  }
  return response.json();
}

// ====== 일촌평 작성(COMMENT) ======
export async function createProfileComment(formData: FormData): Promise<void> {
  const url = getBaseUrl();

  const response = await fetch(
    `${url}/api/cy/home/comment`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('일촌평 작성에 실패했습니다. 다시 시도해주세요.');
  }

  // 작업 후 방문자 리스트 갱신
  updateTag('profileComment');
}

// ====== 일촌평 조회 ======
export async function getProfileComment() {
  const url = getBaseUrl();

  const response = await fetch(
    `${url}/api/cy/home/comment`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { tags: ['profileComment'] },
    }
  );

  if (!response.ok) {
    throw new Error('일촌평 목록 조회 실패');
  }
  return response.json();
}

// ====== 최신 컨텐츠 ======
export async function getUpdatedNews() {
  const url = getBaseUrl();

  const response = await fetch(
    `${url}/api/cy/home/updated`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { tags: ['updatedNews'] },
    }
  );

  if (!response.ok) {
    throw new Error('최신 컨텐츠 조회 실패');
  }
  return response.json();
}
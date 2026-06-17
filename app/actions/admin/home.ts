// app/actions/admin/home.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

// ====== 프로필 이미지 가져오기 ======
export async function getProfileImage({ userEmail }: { userEmail: string }) {
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

// ====== 유저 능력치 저장 ======

export async function saveUserStats(stats: {
  erotic: number;
  famous: number;
  friendly: number;
  karma: number;
  kind: number;
}) {
  const url = getBaseUrl();

  const response = await fetch(`${url}/api/admin/common/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats),
  });

  if (!response.ok) {
    throw new Error('유저 능력치 저장 실패');
  }

  return response.json();
}
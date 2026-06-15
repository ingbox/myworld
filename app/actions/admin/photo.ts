// app/actions/admin/photo.ts
'use server';
import { getBaseUrl } from '@/app/actions/url';

// ====== 사진첩 생성 ======
export async function createPhoto({ title, content, type }: { title: string, content: string, type: number }) {
  const url = getBaseUrl();

  const response = await fetch(
    `${url}/api/admin/photo`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, type }),
      next: { tags: ['photo'] },
    }
  );

  if (!response.ok) {
    throw new Error('사진첩 생성 실패');
  }
  return response.json();
}

// ====== 이미지 업로드 ======
export async function uploadImage({ file }: { file: File }) {

  const url = getBaseUrl();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${url}/api/admin/photo/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('이미지 업로드 실패');
  }
  return response.json();
}
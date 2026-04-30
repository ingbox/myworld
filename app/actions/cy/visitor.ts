// app/actions/visitorActions.ts
'use server';

import { signIn } from '@/app/auth';
import { revalidateTag } from 'next/cache';

// ====== Google 로그인 처리 ======
export async function GoogleSignIn() {
  // Google OAuth 로그인 요청
  await signIn('google');
}

type PaginationParams = {
  page: number;
  userEmail?: string;
  userRole?: string;
};

type ReportParams = {
  visitorId: string;
  userEmail: string;
};

// ====== 방명록 작성 (이미지 업로드 포함) ======
export async function createVisitor(formData: FormData): Promise<void> {
  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : '';

  const response = await fetch(`${url}/api/cy/visitor`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('방명록 작성에 실패했습니다. 다시 시도해주세요.');
  }

  // 작업 후 방문자 리스트 갱신
  // revalidateTag('visitorList');
}

// ====== 방명록 목록 조회 (페이지 + 이메일 옵션) ======
export async function getVisitorList({ page, userEmail, userRole }: PaginationParams) {
  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : '';

  const query = new URLSearchParams({ page: String(page) });
  if (userEmail) query.append('user_email', userEmail);
  if (userRole) query.append('user_role', userRole);

  const response = await fetch(
    `${url}/api/cy/visitor?${query.toString()}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { tags: ['visitorList'] },
    }
  );

  if (!response.ok) {
    throw new Error('방명록 목록 조회 실패');
  }
  return response.json();
}

// ====== 방명록 수정 (PUT) ======
export async function editVisitor(visitorId: string, content: string) {
  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : '';

  const response = await fetch(`${url}/api/cy/visitor/${visitorId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('방명록 수정 실패');
  }

  // revalidateTag('visitorList');
  return response.json();
}

// ====== 방명록 삭제 (DELETE) ======
export async function deleteVisitor({ visitorId }: { visitorId: string }) {
  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : '';

  const response = await fetch(`${url}/api/cy/visitor/${visitorId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '알 수 없는 오류가 발생했습니다.');
  }

  // revalidateTag('visitorList');
  return response.json();
}

// ====== 방명록 신고 (REPORT) ======
export async function reportVisitor({ visitorId, userEmail }: ReportParams) {
  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : '';

  const response = await fetch(
    `${url}/api/cy/visitor/${visitorId}/report`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '알 수 없는 오류가 발생했습니다.');
  }

  // revalidateTag('visitorList');
  return response.json();
}

export async function secretVisitor(visitorId: string) {
  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : '';

  const response = await fetch(
    `${url}/api/cy/visitor/${visitorId}/secret`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '알 수 없는 오류가 발생했습니다.');
  }

  // revalidateTag('visitorList');
  return response.json();
}

// ====== 댓글 작성(COMMENT) ======
export async function createComment(formData: FormData): Promise<void> {
  const url = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : '';

  const response = await fetch(
    `${url}/api/cy/visitor/${formData.get('visitor_id')}/comment`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('방명록 작성에 실패했습니다. 다시 시도해주세요.');
  }

  // 작업 후 방문자 리스트 갱신
  // revalidateTag('visitorList');
}

export async function deleteComment(commentId: string) {
  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : '';

  const response = await fetch(`${url}/api/cy/visitor/comment/${commentId}`, {
    method: 'DELETE',
  });

  // revalidateTag('visitorList');
}
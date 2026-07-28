// app/actions/cy/auth.ts
'use server';
import { signIn, signOut } from '@/app/auth';

// ====== Google 로그인 처리 ======
export async function GoogleSignIn() {
  // Google OAuth 로그인 요청
  await signIn('google');
}

export async function GoogleSignOut() {
  await signOut();
}
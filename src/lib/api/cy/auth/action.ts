"use server";

import { signIn, signOut } from "@/app/auth";

/**
 * Google OAuth로 로그인합니다.
 */
export async function GoogleSignIn() {
  await signIn("google");
}

/**
 * 현재 세션을 로그아웃합니다.
 */
export async function GoogleSignOut() {
  await signOut();
}

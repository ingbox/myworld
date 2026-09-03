'use server';

import pool from '@/src/lib/db';
import { updateTag } from 'next/cache';

import { INSERT_PHOTO } from './queries';
import { uploadImage as uploadImageToS3 } from './service';
import type { CreatePhotoRequest, CreatePhotoResult } from './types';

/**
 * 관리자에서 사진첩 글을 작성합니다.
 * 작성 후 사진 목록·홈 최근글·컨텐츠 카운트 캐시를 갱신합니다.
 *
 * @param data - 제목, 본문, 사진첩 종류 id
 * @param data.title - 제목
 * @param data.content - 본문(에디터 HTML)
 * @param data.type - 사진첩 종류 id
 * @returns `{ success: true }`
 * @throws DB 저장에 실패한 경우
 */
export async function createPhoto({
  title,
  content,
  type,
}: CreatePhotoRequest): Promise<CreatePhotoResult> {
  try {
    await pool.query(INSERT_PHOTO, [title, content, type]);
    updateTag('photoList');
    updateTag('updatedNews'); // (메인) 최근 게시물 캐시 갱신
    updateTag('contentCount'); // (메인) 컨텐츠 개수 캐시 갱신

    return { success: true };
  } catch (err) {
    console.error('createPhoto err:', err);
    throw new Error('사진첩 생성 실패');
  }
}

/**
 * 에디터에서 고른 이미지를 S3에 올립니다.
 *
 * @param params.file - 업로드할 이미지 파일
 * @returns `{ url }` — 공개 URL
 */
export async function uploadImage({ file }: { file: File }) {
  return uploadImageToS3(file);
}

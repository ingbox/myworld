'use server';

import pool from '@/lib/db';
import { updateTag } from 'next/cache';

import { INSERT_PHOTO } from './queries';
import { uploadImage as uploadImageToS3 } from './service';

export async function createPhoto({
  title,
  content,
  type,
}: {
  title: string;
  content: string;
  type: number;
}) {
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

export async function uploadImage({ file }: { file: File }) {
  return uploadImageToS3(file);
}

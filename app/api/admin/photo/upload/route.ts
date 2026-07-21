import { NextRequest, NextResponse } from 'next/server';
import { resolveImageMeta } from '@/lib/image-meta';
import { getSignedURL } from '@/lib/s3';

export async function POST(req: NextRequest): Promise<NextResponse> {
    const formData = await req.formData();
    const file = formData.get('file') as File;
  
    try {
      if (!file) throw new Error('파일 없음');
  
      const { contentType, ext } = resolveImageMeta(file);
      const key = `cy/photo/${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}${ext}`;
  
      const signed = await getSignedURL(key, contentType);
      const uploadUrl = signed.success?.url;
  
      if (!uploadUrl) throw new Error('Failed to get signed URL');
  
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': contentType,
        },
      });
  
      if (!uploadRes.ok) throw new Error('Failed to upload image to S3');
  
      return NextResponse.json({ url: uploadUrl.split('?')[0] }); // 쿼리 제거
    } catch (err) {
      console.error('POST err:', err);
      return NextResponse.json({ error: '업로드 실패' }, { status: 500 });
    }
  }

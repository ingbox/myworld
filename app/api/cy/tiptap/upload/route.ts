import { NextRequest, NextResponse } from 'next/server';
import { getSignedURL } from '@/lib/s3';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { key } = await req.json();
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const result = await getSignedURL(key);
    
    if (!result.success?.url) {
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: result.success.url });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

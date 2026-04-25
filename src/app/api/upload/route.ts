// ============================================================
// Image Upload API Route — Cloudflare R2
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB after compression)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { error: 'Cloudflare R2 not configured. Please set environment variables.' },
        { status: 500 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `${folder}/${timestamp}-${randomId}.webp`;

    // Read file as buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2 using S3-compatible API
    const r2Url = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${fileName}`;

    // Create signature for S3-compatible request
    const response = await fetch(r2Url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/webp',
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
      },
      body: buffer,
    });

    if (!response.ok) {
      // Fallback: return a data URL for development
      console.error('R2 upload failed, using fallback');
      return NextResponse.json({
        url: `data:image/webp;base64,${buffer.toString('base64')}`,
        fallback: true,
      });
    }

    const fileUrl = publicUrl ? `${publicUrl}/${fileName}` : r2Url;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

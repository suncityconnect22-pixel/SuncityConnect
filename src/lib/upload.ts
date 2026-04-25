// ============================================================
// Image Compression Utility — Client-side WebP conversion
// ============================================================

import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp' as const,
    initialQuality: 0.8,
  };

  try {
    const compressed = await imageCompression(file, options);

    // Rename to .webp
    const webpFile = new File(
      [compressed],
      file.name.replace(/\.[^.]+$/, '.webp'),
      { type: 'image/webp' }
    );

    return webpFile;
  } catch (error) {
    console.error('Compression failed, using original:', error);
    return file;
  }
}

export async function uploadImage(file: File, folder: string = 'uploads'): Promise<string | null> {
  try {
    // Compress to WebP first
    const compressed = await compressImage(file);

    const formData = new FormData();
    formData.append('file', compressed);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.error) {
      console.error('Upload error:', data.error);
      return null;
    }

    return data.url;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

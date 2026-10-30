export const MAX_PHOTO_BYTES = 300_000;

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('No pudimos comprimir la foto. Prueba con otra imagen.')),
      'image/webp',
      quality,
    );
  });
}

// Decode with the browser's EXIF orientation handling, including mobile photos.
async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch { /* Some browsers can decode additional formats through <img>. */ }
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('No pudimos abrir la foto. Elige una imagen JPG, PNG o WebP. Si es HEIC, conviértela a JPG.'));
      image.src = url;
    });
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export async function optimizePhoto(file: File): Promise<File> {
  const image = await decode(file);
  try {
    if (!image.width || !image.height) throw new Error('La foto no tiene dimensiones válidas.');
    // Center crop to 4:3; never enlarge a small original.
    const cropWidth = Math.min(image.width, image.height * 4 / 3);
    const cropHeight = cropWidth * 3 / 4;
    let width = Math.max(4, Math.floor(Math.min(1200, cropWidth) / 4) * 4);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Tu navegador no permite procesar fotos. Prueba con otro navegador.');
    while (width >= 4) {
      canvas.width = width;
      canvas.height = width * 3 / 4;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image.source, (image.width - cropWidth) / 2, (image.height - cropHeight) / 2, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.85, 0.72, 0.6, 0.45]) {
        const blob = await encode(canvas, quality);
        if (blob.size <= MAX_PHOTO_BYTES && ['image/webp', 'image/jpeg', 'image/png'].includes(blob.type)) {
          const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/jpeg' ? 'jpg' : 'png';
          return new File([blob], `oferta.${ext}`, { type: blob.type });
        }
      }
      width = Math.floor(width * 0.75 / 4) * 4;
    }
    throw new Error('No pudimos reducir la foto a 300 KB. Prueba con otra imagen.');
  } finally {
    image.close();
  }
}

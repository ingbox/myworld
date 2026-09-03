export function resolveImageMeta(file: { name: string; type: string }) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.includes('png') || name.endsWith('.png')) {
    return { contentType: 'image/png', ext: '.png' };
  }
  if (
    type.includes('jpeg') ||
    type.includes('jpg') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg')
  ) {
    return { contentType: 'image/jpeg', ext: '.jpg' };
  }
  if (type.includes('gif') || name.endsWith('.gif')) {
    return { contentType: 'image/gif', ext: '.gif' };
  }
  if (type.includes('webp') || name.endsWith('.webp')) {
    return { contentType: 'image/webp', ext: '.webp' };
  }
  if (
    type.includes('heic') ||
    type.includes('heif') ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  ) {
    return { contentType: 'image/heic', ext: '.heic' };
  }

  return { contentType: type || 'application/octet-stream', ext: '' };
}

export function isHeicFile(file: { name: string; type: string }) {
  const { contentType } = resolveImageMeta(file);
  return contentType === 'image/heic';
}

import { File } from 'expo-file-system';

import { supabase } from '@/supabase';

const BUCKET = 'tournament-images';

function extensionFromMime(mimeType: string): string {
  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  if (mimeType === 'image/heic') {
    return 'heic';
  }

  return 'jpg';
}

export async function uploadTournamentImage(
  uri: string,
  mimeType = 'image/jpeg'
): Promise<{ imageUrl: string; imagePath: string }> {
  const file = new File(uri);
  const arrayBuffer = await file.arrayBuffer();

  if (arrayBuffer.byteLength < 100) {
    throw new Error('Slika nije pravilno učitana s uređaja.');
  }

  const fileName = `tournament-${Date.now()}.${extensionFromMime(mimeType)}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, arrayBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return {
    imageUrl: publicUrlData.publicUrl,
    imagePath: data.path,
  };
}

export async function deleteTournamentImage(imagePath?: string): Promise<void> {
  if (!imagePath) {
    return;
  }

  const { error } = await supabase.storage.from(BUCKET).remove([imagePath]);

  if (error) {
    console.log('Greška pri brisanju slike:', error.message);
  }
}

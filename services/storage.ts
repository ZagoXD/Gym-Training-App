import { supabase } from '@/lib/supabase';
import mime from 'mime';

export async function uploadAvatar(fileUri: string): Promise<string> {
  const { data: me } = await supabase.auth.getUser();
  const uid = me.user?.id;
  if (!uid) throw new Error('Sem sessão');

  const ext = (mime.getExtension(mime.getType(fileUri) || '') || 'jpg').toLowerCase();
  const path = `${uid}/avatar.${ext}`;
  const resp = await fetch(fileUri);
  const arrayBuffer = await resp.arrayBuffer();
  const contentType = mime.getType(fileUri) || resp.headers.get('Content-Type') || 'image/jpeg';

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType, upsert: true });
  if (error) throw error;

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  return pub.publicUrl;
}

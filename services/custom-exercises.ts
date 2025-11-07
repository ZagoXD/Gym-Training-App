import { supabase } from '@/lib/supabase';

export type CustomExercise = {
  id: string;
  trainer_id: string;
  name: string;
  description: string | null;
  category_id: number;
  images: string[];
  video_url?: string | null;
  created_at?: string;
};

export type CustomExerciseUpsert = {
  name: string;
  description?: string | null;
  category_id: number;
  imageUris: string[];
  videoUrl?: string | null;
};

const BUCKET = 'exercises';

function isHttpUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

function extractPathFromPublicUrl(url: string): string | null {
  const idx = url.indexOf('/object/public/');
  if (idx === -1) return null;
  const tail = url.slice(idx + '/object/public/'.length);
  const firstSlash = tail.indexOf('/');
  if (firstSlash === -1) return null;
  const bucket = tail.slice(0, firstSlash);
  if (bucket !== BUCKET) return null;
  return tail.slice(firstSlash + 1);
}

async function getUidOrThrow(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) throw new Error('Sem sessão');
  return uid;
}

async function uploadImageToExercises(params: {
  uid: string;
  exerciseId: string;
  index: number;
  uri: string;
}): Promise<{ url: string; path: string }> {
  const { uid, exerciseId, index, uri } = params;

  const resp = await fetch(uri);
  const buf = await resp.arrayBuffer();
  const contentType =
    resp.headers.get('Content-Type') ||
    (uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');

  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const path = `${uid}/${exerciseId}/${Date.now()}_${index}.${ext}`;

  const up = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (up.error) throw up.error;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl, path };
}

export async function listCustomExercises(): Promise<CustomExercise[]> {
  const { data, error } = await supabase
    .from('custom_exercises')
    .select(`
      id, trainer_id, name, description, category_id, created_at, video_url,
      custom_exercise_images ( url, sort )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    trainer_id: row.trainer_id,
    name: row.name,
    description: row.description ?? null,
    category_id: row.category_id,
    created_at: row.created_at ?? undefined,
    video_url: row.video_url ?? null,
    images: (row.custom_exercise_images ?? [])
      .sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((i: any) => i.url),
  }));
}

export async function createCustomExercise(input: CustomExerciseUpsert): Promise<string> {
  const { name, description = null, category_id, imageUris, videoUrl = null } = input;

  const { data: created, error } = await supabase
    .from('custom_exercises')
    .insert([{ name, description, category_id, video_url: videoUrl }]) 
    .select('id')
    .single();

  if (error) throw error;
  const exerciseId = created.id as string;

  if (imageUris?.length) {
    const uid = await getUidOrThrow();
    const rows: { exercise_id: string; url: string; sort: number }[] = [];

    let sort = 0;
    for (const item of imageUris) {
      if (isHttpUrl(item)) {
        rows.push({ exercise_id: exerciseId, url: item, sort: sort++ });
      } else {
        const { url } = await uploadImageToExercises({
          uid,
          exerciseId,
          index: sort,
          uri: item,
        });
        rows.push({ exercise_id: exerciseId, url, sort: sort++ });
      }
    }

    const ins = await supabase.from('custom_exercise_images').insert(rows);
    if (ins.error) throw ins.error;
  }

  return exerciseId;
}

export async function updateCustomExercise(id: string, input: CustomExerciseUpsert): Promise<string> {
  const { name, description = null, category_id, imageUris, videoUrl = null } = input;

  const upd = await supabase
    .from('custom_exercises')
    .update({ name, description, category_id, video_url: videoUrl })
    .eq('id', id);
  if (upd.error) throw upd.error;

  const { data: existing, error: exErr } = await supabase
    .from('custom_exercise_images')
    .select('id, url')
    .eq('exercise_id', id);

  if (exErr) throw exErr;
  const existingUrls = new Set((existing ?? []).map((r: any) => r.url));

  const finalUrls: string[] = [];
  const uid = await getUidOrThrow();

  let sort = 0;
  for (const item of imageUris ?? []) {
    if (isHttpUrl(item)) {
      finalUrls.push(item);
    } else {
      const { url } = await uploadImageToExercises({
        uid,
        exerciseId: id,
        index: sort,
        uri: item,
      });
      finalUrls.push(url);
    }
    sort++;
  }

  const removed = (existing ?? []).filter((r: any) => !finalUrls.includes(r.url));
  if (removed.length) {
    const delRows = await supabase
      .from('custom_exercise_images')
      .delete()
      .in('id', removed.map((r: any) => r.id));
    if (delRows.error) throw delRows.error;

    for (const r of removed) {
      const path = extractPathFromPublicUrl(r.url);
      if (!path) continue;
      await supabase.storage.from(BUCKET).remove([path]);
    }
  }

  const delAll = await supabase.from('custom_exercise_images').delete().eq('exercise_id', id);
  if (delAll.error) throw delAll.error;

  const rows = finalUrls.map((url, idx) => ({ exercise_id: id, url, sort: idx }));
  if (rows.length) {
    const ins = await supabase.from('custom_exercise_images').insert(rows);
    if (ins.error) throw ins.error;
  }

  return id;
}

export async function deleteCustomExercise(id: string): Promise<void> {
  const { data: imgs } = await supabase
    .from('custom_exercise_images')
    .select('url')
    .eq('exercise_id', id);

  const del = await supabase.from('custom_exercises').delete().eq('id', id);
  if (del.error) throw del.error;

  const paths: string[] = [];
  (imgs ?? []).forEach((r: any) => {
    const p = extractPathFromPublicUrl(r.url);
    if (p) paths.push(p);
  });
  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
}

export async function deleteCustomExerciseImage(exerciseId: string, url: string): Promise<void> {
  const del = await supabase
    .from('custom_exercise_images')
    .delete()
    .eq('exercise_id', exerciseId)
    .eq('url', url);
  if (del.error) throw del.error;

  const path = extractPathFromPublicUrl(url);
  if (path) {
    const rm = await supabase.storage.from(BUCKET).remove([path]);
    if (rm.error) throw rm.error;
  }
}

import { supabase } from '@/lib/supabase';

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpNoConfirm(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signErr) throw signErr;
  const { data: me } = await supabase.auth.getUser();
  return me.user!.id;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBER_ME_KEY = 'remember_me';

export async function setRememberMe(remember: boolean) {
  await AsyncStorage.setItem(REMEMBER_ME_KEY, remember ? '1' : '0');
}

export async function getRememberMe(): Promise<boolean> {
  const v = await AsyncStorage.getItem(REMEMBER_ME_KEY);
  return v !== '0';
}

export async function signIn(email: string, password: string, remember = true) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await setRememberMe(remember);
}

export async function signUpNoConfirm(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signErr) throw signErr;
  const { data: me } = await supabase.auth.getUser();
  await setRememberMe(true);
  return me.user!.id;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  await setRememberMe(true);
}

export async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

import { supabase } from '@/lib/supabase';
import { generateTrainerKey } from '@/lib/trainer-key';

export async function validateTrainerKey(key: string) {
  try {
    const { data, error } = await supabase.rpc('validate_trainer_key', { p_key: key });
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data[0].id as string;
  } catch {
    const { data } = await supabase.from('trainers_public').select('id').eq('trainer_key', key).maybeSingle();
    return data?.id ?? null;
  }
}

export async function assignTrainerKeyWithRetry(userId: string, display_name: string, phone: string, role: 'trainer') {
  for (let i=0; i<5; i++){
    const candidate = generateTrainerKey();
    const { error }: any = await supabase
      .from('profiles')
      .update({ display_name, phone, role, trainer_key: candidate, trainer_id: null })
      .eq('user_id', userId);
    if (!error) return candidate;
    if (error.code !== '23505') throw error;
  }
  throw new Error('Não foi possível gerar uma chave única. Tente novamente.');
}

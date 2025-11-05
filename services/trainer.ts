import { supabase } from '@/lib/supabase';
import { generateTrainerKey } from '@/lib/trainer-key';

export function normalizeTrainerKeyRaw(v: string) {
  return (v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function normalizeTrainerKeyDisplay(v: string) {
  const raw = normalizeTrainerKeyRaw(v);
  if (raw.length <= 4) return raw;
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

export async function validateTrainerKey(input: string) {
  const raw = normalizeTrainerKeyRaw(input);
  const display = normalizeTrainerKeyDisplay(raw);

  const tryRpc = async (k: string) => {
    const { data, error } = await supabase.rpc('validate_trainer_key', { p_key: k });
    if (error) return null;
    if (Array.isArray(data) && data.length) return data[0].id as string;
    return null;
  };

  let id = await tryRpc(raw);
  if (!id) id = await tryRpc(display);
  if (id) return id;

  const { data } = await supabase
    .from('trainers_public')
    .select('id')
    .or(
      [
        `trainer_key.eq.${raw}`,
        `trainer_key.eq.${display}`,
        `trainer_key.ilike.${raw}`,
        `trainer_key.ilike.${display}`,
      ].join(',')
    )
    .maybeSingle();

  return data?.id ?? null;
}

export async function assignTrainerKeyWithRetry(
  userId: string,
  display_name: string,
  phone: string,
  role: 'trainer',
) {
  for (let i = 0; i < 5; i++) {
    const candidate = normalizeTrainerKeyDisplay(generateTrainerKey());
    const { error }: any = await supabase
      .from('profiles')
      .update({
        display_name,
        phone,
        role,
        trainer_key: candidate,
        trainer_id: null,
      })
      .eq('user_id', userId);

    if (!error) return candidate;
    if (error.code !== '23505') throw error;
  }
  throw new Error('Não foi possível gerar uma chave única. Tente novamente.');
}

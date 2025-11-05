import { supabase } from '@/lib/supabase';

export type ProfileSummary = {
  display_name: string | null;
  role: 'trainer' | 'student';
  trainer_key: string | null;
  trainer_id: string | null;
  trainer?: { display_name: string | null; trainer_key: string | null } | null;
};

export async function getOwnProfileWithTrainer(userId: string): Promise<ProfileSummary> {

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, role, trainer_key, trainer_id')
    .eq('user_id', userId)
    .single();
  if (error) throw error;

  let trainer: ProfileSummary['trainer'] = null;

  if (data.role === 'student' && data.trainer_id) {
    const { data: t } = await supabase
      .from('trainers_public')
      .select('display_name, trainer_key')
      .eq('id', data.trainer_id)
      .maybeSingle();
    trainer = t ?? null;
  }

  return { ...data, trainer };
}

export async function updateStudentProfile(
  userId: string,
  display_name: string,
  phone: string,
  trainerId: string
) {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name,
      phone,
      role: 'student',
      trainer_key: null,
      trainer_id: trainerId,
    })
    .eq('user_id', userId);
  if (error) throw error;
}

export type StudentRow = { user_id: string; display_name: string | null };

export async function listMyStudents(): Promise<StudentRow[]> {
  const { data, error } = await supabase.rpc('list_my_students');
  if (error) throw error;
  return data ?? [];
}

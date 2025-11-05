import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { getOwnProfileWithTrainer, listMyStudents, ProfileSummary, StudentRow } from '@/services/profile';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  const { userId, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const p = await getOwnProfileWithTrainer(userId);
      setProfile(p);
      if (p.role === 'trainer') {
        const list = await listMyStudents();
        setStudents(list);
      } else {
        setStudents([]);
      }
    })();
  }, [userId]);

  const headerLine =
    !userId || loading || !profile
      ? null
      : profile.role === 'trainer'
      ? `Bem-vindo, ${profile.display_name ?? 'Treinador'}`
      : `Bem-vindo, ${profile.display_name ?? 'Aluno'}`;

  const roleLine =
    !userId || loading || !profile
      ? null
      : profile.role === 'trainer'
      ? `Você é TREINADOR. Sua chave: ${profile.trainer_key ?? '—'}`
      : `Você é ALUNO. Treinador: ${profile.trainer?.display_name ?? '—'} (chave: ${profile.trainer?.trainer_key ?? '—'})`;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{headerLine ?? 'Welcome!'}</ThemedText>
      </ThemedView>

      {roleLine && (
        <ThemedView style={styles.section}>
          <ThemedText>{roleLine}</ThemedText>
        </ThemedView>
      )}

      {profile?.role === 'trainer' && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Meus alunosaaa</ThemedText>
          {students.length === 0 ? (
            <ThemedText>Nenhum aluno vinculado.</ThemedText>
          ) : (
            students.map(s => (
              <ThemedText key={s.user_id}>• {s.display_name ?? s.user_id}</ThemedText>
            ))
          )}
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reactLogo: { height: 178, width: 290, bottom: 0, left: 0, position: 'absolute' },
  section: { marginTop: 12, paddingHorizontal: 16, gap: 6 },
});

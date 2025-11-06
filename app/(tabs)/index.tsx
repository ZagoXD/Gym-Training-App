import { useAuth } from '@/hooks/use-auth';
import { getOwnProfileWithTrainer } from '@/services/profile';
import AlunoHome from '@/views/aluno/home';
import TreinadorHome from '@/views/treinador/home';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { userId, loading } = useAuth();
  const [role, setRole] = useState<'student' | 'trainer' | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoadingProfile(false);
      return;
    }
    (async () => {
      try {
        const profile = await getOwnProfileWithTrainer(userId);
        setRole(profile.role);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [userId]);

  if (loading || loadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (role === 'trainer') {
    return <TreinadorHome />;
  }

  if (role === 'student') {
    return <AlunoHome />;
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
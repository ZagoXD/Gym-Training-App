import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { getOwnProfileWithTrainer, listMyStudents, ProfileSummary, StudentRow } from '@/services/profile';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default async function TreinadorHome() {
  const { userId } = useAuth();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const p = await getOwnProfileWithTrainer(userId);
      setProfile(p);
      const list = await listMyStudents();
      setStudents(list);
    })();
  }, [userId]);

  const headerLine = `Bem-vindo, ${profile?.display_name ?? 'Treinador'}`;

  console.log(students);

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
        <ThemedText type="title" style={styles.titleText}>{headerLine}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.description}>
          Aqui você pode postar e acompanhar fotos e vídeos dos treinos dos seus alunos!
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <View style={styles.feedCard}>
          <View style={styles.feedUserInfo}>
            <Image
              source={require('@/assets/images/jonathan.jpeg')}
              style={styles.userAvatar}
              contentFit="cover"
            />
            <ThemedText style={styles.userName}>{profile?.display_name ?? 'Treinador'}</ThemedText>
          </View>
          
          <Image
            source={require('@/assets/images/exemploFeed.png')}
            style={styles.feedImage}
            contentFit="cover"
          />
          
          <View style={styles.feedContent}>
            <View style={styles.feedHeader}>
              <ThemedText style={styles.feedDescription}>
                Exemplo de treino dos alunos 💪
              </ThemedText>
              <TouchableOpacity style={styles.likeButton}>
                <Ionicons name="heart-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.studentsTitle}>Meus alunos</ThemedText>
        {students.length === 0 ? (
          <ThemedText style={styles.noStudentsText}>Nenhum aluno vinculado.</ThemedText>
        ) : (
          <View style={styles.studentsList}>
            {students.map(s => (
              <TouchableOpacity 
                key={s.user_id} 
                style={styles.studentCard}
                onPress={() => {
                  Alert.alert(
                    'Debug - Dados do Aluno',
                    `user_id: ${s.user_id}\ndisplay_name: ${s.display_name ?? 'null'}\navatar_url: ${s.avatar_url ?? 'null'}`,
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Image
                  source={
                    s.avatar_url 
                      ? { uri: s.avatar_url } 
                      : require('@/assets/images/jonathan.jpeg')
                  }
                  style={styles.studentAvatar}
                  contentFit="cover"
                />
                <ThemedText style={styles.studentName}>{s.display_name ?? s.user_id}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.trainerKeyTitle}>Código do Professor</ThemedText>
        <View style={styles.trainerKeyCard}>
          <ThemedText style={styles.trainerKeyLabel}>Sua chave de treinador:</ThemedText>
          <ThemedText style={styles.trainerKeyValue}>{profile?.trainer_key ?? '—'}</ThemedText>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  titleText: { textAlign: 'center' },
  reactLogo: { height: 178, width: 290, bottom: 0, left: 0, position: 'absolute' },
  section: { marginTop: 12, paddingHorizontal: 16, gap: 6 },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    textAlign: 'justify',
  },
  feedCard: {
    borderWidth: 1,
    borderColor: '#ffffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    backgroundColor: '#ffffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    backgroundColor: '#ffffffff',
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  feedImage: {
    width: '95%',
    height: 300,
    alignSelf: 'center',
  },
  feedContent: {
    padding: 12,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedDescription: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    color: '#333',
  },
  likeButton: {
    padding: 4,
  },
  studentsTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  noStudentsText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  studentsList: {
    gap: 10,
    marginTop: 8,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  trainerKeyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  trainerKeyCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  trainerKeyLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  trainerKeyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 1,
  },
});

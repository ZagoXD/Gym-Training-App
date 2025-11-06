import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function AlunoHome() {
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
        <ThemedText type="title" style={styles.titleText}>Bem-vindo ao Gym Training</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.description}>
          Aqui você poderá ver o seu feed com postagens do seu professor e de seus amigos!
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
            <ThemedText style={styles.userName}>Jonathan</ThemedText>
          </View>
          
          <Image
            source={require('@/assets/images/exemploFeed.png')}
            style={styles.feedImage}
            contentFit="cover"
          />
          
          <View style={styles.feedContent}>
            <View style={styles.feedHeader}>
              <ThemedText style={styles.feedDescription}>
                Treino do dia concluído com sucesso! 💪
              </ThemedText>
              <TouchableOpacity style={styles.likeButton}>
                <Ionicons name="heart-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
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
    textAlign:'justify'
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
});

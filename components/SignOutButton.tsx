import { signOut } from '@/services/auth';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text } from 'react-native';

export default function SignOutButton() {
  async function onPress() {
    await signOut();
    router.replace('/sign-in');
  }
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 16 }}>
      <Text style={{ color: '#0a7' }}>Sair</Text>
    </Pressable>
  );
}

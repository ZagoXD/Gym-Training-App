import PasswordField from '@/components/ui/PasswordField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextField from '@/components/ui/TextField';
import { signIn } from '@/services/auth';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const tint = useThemeColor({}, 'tint');
  const onTint = useThemeColor({}, 'onTint');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const ripple = useThemeColor({}, 'ripple');

  async function handle() {
    setLoading(true);
    try {
      await signIn(email, password, remember);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.c}>
      <TextField placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <PasswordField placeholder="Senha" value={password} onChangeText={setPassword} />

      <Pressable
        onPress={() => setRemember((v) => !v)}
        style={[styles.row, { alignSelf: 'flex-start' }]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: remember }}
        hitSlop={8}
        android_ripple={{ color: ripple, borderless: false }}
      >
        <View
          style={[
            styles.box,
            {
              borderColor: border,
              backgroundColor: remember ? tint : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          {remember && <MaterialIcons name="check" size={14} color={onTint} />}
        </View>
        <ThemedText>Manter-me conectado</ThemedText>
      </Pressable>

      <PrimaryButton title={loading ? 'Entrando...' : 'Entrar'} onPress={handle} loading={loading} />
      <Link href="/sign-up" style={[styles.b, { color: muted }]}>
        Criar conta
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  b: { marginTop: 16, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  box: { width: 18, height: 18, borderWidth: 1, borderRadius: 4 },
});

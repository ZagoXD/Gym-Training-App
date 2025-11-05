import PasswordField from '@/components/ui/PasswordField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextField from '@/components/ui/TextField';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { signIn } from '@/services/auth';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SignInScreen() {
  const isDark = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const tint = isDark ? '#1f6feb' : '#2563eb';
  const border = isDark ? '#555' : '#999';
  const bg = isDark ? '#000' : '#fff';
  const fg = isDark ? '#ddd' : '#333';

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
    <View style={[styles.c, { backgroundColor: bg }]}>
      <TextField placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <PasswordField placeholder="Senha" value={password} onChangeText={setPassword} />

      <Pressable
        onPress={() => setRemember(v => !v)}
        style={[styles.row, { alignSelf: 'flex-start' }]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: remember }}
        hitSlop={8}
        android_ripple={{ color: isDark ? '#222' : '#e6e6e6', borderless: false }}
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
          {remember && <MaterialIcons name="check" size={14} color="#fff" />}
        </View>
        <Text style={{ color: fg }}>Manter-me conectado</Text>
      </Pressable>

      <PrimaryButton title={loading ? 'Entrando...' : 'Entrar'} onPress={handle} loading={loading} />
      <Link href="/sign-up" style={[styles.b, { color: isDark ? '#bbb' : '#666' }]}>
        Criar conta
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  b: { marginTop: 16, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  box: { width: 18, height: 18, borderWidth: 1, borderRadius: 4 },
});

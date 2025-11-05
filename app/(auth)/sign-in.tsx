import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

export default function SignInScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  async function handleSignIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return Alert.alert('Erro', error.message);
    router.replace('/(tabs)');
  }

  return (
    <View style={[styles.c, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={[styles.i, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#ccc' }]}
        placeholderTextColor={isDark ? '#888' : '#888'}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[styles.i, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#ccc' }]}
        placeholderTextColor={isDark ? '#888' : '#888'}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Switch value={remember} onValueChange={setRemember} />
        <Text style={{ color: isDark ? '#fff' : '#000' }}>Manter-me conectado</Text>
      </View>
      <Button title="Entrar" onPress={handleSignIn} />
      <Link href="/sign-up" style={[styles.b, { color: isDark ? '#bbb' : '#666' }]}>Criar conta</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  i: { borderWidth: 1, borderRadius: 8, padding: 12 },
  b: { marginTop: 16, alignSelf: 'center' },
});

import PasswordField from '@/components/ui/PasswordField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextField from '@/components/ui/TextField';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { signIn } from '@/services/auth';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export default function SignInScreen() {
  const isDark = useColorScheme() === 'dark';
  const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
  const [loading,setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try { await signIn(email, password); router.replace('/(tabs)'); }
    catch(e:any){ Alert.alert('Erro', e.message ?? String(e)); }
    finally{ setLoading(false); }
  }

  return (
    <View style={[styles.c, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <TextField placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail}/>
      <PasswordField placeholder="Senha" value={password} onChangeText={setPassword}/>
      <PrimaryButton title="Entrar" onPress={handle} loading={loading}/>
      <Link href="/sign-up" style={[styles.b, { color: isDark ? '#bbb' : '#666' }]}>Criar conta</Link>
    </View>
  );
}
const styles = StyleSheet.create({ c:{flex:1,justifyContent:'center',padding:24,gap:12}, b:{marginTop:16,alignSelf:'center'}});

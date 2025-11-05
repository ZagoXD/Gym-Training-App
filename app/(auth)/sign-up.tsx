import PasswordField from '@/components/ui/PasswordField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { RadioGroup } from '@/components/ui/RadioGroup';
import TextField from '@/components/ui/TextField';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { normalizeKey } from '@/lib/trainer-key';
import { signUpNoConfirm } from '@/services/auth';
import { updateStudentProfile } from '@/services/profile';
import { assignTrainerKeyWithRetry, validateTrainerKey } from '@/services/trainer';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

type Role = 'trainer'|'student';

export default function SignUpScreen() {
  const isDark = useColorScheme() === 'dark';
  const [displayName,setDisplayName]=useState('');
  const [phone,setPhone]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [role,setRole]=useState<Role>('student');
  const [typedKey,setTypedKey]=useState('');
  const [loading,setLoading]=useState(false);

  async function handle() {
    if (!displayName || !email || !password) return Alert.alert('Atenção','Preencha nome, e-mail e senha.');

    setLoading(true);
    try {
      let trainerId: string | null = null;
      if (role === 'student') {
        const k = normalizeKey(typedKey);
        trainerId = await validateTrainerKey(k);
        if (!trainerId) return Alert.alert('Atenção','Chave de treinador inválida.');
      }

      const userId = await signUpNoConfirm(email, password);

      if (role === 'trainer') {
        const key = await assignTrainerKeyWithRetry(userId, displayName, phone, 'trainer');
        Alert.alert('Conta criada!', `Sua chave de treinador é: ${key}`);
      } else {
        await updateStudentProfile(userId, displayName, phone, trainerId!);
      }

      router.replace('/(tabs)');
    } catch(e:any){
      Alert.alert('Erro ao criar conta', e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.c,{ backgroundColor:isDark?'#000':'#fff' }]}>
      <TextField placeholder="Nome" value={displayName} onChangeText={setDisplayName}/>
      <TextField placeholder="Telefone" keyboardType="phone-pad" value={phone} onChangeText={setPhone}/>
      <TextField placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail}/>
      <PasswordField placeholder="Senha" value={password} onChangeText={setPassword}/>
      <RadioGroup
        options={[{label:'Sou aluno', value:'student'},{label:'Sou treinador', value:'trainer'}]}
        value={role} onChange={setRole}
      />
      {role==='student' && (
        <TextField placeholder="Chave do treinador (ex: AB12-CD34)" autoCapitalize="characters"
          value={typedKey} onChangeText={setTypedKey}/>
      )}
      <PrimaryButton title={loading?'Criando...':'Criar conta'} onPress={handle} loading={loading}/>
      <Link href="/sign-in" style={[styles.b,{ color:isDark?'#bbb':'#666' }]}>Já tenho conta</Link>
    </View>
  );
}
const styles = StyleSheet.create({ c:{flex:1,justifyContent:'center',padding:24,gap:12}, b:{marginTop:16,alignSelf:'center'}});

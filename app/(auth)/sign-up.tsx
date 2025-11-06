import { Link, router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import PasswordField from '@/components/ui/PasswordField';
import PhoneField, { PhoneFieldHandle } from '@/components/ui/PhoneField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { RadioGroup } from '@/components/ui/RadioGroup';
import TextField from '@/components/ui/TextField';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { signUpNoConfirm } from '@/services/auth';
import { updateStudentProfile, type Gender } from '@/services/profile';
import {
  assignTrainerKeyWithRetry,
  normalizeTrainerKeyDisplay,
  normalizeTrainerKeyRaw,
  validateTrainerKey,
} from '@/services/trainer';

type Role = 'trainer' | 'student';

export default function SignUpScreen() {
  const isDark = useColorScheme() === 'dark';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [gender, setGender] = useState<Gender>('other');
  const [typedKey, setTypedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const phoneRef = useRef<PhoneFieldHandle>(null);
  const [phoneE164, setPhoneE164] = useState('');

  async function handle() {
    if (!displayName || !email || !password)
      return Alert.alert('Atenção', 'Preencha nome, e-mail e senha.');
    if (password.length < 6)
      return Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
    if (password !== confirm)
      return Alert.alert('Atenção', 'As senhas não coincidem.');

    const e164 = (phoneRef.current?.getE164() ?? '').trim();
    const phoneToSave: string | null = e164.length ? e164 : null;

    setLoading(true);
    try {
      let trainerId: string | null = null;

      if (role === 'student') {
        if (normalizeTrainerKeyRaw(typedKey).length < 8) {
          setLoading(false);
          return Alert.alert('Atenção', 'A chave deve ter 8 caracteres.');
        }
        const valid = await validateTrainerKey(typedKey);
        if (!valid) {
          setLoading(false);
          return Alert.alert('Atenção', 'Chave de treinador inválida.');
        }
        trainerId = valid;
      }

      const userId = await signUpNoConfirm(email, password);

      if (role === 'trainer') {
        const key = await assignTrainerKeyWithRetry(
          userId,
          displayName,
          phoneToSave ?? '',
          'trainer',
          gender,
        );
        Alert.alert('Conta criada!', `Sua chave de treinador é: ${key}`);
      } else {
        await updateStudentProfile(userId, displayName, phoneToSave, trainerId!, gender);
      }

      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erro ao criar conta', e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.c, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <TextField placeholder="Nome" value={displayName} onChangeText={setDisplayName} />

      <PhoneField ref={phoneRef} defaultCountry="BR" onChangeE164={setPhoneE164} />

      <TextField placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />

      <PasswordField placeholder="Senha" value={password} onChangeText={setPassword} />
      <PasswordField placeholder="Confirmar senha" value={confirm} onChangeText={setConfirm} />

      <RadioGroup
        options={[
          { label: 'Sou aluno', value: 'student' },
          { label: 'Sou treinador', value: 'trainer' },
        ]}
        value={role}
        onChange={setRole}
      />

      <RadioGroup
        options={[
          { label: 'Masculino', value: 'male' },
          { label: 'Feminino', value: 'female' },
          { label: 'Outro', value: 'other' },
        ]}
        value={gender}
        onChange={v => setGender(v as Gender)}
      />

      {role === 'student' && (
        <TextField
          placeholder="Chave do treinador (ex: AB12-CD34)"
          autoCapitalize="characters"
          value={typedKey}
          onChangeText={(v) => setTypedKey(normalizeTrainerKeyDisplay(v))}
          maxLength={9}
        />
      )}

      <PrimaryButton
        title={loading ? 'Criando...' : 'Criar conta'}
        onPress={handle}
        loading={loading}
      />
      <Link href="/sign-in" style={[styles.b, { color: isDark ? '#bbb' : '#666' }]}>
        Já tenho conta
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  b: { marginTop: 16, alignSelf: 'center' },
});

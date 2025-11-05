import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { generateTrainerKey, normalizeKey } from '@/lib/trainer-key';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Button,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type Role = 'trainer' | 'student';

export default function SignUpScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [typedKey, setTypedKey] = useState('');
  const [loading, setLoading] = useState(false);

  async function validateTrainerKeyOrThrow(keyRaw: string) {
    const key = normalizeKey(keyRaw);
    if (!key) throw new Error('Informe a chave do treinador.');

    try {
      const { data, error } = await supabase.rpc('validate_trainer_key', { p_key: key });
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Chave de treinador inválida.');
      return data[0].id as string;
    } catch (err: any) {
      const { data: vdata, error: verr } = await supabase
        .from('trainers_public')
        .select('id')
        .eq('trainer_key', key)
        .maybeSingle();
      if (verr || !vdata) throw new Error('Chave de treinador inválida.');
      return vdata.id as string;
    }
  }

  async function ensureSessionAfterSignUp(email: string, password: string) {
    const { data: me } = await supabase.auth.getUser();
    if (me.user) return me.user.id;

    const { data: signed, error: signErr } =
      await supabase.auth.signInWithPassword({ email, password });
    if (signErr) throw signErr;

    const userId = signed.user?.id;
    if (!userId) throw new Error('Não foi possível obter a sessão após o cadastro.');
    return userId;
  }

  async function handleSignUp() {
    if (!displayName || !email || !password) {
      return Alert.alert('Atenção', 'Preencha nome, e-mail e senha.');
    }

    setLoading(true);
    try {
      let trainerId: string | null = null;
      if (role === 'student') {
        trainerId = await validateTrainerKeyOrThrow(typedKey);
      }

      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      const authedUserId = await ensureSessionAfterSignUp(email, password);

      if (role === 'trainer') {
        let trainerKey: string | null = null;
        for (let i = 0; i < 5; i++) {
          const candidate = generateTrainerKey();
          const { error: upErr }: any = await supabase
            .from('profiles')
            .update({
              display_name: displayName,
              phone,
              role,
              trainer_key: candidate,
              trainer_id: null,
            })
            .eq('user_id', authedUserId);

          if (!upErr) {
            trainerKey = candidate;
            break;
          }
          if (upErr.code !== '23505') throw upErr;
        }
        if (!trainerKey) throw new Error('Não foi possível gerar uma chave única. Tente novamente.');

        Alert.alert(
          'Conta criada!',
          `Sua chave de treinador é: ${trainerKey}\nGuarde-a — você poderá ver/editar no seu perfil.`
        );
      } else {
        const { error: upErr } = await supabase
          .from('profiles')
          .update({
            display_name: displayName,
            phone,
            role,
            trainer_key: null,
            trainer_id: trainerId,
          })
          .eq('user_id', authedUserId);
        if (upErr) throw upErr;
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
      <TextInput
        placeholder="Nome"
        value={displayName}
        onChangeText={setDisplayName}
        style={[styles.i, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#ccc' }]}
        placeholderTextColor={isDark ? '#888' : '#888'}
      />
      <TextInput
        placeholder="Telefone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={[styles.i, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#ccc' }]}
        placeholderTextColor={isDark ? '#888' : '#888'}
      />
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

      <View style={styles.row}>
        <Radio label="Sou aluno" selected={role === 'student'} onPress={() => setRole('student')} isDark={isDark} />
        <Radio label="Sou treinador" selected={role === 'trainer'} onPress={() => setRole('trainer')} isDark={isDark} />
      </View>

      {role === 'student' && (
        <TextInput
          placeholder="Chave do treinador (ex: AB12-CD34)"
          autoCapitalize="characters"
          value={typedKey}
          onChangeText={setTypedKey}
          style={[styles.i, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#ccc' }]}
          placeholderTextColor={isDark ? '#888' : '#888'}
        />
      )}

      <Button title={loading ? 'Criando...' : 'Criar conta'} onPress={handleSignUp} disabled={loading} />
      <Link href="/sign-in" style={[styles.b, { color: isDark ? '#bbb' : '#666' }]}>Já tenho conta</Link>
    </View>
  );
}

function Radio({
  label,
  selected,
  onPress,
  isDark,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.radioWrap}>
      <View
        style={[
          styles.dot,
          { borderColor: isDark ? '#aaa' : '#666' },
          selected && { backgroundColor: isDark ? '#aaa' : '#666' },
        ]}
      />
      <Text style={{ color: isDark ? '#fff' : '#000' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  i: { borderWidth: 1, borderRadius: 8, padding: 12 },
  b: { marginTop: 16, alignSelf: 'center' },
  row: { flexDirection: 'row', gap: 16, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  radioWrap: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
});

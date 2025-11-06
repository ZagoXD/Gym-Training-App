import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import PhoneField, { PhoneFieldHandle } from '@/components/ui/PhoneField';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextField from '@/components/ui/TextField';
import { useAuth } from '@/hooks/use-auth';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';

import { RadioGroup } from '@/components/ui/RadioGroup';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  getAuthEmail,
  getOwnProfileWithTrainer,
  ProfileSummary,
  updateOwnProfile,
  type Gender,
} from '@/services/profile';
import { uploadAvatar } from '@/services/storage';

export default function UsersScreen() {
  const { userId } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>('other');
  const [loading, setLoading] = useState(false);
  const phoneRef = useRef<PhoneFieldHandle>(null);
  const [phoneE164, setPhoneE164] = useState<string>('');

  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  const cardBg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [p, e] = await Promise.all([
        getOwnProfileWithTrainer(userId),
        getAuthEmail(),
      ]);
      setProfile(p);
      setEmail(e);
      setDisplayName(p.display_name ?? '');
      setBio(p.bio ?? '');
      setAvatarUrl(p.avatar_url ?? null);
      setPhoneE164(p.phone ?? '');
      setGender((p.gender as Gender) ?? 'other');
    })();
  }, [userId]);

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (res.canceled || !res.assets?.[0]?.uri) return;

    try {
      setLoading(true);
      const publicUrl = await uploadAvatar(res.assets[0].uri);
      await updateOwnProfile({ avatar_url: publicUrl });
      setAvatarUrl(publicUrl);
    } catch (e: any) {
      Alert.alert('Erro ao enviar foto', e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    try {
      setLoading(true);
      await updateOwnProfile({
        display_name: displayName,
        phone: (phoneE164 ?? '').trim() || null,
        bio,
        gender,
      });
      Alert.alert('Pronto', 'Perfil atualizado!');
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.screen}>
        <ThemedText type="title">Meu perfil</ThemedText>

        <View style={styles.avatarRow}>
          <View style={[styles.avatarWrap, { backgroundColor: cardBg }]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: border }]} />
            )}
          </View>
          <PrimaryButton
            title={loading ? 'Enviando...' : 'Trocar foto'}
            onPress={pickPhoto}
            disabled={loading}
          />
        </View>

        <TextField label="Nome" value={displayName} onChangeText={setDisplayName} />

        <ThemedText style={{ marginBottom: -4, color: text }}>Telefone</ThemedText>
        <PhoneField
          ref={phoneRef}
          defaultCountry="BR"
          initialE164={phoneE164}
          onChangeE164={setPhoneE164}
          placeholder="Telefone"
        />

        <TextField label="E-mail" value={email ?? ''} editable={false} />

        <ThemedText style={{ color: text }}>Gênero</ThemedText>
        <RadioGroup
          options={[
            { label: 'Masculino ♂', value: 'male' },
            { label: 'Feminino ♀', value: 'female' },
            { label: 'Outro ⚧', value: 'other' },
          ]}
          value={gender}
          onChange={(v) => setGender(v as Gender)}
        />

        <TextField
          label="Biografia"
          value={bio}
          onChangeText={setBio}
          multiline
          style={{ height: 100, textAlignVertical: 'top' }}
        />

        <PrimaryButton
          title={loading ? 'Salvando...' : 'Salvar'}
          onPress={save}
          disabled={loading}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  avatarWrap: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden' },
  avatar: { width: 72, height: 72, borderRadius: 36 },
});

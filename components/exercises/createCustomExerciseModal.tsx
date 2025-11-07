import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Chips, { ChipItem } from '@/components/ui/Chips';
import PrimaryButton from '@/components/ui/PrimaryButton';
import TextField from '@/components/ui/TextField';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  createCustomExercise,
  deleteCustomExerciseImage,
  updateCustomExercise,
  type CustomExerciseUpsert,
} from '@/services/custom-exercises';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

type Props = {
  open: boolean;
  onClose: () => void;
  categories: ChipItem[];
  defaultCategoryId?: number | null;

  initial?: {
    id: string;
    name: string;
    description?: string | null;
    category_id: number;
    images: string[];
    video_url?: string | null;
  } | null;

  onCreated: (exerciseId: string) => void;
  onUpdated?: (exerciseId: string) => void;
};

export default function CreateCustomExerciseModal({
  open,
  onClose,
  categories,
  defaultCategoryId = null,
  initial = null,
  onCreated,
  onUpdated,
}: Props) {
  const border  = useThemeColor({}, 'border');
  const panelBg = useThemeColor({}, 'card');
  const text    = useThemeColor({}, 'text');

  const isEditing = !!initial;
  const isDark = useColorScheme() === 'dark';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(defaultCategoryId);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  function isHttpUrl(s: string) {
    return /^https?:\/\//i.test(s);
  }

  useEffect(() => {
    if (!open) return;
    if (isEditing && initial) {
      setName(initial.name ?? '');
      setDescription(initial.description ?? '');
      setCategoryId(initial.category_id ?? null);
      setImages(initial.images ?? []);
      setVideoUrl((initial as any).video_url ?? '');
    } else {
      setName('');
      setDescription('');
      setCategoryId(defaultCategoryId ?? null);
      setImages([]);
      setVideoUrl('');
    }
  }, [open, isEditing, initial, defaultCategoryId]);

  const canSave = useMemo(
    () => name.trim().length > 0 && !!categoryId && !loading,
    [name, categoryId, loading]
  );

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsMultipleSelection: true,
      selectionLimit: 6,
    });
    if (res.canceled) return;
    const uris = (res.assets ?? []).map(a => a.uri).filter(Boolean) as string[];
    setImages(prev => [...prev, ...uris]);
  }

  async function save() {
    if (!canSave) return;
    try {
      setLoading(true);
      const payload: CustomExerciseUpsert = {
        name: name.trim(),
        description: description.trim() || null,
        category_id: categoryId as number,
        imageUris: images,
        videoUrl: videoUrl.trim() || null,
      };

      if (isEditing && initial) {
        const id = await updateCustomExercise(initial.id, payload);
        onUpdated?.(id);
      } else {
        const id = await createCustomExercise(payload);
        onCreated(id);
      }
      onClose();
    } catch (e: any) {
      alert(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={open} animationType="fade" onRequestClose={onClose} transparent>
      <ThemedView
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <ThemedView
          style={{
            width: '92%',
            maxWidth: 720,
            maxHeight: '85%',
            borderRadius: 16,
            backgroundColor: panelBg,
            borderWidth: 1,
            borderColor: border,
            overflow: 'hidden',
          }}
        >
          <ScrollView
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator
          >
            <ThemedText type="subtitle">
              {isEditing ? 'Editar exercício' : 'Novo exercício'}
            </ThemedText>

            <TextField
              label="Nome do exercício"
              placeholder="Ex.: Remada curvada"
              value={name}
              onChangeText={setName}
              autoCapitalize="sentences"
              returnKeyType="next"
              rightAdornment={
                name ? (
                  <TouchableOpacity onPress={() => setName('')}>
                    <ThemedText style={{ fontSize: 12, color: text }}>limpar</ThemedText>
                  </TouchableOpacity>
                ) : null
              }
              style={{ paddingVertical: Platform.select({ ios: 12, android: 10 }) }}
            />

            <TextField
              label="Descrição (opcional)"
              placeholder="Escreva instruções, dicas de execução, respiração, etc."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              style={{
                height: 120,
                textAlignVertical: 'top',
                paddingVertical: Platform.select({ ios: 12, android: 10 }),
              }}
            />

            <Chips
              items={categories}
              value={categoryId}
              onChange={(v) => setCategoryId(v as number | null)}
              isDark={isDark}
              borderColor={border}
              includeAll={false}
            />

            <TextField
              label="Link do vídeo (YouTube - opcional)"
              placeholder="https://youtu.be/abc123..."
              value={videoUrl}
              onChangeText={setVideoUrl}
              autoCapitalize="none"
              keyboardType="url"
              returnKeyType="done"
              style={{ paddingVertical: Platform.select({ ios: 12, android: 10 }) }}
            />

            <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
              {images.map((uri, i) => (
                <View key={`${uri}-${i}`} style={{ width: 88, height: 88, borderRadius: 8, overflow: 'hidden' }}>
                  <Image
                    source={{ uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />

                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        if (isEditing && initial && isHttpUrl(uri)) {
                          setLoading(true);
                          await deleteCustomExerciseImage(initial.id, uri);
                        }
                        setImages(prev => prev.filter(u => u !== uri));
                      } catch (e: any) {
                        alert(e.message ?? String(e));
                      } finally {
                        setLoading(false);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      borderWidth: 1,
                      borderColor: border,
                    }}
                    activeOpacity={0.85}
                  >
                    <ThemedText style={{ color: '#fff', fontSize: 12 }}>✕</ThemedText>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                onPress={pickImage}
                style={{
                  width: 88, height: 88, borderRadius: 8, borderWidth: 1, borderColor: border,
                  alignItems: 'center', justifyContent: 'center'
                }}
              >
                <ThemedText style={{ fontSize: 24 }}>＋</ThemedText>
              </TouchableOpacity>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <PrimaryButton title="Cancelar" onPress={onClose} />
              <PrimaryButton
                title={loading ? (isEditing ? 'Salvando…' : 'Criando…') : (isEditing ? 'Salvar alterações' : 'Salvar')}
                onPress={save}
                loading={loading}
                disabled={!canSave}
              />
            </View>
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

import ExerciseCard from '@/components/exercises/ExerciseCard';
import ExerciseModal from '@/components/exercises/ExerciseModal';
import CreateCustomExerciseModal from '@/components/exercises/createCustomExerciseModal';
import Chips, { type ChipItem } from '@/components/ui/Chips';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExercises } from '@/hooks/use-exercises';
import { useThemeColor } from '@/hooks/use-theme-color';

import {
  deleteCustomExercise,
  listCustomExercises,
  type CustomExercise,
} from '@/services/custom-exercises';
import { getOwnProfileWithTrainer, type Gender } from '@/services/profile';
import type { ExerciseCardData } from '@/services/wger';

import { labelCategoriaPt } from '@/utils/labels';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export default function ExercisesScreen() {
  const { userId } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const [isTrainer, setIsTrainer] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);

  const [open, setOpen] = useState<ExerciseCardData | null>(null);
  const [openCustom, setOpenCustom] = useState<CustomExercise | null>(null);

  const { state, actions } = useExercises();
  const { query, categoryId, loading, items, categories } = state;
  const { setQuery, setCategoryId, loadMore } = actions;

  const [customs, setCustoms] = useState<CustomExercise[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function refreshCustoms() {
    const list = await listCustomExercises();
    setCustoms(list);
  }

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const me = await getOwnProfileWithTrainer(userId);
      setIsTrainer(me.role === 'trainer');
      setGender(me.gender ?? 'other');
      await refreshCustoms();
    })();
  }, [userId]);

  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const bg         = useThemeColor({}, 'background');
  const fg         = useThemeColor({}, 'text');
  const muted      = useThemeColor({}, 'muted');
  const cardBg     = useThemeColor({}, 'card');
  const border     = useThemeColor({}, 'border');
  const underline  = useThemeColor({}, 'underline');
  const tabInactive= useThemeColor({}, 'tabInactive');
  const chipBorder = useThemeColor({}, 'chipBorder');
  const inputBg    = useThemeColor({}, 'inputBg');

  function escapeHtml(s: string) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function plainToHtml(s: string) {
    if (!s) return '';
    const parts = s
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split(/\n{2,}/);
    return parts
      .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }
  function hashToNegInt(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return -Math.abs(h || 1);
  }

  const categoryItems = useMemo<ChipItem[]>(
    () => categories.map((c) => ({ key: c.id, label: labelCategoriaPt(c.name) })),
    [categories]
  );

  const dedupedItems = useMemo(() => {
    const seen = new Set<number>();
    const out: ExerciseCardData[] = [];
    for (const it of items) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      out.push(it);
    }
    return out;
  }, [items]);

  const goToTab = (index: number) => {
    setTabIndex(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== tabIndex) setTabIndex(newIndex);
  };

  const customAsCard = (ce: CustomExercise): ExerciseCardData => {
    const catName = categories.find((c) => c.id === ce.category_id)?.name ?? undefined;
    return {
      id: hashToNegInt(ce.id),
      namePt: ce.name,
      descPt: plainToHtml(ce.description ?? ''),
      category: catName,
      focus: [],
      images: ce.images,
    };
  };

  const SearchChips = () => (
    <ThemedView style={{ padding: 12, gap: 10 }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Pesquisar exercício"
        placeholderTextColor={muted}
        style={{
          borderWidth: 1,
          borderColor: border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: Platform.select({ ios: 12, android: 10 }),
          color: fg,
          backgroundColor: inputBg,
        }}
      />
      <Chips
        items={categoryItems}
        value={categoryId}
        onChange={(v) => setCategoryId(v as number | null)}
        isDark={isDark}
        borderColor={chipBorder}
        includeAll
        allLabel="Todas"
        collapsedCount={8}
      />
    </ThemedView>
  );

  const TabBar: React.FC = () => {
    const underlineTranslate = scrollX.interpolate({
      inputRange: [0, width],
      outputRange: [0, width / 2],
      extrapolate: 'clamp',
    });

    return (
      <ThemedView style={{ paddingTop: 6 }}>
        <View style={{ flexDirection: 'row' }}>
          {(['Geral', 'Customizados'] as const).map((label, i) => {
            const isActive = tabIndex === i;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => goToTab(i)}
                activeOpacity={0.7}
                style={{ width: width / 2, alignItems: 'center', paddingVertical: 12 }}
              >
                <ThemedText
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    color: isActive ? fg : tabInactive,
                  }}
                >
                  {label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 2, backgroundColor: border }} />
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: width / 2,
            height: 2,
            transform: [{ translateX: underlineTranslate }],
            backgroundColor: underline,
          }}
        />
      </ThemedView>
    );
  };

  const customsFiltered = useMemo(
    () =>
      customs.filter((c) => {
        const q = (query || '').trim().toLowerCase();
        const matchName = !q || c.name.toLowerCase().includes(q);
        const matchCat = !categoryId || c.category_id === categoryId;
        return matchName && matchCat;
      }),
    [customs, query, categoryId]
  );

  function handleLongPressCustom(item: CustomExercise) {
    if (!userId || item.trainer_id !== userId) return;
    Alert.alert(
      'Gerenciar exercício',
      'O que deseja fazer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomExercise(item.id);
              if (openCustom?.id === item.id) {
                setOpen(null);
                setOpenCustom(null);
              }
              await refreshCustoms();
            } catch (e: any) {
              Alert.alert('Erro', e.message ?? String(e));
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  const isOwner = !!(userId && openCustom && openCustom.trainer_id === userId);

  return (
    <ThemedView style={{ flex: 1 }}>
      {!isTrainer ? (
        <View style={styles.center}>
          <ThemedText>Apenas treinadores podem ver os exercícios.</ThemedText>
        </View>
      ) : (
        <>
          <TabBar />

          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumEnd}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
          >
            <ThemedView style={{ width, flex: 1 }}>
              <SearchChips />

              <FlatList
                data={dedupedItems}
                keyExtractor={(i) => String(i.id)}
                contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <ExerciseCard
                    item={item}
                    onPress={() => { setOpen(item); setOpenCustom(null); }}
                    cardBg={cardBg}
                    borderColor={border}
                    fg={fg}
                    muted={muted}
                    gender={gender}
                  />
                )}
                onEndReachedThreshold={0.4}
                onEndReached={loadMore}
                ListFooterComponent={
                  loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null
                }
                ListEmptyComponent={
                  !loading ? (
                    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                      <ThemedText style={{ color: muted }}>
                        Nenhum exercício encontrado.
                      </ThemedText>
                    </View>
                  ) : null
                }
              />
            </ThemedView>

            {/* ABA 2 — CUSTOMIZADOS */}
            <ThemedView style={{ width, flex: 1 }}>
              {/* Busca + Novo */}
              <ThemedView style={{ padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Pesquisar exercício"
                    placeholderTextColor={muted}
                    style={{
                      borderWidth: 1,
                      borderColor: border,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: Platform.select({ ios: 12, android: 10 }),
                      color: fg,
                      backgroundColor: inputBg,
                    }}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => setCreateOpen(true)}
                  activeOpacity={0.7}
                  style={{
                    marginLeft: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: border,
                    backgroundColor: cardBg,
                  }}
                >
                  <ThemedText style={{ fontWeight: '700' }}>Novo</ThemedText>
                </TouchableOpacity>
              </ThemedView>

              <Chips
                items={categoryItems}
                value={categoryId}
                onChange={(v) => setCategoryId(v as number | null)}
                isDark={isDark}
                borderColor={chipBorder}
                includeAll
                allLabel="Todas"
                collapsedCount={8}
              />

              <FlatList
                data={customsFiltered}
                keyExtractor={(i) => i.id}
                contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onLongPress={() => handleLongPressCustom(item)}
                    >
                      <ExerciseCard
                        item={customAsCard(item)}
                        onPress={() => { setOpen(customAsCard(item)); setOpenCustom(item); }}
                        cardBg={cardBg}
                        borderColor={border}
                        fg={fg}
                        muted={muted}
                        gender={gender}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                    <ThemedText style={{ color: muted }}>
                      Nenhum exercício customizado.
                    </ThemedText>
                  </View>
                }
              />
            </ThemedView>
          </Animated.ScrollView>
        </>
      )}

      <ExerciseModal
        open={open}
        onClose={() => setOpen(null)}
        bg={bg}
        borderColor={border}
        fg={fg}
        muted={muted}
        videoUrl={openCustom?.video_url ?? undefined}
        actions={
          isOwner ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setEditOpen(true)}
                style={{ paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: border, borderRadius: 8 }}
              >
                <ThemedText>Editar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!openCustom) return;
                  Alert.alert('Excluir', 'Deseja excluir este exercício?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Excluir',
                      style: 'destructive',
                      onPress: async () => {
                        await deleteCustomExercise(openCustom.id);
                        setOpen(null);
                        setOpenCustom(null);
                        await refreshCustoms();
                      },
                    },
                  ]);
                }}
                style={{ paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: border, borderRadius: 8 }}
              >
                <ThemedText>Excluir</ThemedText>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <CreateCustomExerciseModal
        open={createOpen || editOpen}
        onClose={() => { setCreateOpen(false); setEditOpen(false); }}
        categories={categoryItems}
        defaultCategoryId={categoryId ?? undefined}
        initial={editOpen && openCustom ? {
          id: openCustom.id,
          name: openCustom.name,
          description: openCustom.description ?? '',
          category_id: openCustom.category_id,
          images: openCustom.images,
          video_url: openCustom.video_url ?? null, 
        } : null}
        onCreated={async () => {
          await refreshCustoms();
          goToTab(1);
        }}
        onUpdated={async () => {
          await refreshCustoms();
          if (openCustom) {
            const refreshed = (await listCustomExercises()).find(c => c.id === openCustom.id);
            if (refreshed) {
              setOpen(customAsCard(refreshed));
              setOpenCustom(refreshed);
            } else {
              setOpen(null);
              setOpenCustom(null);
            }
          }
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

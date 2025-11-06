import ExerciseCard from '@/components/exercises/ExerciseCard';
import ExerciseModal from '@/components/exercises/ExerciseModal';
import Chips, { type ChipItem } from '@/components/ui/Chips';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExercises } from '@/hooks/use-exercises';
import type { Gender } from '@/services/profile';
import { getOwnProfileWithTrainer } from '@/services/profile';
import type { ExerciseCardData } from '@/services/wger';
import { labelCategoriaPt } from '@/utils/labels';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ExercisesScreen() {
  const { userId } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const [isTrainer, setIsTrainer] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [open, setOpen] = useState<ExerciseCardData | null>(null);

  const { state, actions } = useExercises();
  const { query, categoryId, loading, items, categories } = state;
  const { setQuery, setCategoryId, loadMore } = actions;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const me = await getOwnProfileWithTrainer(userId);
      setIsTrainer(me.role === 'trainer');
      setGender(me.gender ?? 'other');
    })();
  }, [userId]);

  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const bg        = useThemeColor({}, 'background');
  const fg        = useThemeColor({}, 'text');
  const muted     = useThemeColor({}, 'muted');
  const cardBg    = useThemeColor({}, 'card');
  const border    = useThemeColor({}, 'border');
  const underline = useThemeColor({}, 'underline');
  const tabInactive = useThemeColor({}, 'tabInactive');
  const chipBorder = useThemeColor({}, 'chipBorder');
  const inputBg  = useThemeColor({}, 'inputBg');

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
                    onPress={() => setOpen(item)}
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

            <ThemedView style={{ width, flex: 1 }}>
              <SearchChips />
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
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

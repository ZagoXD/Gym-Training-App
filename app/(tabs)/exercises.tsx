import ExerciseCard from '@/components/exercises/ExerciseCard';
import ExerciseModal from '@/components/exercises/ExerciseModal';
import Chips, { type ChipItem } from '@/components/ui/Chips';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExercises } from '@/hooks/use-exercises';
import { getOwnProfileWithTrainer } from '@/services/profile';
import type { ExerciseCardData } from '@/services/wger';
import { labelCategoriaPt } from '@/utils/labels';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ExercisesScreen() {
  const { userId } = useAuth();
  const isDark = useColorScheme() === 'dark';
  const [isTrainer, setIsTrainer] = useState(false);
  const [open, setOpen] = useState<ExerciseCardData | null>(null);

  const { state, actions } = useExercises();
  const { query, categoryId, focus, loading, items, categories } = state;
  const { setQuery, setCategoryId, setFocus, loadMore } = actions;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const me = await getOwnProfileWithTrainer(userId);
      setIsTrainer(me.role === 'trainer');
    })();
  }, [userId]);

  const bg = isDark ? '#0b0b0b' : '#fff';
  const fg = isDark ? '#fff' : '#000';
  const muted = '#888';
  const cardBg = isDark ? '#111' : '#fafafa';
  const border = isDark ? '#2a2a2a' : '#ddd';

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

  if (!isTrainer) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <Text style={{ color: fg }}>Apenas treinadores podem ver os exercícios.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ padding: 12, gap: 10 }}>
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
            paddingVertical: 10,
            color: fg,
            backgroundColor: bg,
          }}
        />

        <Chips
          items={categoryItems}
          value={categoryId}
          onChange={(v) => setCategoryId(v as number | null)}
          isDark={isDark}
          borderColor={border}
          includeAll
          allLabel="Todas"
          collapsedCount={8}
        />
      </View>

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
          />
        )}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ color: muted }}>Nenhum exercício encontrado.</Text>
            </View>
          ) : null
        }
      />

      <ExerciseModal
        open={open}
        onClose={() => setOpen(null)}
        bg={bg}
        borderColor={border}
        fg={fg}
        muted={muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

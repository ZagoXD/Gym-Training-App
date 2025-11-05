import { ExerciseCardData, fetchCategories, fetchExercisePage } from '@/services/wger';
import { useCallback, useEffect, useState } from 'react';

export type FocusKey = 'Bíceps'|'Tríceps'|'Pernas'|'Peito'|'Costas'|'Ombros'|'Abdômen'|null;

export function useExercises() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [focus, setFocus] = useState<FocusKey>(null);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ExerciseCardData[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const [categories, setCategories] = useState<{id:number; name:string}[]>([]);

  useEffect(() => { (async () => setCategories(await fetchCategories()))(); }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchExercisePage({
        limit: 20, offset: 0, search: query,
        categoryId: categoryId ?? undefined, focus,
      });
      setItems(page.items);
      setNextOffset(page.nextOffset);
    } finally { setLoading(false); }
  }, [query, categoryId, focus]);

  useEffect(() => { reload(); }, [reload]);

  const loadMore = useCallback(async () => {
    if (loading || nextOffset == null) return;
    setLoading(true);
    try {
      const page = await fetchExercisePage({
        limit: 20, offset: nextOffset, search: query,
        categoryId: categoryId ?? undefined, focus,
      });
      setItems(prev => [...prev, ...page.items]);
      setNextOffset(page.nextOffset);
    } finally { setLoading(false); }
  }, [loading, nextOffset, query, categoryId, focus]);

  return {
    state: { query, categoryId, focus, loading, items, nextOffset, categories },
    actions: { setQuery, setCategoryId, setFocus, loadMore, reload },
  };
}

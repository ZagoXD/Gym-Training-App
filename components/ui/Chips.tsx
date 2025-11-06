import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export type ChipItem = { key: string | number; label: string };

export default function Chips({
  items,
  value,
  onChange,
  isDark,
  borderColor,
  /** mostra o chip “Todos” (valor = null) antes dos demais */
  includeAll = false,
  allLabel = 'Todos',
  /** quantos chips mostrar antes do “Mostrar mais” (0 = sem colapso) */
  collapsedCount = 0,
}: {
  items: ChipItem[];
  value: string | number | null;
  onChange: (v: string | number | null) => void;
  isDark: boolean;
  borderColor: string;
  includeAll?: boolean;
  allLabel?: string;
  collapsedCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const fg = isDark ? '#fff' : '#000';

  const fullItems = useMemo(
    () => (includeAll ? [{ key: '__ALL__', label: allLabel }, ...items] : items),
    [items, includeAll, allLabel]
  );

  const visible = useMemo(() => {
    if (!collapsedCount || expanded) return fullItems;
    return fullItems.slice(0, collapsedCount);
  }, [fullItems, collapsedCount, expanded]);

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {visible.map((it) => {
          const isAll = it.key === '__ALL__';
          const active = (isAll && value === null) || (!isAll && value === it.key);
          return (
            <Pressable
              key={String(it.key)}
              onPress={() => onChange(isAll ? null : it.key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? (isDark ? '#1f6feb' : '#2563eb') : 'transparent',
                borderWidth: 1,
                borderColor,
              }}
            >
              <Text style={{ color: active ? '#fff' : fg, fontSize: 13 }}>{it.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {collapsedCount > 0 && fullItems.length > collapsedCount && (
        <Pressable
          onPress={() => setExpanded((s) => !s)}
          style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4 }}
        >
          <Text style={{ color: isDark ? '#9ab' : '#3366cc', fontSize: 13 }}>
            {expanded ? 'Mostrar menos' : 'Mostrar mais'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

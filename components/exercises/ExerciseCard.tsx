import type { Gender } from '@/services/profile';
import { ExerciseCardData } from '@/services/wger';
import { labelCategoriaPt } from '@/utils/labels';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  item: ExerciseCardData;
  onPress: () => void;
  cardBg: string;
  borderColor: string;
  fg: string;
  muted: string;
  gender: Gender | null;
};

const ASSETS = {
  female: {
    abdomen: require('@/assets/icons/abs_feminino.png'),
    bracos: require('@/assets/icons/bracos_feminino.png'),
    cardio: require('@/assets/icons/cardio.png'),
    costas: require('@/assets/icons/costas_feminino.png'),
    peito: require('@/assets/icons/peito_feminino.png'),
    pernas: require('@/assets/icons/pernas_feminino.png'),
    pescoco: require('@/assets/icons/pescoco_feminino.png'),
  },
  male: {
    abdomen: require('@/assets/icons/abs_masculino.png'),
    bracos: require('@/assets/icons/bracos_masculino.png'),
    cardio: require('@/assets/icons/cardio.png'),
    costas: require('@/assets/icons/costas_masculino.png'),
    peito: require('@/assets/icons/peito_masculino.png'),
    pernas: require('@/assets/icons/pernas_masculino.png'),
    pescoco: require('@/assets/icons/pescoco_masculino.png'),
  },
} as const;

function slugFromCategoriaPt(categoriaPt: string): keyof typeof ASSETS.female | null {
  const key = (categoriaPt || '').toLowerCase();
  if (key.includes('abdômen')) return 'abdomen';
  if (key.includes('braço')) return 'bracos';
  if (key.includes('costas')) return 'costas';
  if (key.includes('peito')) return 'peito';
  if (key.includes('perna') || key.includes('panturr') || key.includes('adutor')) return 'pernas';
  if (key.includes('cardio')) return 'cardio';
  if (key.includes('pescoço')) return 'pescoco';
  return null;
}

export default function ExerciseCard({
  item, onPress, cardBg, borderColor, fg, muted, gender,
}: Props) {
  const categoriaPt = item.category ? labelCategoriaPt(item.category) : '—';
  const hasPhoto = !!item.images[0];

  const genderKey = gender === 'female' ? 'female' : 'male';
  const slug = slugFromCategoriaPt(categoriaPt);
  const iconSrc = slug ? ASSETS[genderKey][slug] : null;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        gap: 12,
        borderWidth: 1,
        borderRadius: 16,
        padding: 10,
        alignItems: 'center',
        backgroundColor: cardBg,
        borderColor,
      }}
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {hasPhoto ? (
          <Image
            source={{ uri: item.images[0] }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : iconSrc ? (
          <Image source={iconSrc} style={{ width: 72, height: 72 }} resizeMode="contain" />
        ) : (
          <Text style={{ color: muted, fontSize: 12 }}>Sem imagem</Text>
        )}
      </View>

      <View style={{ flex: 1, gap: 6 }}>
        <Text numberOfLines={1} style={{ color: fg, fontWeight: '700', fontSize: 16 }}>
          {item.namePt}
        </Text>

        <Text numberOfLines={2} style={{ color: muted, fontSize: 12 }}>
          {categoriaPt}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {item.focus.slice(0, 3).map((f, i) => (
            <View
              key={`${item.id}-focus-${i}`}
              style={{
                borderWidth: 1,
                borderColor,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: fg, fontSize: 11 }}>{f}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

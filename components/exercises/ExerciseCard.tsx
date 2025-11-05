import { ExerciseCardData } from '@/services/wger';
import { labelCategoriaPt } from '@/utils/labels';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import Abdomen from '@/assets/icons/abdomen.svg';
import Bracos from '@/assets/icons/bracos.svg';
import Cardio from '@/assets/icons/cardio.svg';
import Costas from '@/assets/icons/costas.svg';
import Peito from '@/assets/icons/peito.svg';
import Pernas from '@/assets/icons/pernas.svg';
import Pescoco from '@/assets/icons/pescoco.svg';

type Props = {
  item: ExerciseCardData;
  onPress: () => void;
  cardBg: string;
  borderColor: string;
  fg: string;
  muted: string;
};

function IconForCategory({ categoriaPt, muted }: { categoriaPt: string; muted: string }) {
  const key = categoriaPt.toLowerCase();

  if (key.includes('abdômen')) return <Abdomen width={56} height={56} />;
  if (key.includes('braço'))   return <Bracos  width={56} height={56} />;
  if (key.includes('costas'))  return <Costas  width={56} height={56} />;
  if (key.includes('peito'))   return <Peito   width={56} height={56} />;
  if (key.includes('perna') || key.includes('panturr') || key.includes('adutor'))
    return <Pernas width={56} height={56} />;
  if (key.includes('cardio'))  return <Cardio  width={56} height={56} />;
  if (key.includes('pescoço')) return <Pescoco width={56} height={56} />;

  return <Text style={{ color: muted, fontSize: 12 }}>Sem imagem</Text>;
}

export default function ExerciseCard({ item, onPress, cardBg, borderColor, fg, muted }: Props) {
  const categoriaPt = item.category ? labelCategoriaPt(item.category) : '—';
  const hasPhoto = !!item.images[0];

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
        ) : (
          <IconForCategory categoriaPt={categoriaPt} muted={muted} />
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

import { ExerciseCardData } from '@/services/wger';
import React from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import RenderHTML from 'react-native-render-html';

export default function ExerciseModal({
  open,
  onClose,
  bg,
  borderColor,
  fg,
  muted,
}: {
  open: ExerciseCardData | null;
  onClose: () => void;
  bg: string;
  borderColor: string;
  fg: string;
  muted: string;
}) {
  const { width } = useWindowDimensions();

  if (!open) return null;

  return (
    <Modal visible={!!open} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            width: '100%',
            maxHeight: '85%',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderWidth: 1,
            padding: 14,
            backgroundColor: bg,
            borderColor,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 8,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text
                style={{
                  color: fg,
                  fontWeight: '800',
                  fontSize: 18,
                }}
                numberOfLines={2}
              >
                {open.namePt}
              </Text>

              <Text style={{ color: muted, marginTop: 4 }}>
                {open.category ?? '—'}
              </Text>
            </View>

            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: muted, fontSize: 14 }}>Fechar</Text>
            </Pressable>
          </View>

          {!!open.focus.length && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 12,
              }}
            >
              {open.focus.map((f, i) => (
                <View
                  key={i}
                  style={{
                    borderWidth: 1,
                    borderColor,
                    borderRadius: 999,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: fg, fontSize: 12 }}>{f}</Text>
                </View>
              ))}
            </View>
          )}

          {open.images?.length ? (
            <FlatList
              data={open.images}
              horizontal
              keyExtractor={(u, i) => String(i)}
              contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{
                    width: 240,
                    height: 180,
                    borderRadius: 10,
                    backgroundColor: '#111',
                  }}
                  resizeMode="cover"
                />
              )}
            />
          ) : (
            <Text
              style={{
                color: muted,
                marginBottom: 12,
              }}
            >
              Sem imagens disponíveis.
            </Text>
          )}

          {!!open.descPt && (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: borderColor,
                paddingTop: 12,
              }}
            >
              <Text
                style={{
                  color: fg,
                  fontWeight: '700',
                  marginBottom: 6,
                  fontSize: 15,
                }}
              >
                Descrição
              </Text>

              <ScrollView
                style={{
                  maxHeight: 190,
                }}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <RenderHTML
                  contentWidth={width - 28}
                  source={{ html: open.descPt }}
                  baseStyle={{
                    color: fg,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                  tagsStyles={{
                    p: { marginTop: 0, marginBottom: 10, color: fg, fontSize: 14, lineHeight: 20 },
                    li: { marginBottom: 6, color: fg, fontSize: 14, lineHeight: 20 },
                    ol: { paddingLeft: 18, marginBottom: 10, color: fg },
                    ul: { paddingLeft: 18, marginBottom: 10, color: fg },
                    strong: { fontWeight: '700', color: fg },
                    b: { fontWeight: '700', color: fg },
                  }}
                  defaultTextProps={{ selectable: false }}
                  enableExperimentalMarginCollapsing={true}
                />
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

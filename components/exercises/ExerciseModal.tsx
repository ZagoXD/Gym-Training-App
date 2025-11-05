import { ExerciseCardData } from '@/services/wger';
import React from 'react';
import { FlatList, Image, Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';

const { width } = useWindowDimensions();

export default function ExerciseModal({
  open, onClose, bg, borderColor, fg, muted,
}: {
  open: ExerciseCardData | null;
  onClose: () => void;
  bg: string; borderColor: string; fg: string; muted: string;
}) {
  return (
    <Modal visible={!!open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', alignItems:'center', justifyContent:'flex-end' }}>
        <View style={{
          width:'100%', maxHeight:'85%', borderTopLeftRadius:18, borderTopRightRadius:18,
          borderWidth:1, padding:14, backgroundColor: bg, borderColor
        }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <Text style={{ color: fg, fontWeight:'800', fontSize:18 }}>{open?.namePt}</Text>
            <Pressable onPress={onClose} style={{ padding:8 }}><Text style={{ color: muted }}>Fechar</Text></Pressable>
          </View>

          <Text style={{ color: muted, marginBottom:10 }}>{open?.category ?? '—'}</Text>

          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6, marginBottom:12 }}>
            {open?.focus.map((f, i) => (
              <View key={i} style={{ borderWidth:1, borderColor, borderRadius:999, paddingHorizontal:8, paddingVertical:4 }}>
                <Text style={{ color: fg, fontSize:12 }}>{f}</Text>
              </View>
            ))}
          </View>

          {open?.images?.length ? (
            <FlatList
              data={open.images}
              horizontal
              keyExtractor={(u,i) => String(i)}
              contentContainerStyle={{ gap:10 }}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={{ width:240, height:180, borderRadius:10, backgroundColor:'#111' }} resizeMode="cover" />
              )}
            />
          ) : (
            <Text style={{ color: muted, marginBottom:8 }}>Sem imagens disponíveis.</Text>
          )}
          {!!open?.descPt && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: fg, fontWeight: '700', marginBottom: 6 }}>
                Descrição
              </Text>

              <RenderHTML
                contentWidth={width - 28}
                source={{ html: open.descPt }}
                baseStyle={{ color: fg, fontSize: 14, lineHeight: 20 }}
                tagsStyles={{
                  p: { marginTop: 0, marginBottom: 10 },
                  li: { marginBottom: 6 },
                  ol: { paddingLeft: 18, marginBottom: 10 },
                  ul: { paddingLeft: 18, marginBottom: 10 },
                }}
                defaultTextProps={{ selectable: false }}
                enableExperimentalMarginCollapsing={true}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

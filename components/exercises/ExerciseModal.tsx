import { ExerciseCardData } from '@/services/wger';
import { labelCategoriaPt } from '@/utils/labels';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';

type YTState = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    if (host.includes('youtube.com')) {
      if (u.pathname === '/watch') {
        const v = u.searchParams.get('v');
        if (v) return v;
      }
      const shorts = u.pathname.match(/\/shorts\/([A-Za-z0-9_-]{6,})/i);
      if (shorts?.[1]) return shorts[1];
      const embed = u.pathname.match(/\/embed\/([A-Za-z0-9_-]{6,})/i);
      if (embed?.[1]) return embed[1];
    }

    if (host === 'youtu.be') {
      const m = u.pathname.match(/^\/([A-Za-z0-9_-]{6,})/);
      if (m?.[1]) return m[1];
    }
  } catch {}
  return null;
}

export default function ExerciseModal({
  open,
  onClose,
  bg,
  borderColor,
  fg,
  muted,
  actions,
}: {
  open: ExerciseCardData | null;
  onClose: () => void;
  bg: string;
  borderColor: string;
  fg: string;
  muted: string;
  actions?: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const maxSheetH = '85%';

  const videoUrl = 'https://www.youtube.com/shorts/xbvVqbKvUBc';
  const videoId = useMemo(() => (videoUrl ? extractYouTubeId(videoUrl) : null), [videoUrl]);
  const videoThumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  const [videoOpen, setVideoOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<YoutubeIframeRef>(null);

  const mediaData = useMemo(() => {
    const arr: Array<{ type: 'video' | 'image'; uri: string }> = [];
    if (videoId && videoThumb) arr.push({ type: 'video', uri: videoThumb });
    (open?.images ?? []).forEach((img) => arr.push({ type: 'image', uri: img }));
    return arr;
  }, [videoId, videoThumb, open?.images]);

  if (!open) return null;

  const playerW = Math.min(width - 24, 720);
  const playerH = (playerW * 9) / 16;

  return (
    <>
      <Modal visible={!!open && !videoOpen} transparent animationType="slide" onRequestClose={onClose}>
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
              maxHeight: maxSheetH as any,
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
                <Text style={{ color: fg, fontWeight: '800', fontSize: 18 }} numberOfLines={2}>
                  {open.namePt}
                </Text>
                <Text style={{ color: muted, marginTop: 4 }}>
                  {open.category ? labelCategoriaPt(open.category) : '—'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {actions ? <View style={{ marginRight: 6 }}>{actions}</View> : null}
                <Pressable onPress={onClose} style={{ padding: 8 }}>
                  <Text style={{ color: muted, fontSize: 14 }}>Fechar</Text>
                </Pressable>
              </View>
            </View>

            {!!open.focus.length && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
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

            {mediaData.length ? (
              <FlatList
                data={mediaData}
                horizontal
                keyExtractor={(item, i) => `${item.type}-${i}`}
                contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) =>
                  item.type === 'video' ? (
                    <Pressable
                      onPress={() => {
                        setVideoOpen(true);
                        setPlaying(true);
                      }}
                      style={{
                        width: 240,
                        height: 180,
                        borderRadius: 10,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor,
                      }}
                    >
                      <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      <View
                        style={{
                          position: 'absolute',
                          inset: 0,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0,0,0,0.15)',
                        }}
                      >
                        <MaterialIcons name="play-circle-outline" size={56} color="#fff" />
                      </View>
                    </Pressable>
                  ) : (
                    <Image
                      source={{ uri: item.uri }}
                      style={{
                        width: 240,
                        height: 180,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor,
                        backgroundColor: '#111',
                      }}
                      resizeMode="cover"
                    />
                  )
                }
              />
            ) : (
              <Text style={{ color: muted, marginBottom: 12 }}>Sem imagens disponíveis.</Text>
            )}

            {!!open.descPt && (
              <View style={{ borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 12 }}>
                <Text style={{ color: fg, fontWeight: '700', marginBottom: 6, fontSize: 15 }}>Descrição</Text>

                <ScrollView style={{ maxHeight: 190 }} nestedScrollEnabled showsVerticalScrollIndicator>
                  <RenderHTML
                    contentWidth={width - 28}
                    source={{ html: open.descPt }}
                    baseStyle={{ color: fg, fontSize: 14, lineHeight: 20 }}
                    tagsStyles={{
                      p: { marginTop: 0, marginBottom: 10, color: fg, fontSize: 14, lineHeight: 20 },
                      li: { marginBottom: 6, color: fg, fontSize: 14, lineHeight: 20 },
                      ol: { paddingLeft: 18, marginBottom: 10, color: fg },
                      ul: { paddingLeft: 18, marginBottom: 10, color: fg },
                      strong: { fontWeight: '700', color: fg },
                      b: { fontWeight: '700', color: fg },
                    }}
                    defaultTextProps={{ selectable: false }}
                    enableExperimentalMarginCollapsing
                  />
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={videoOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => {
          setPlaying(false);
          setVideoOpen(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <View style={{ width: playerW, height: playerH, backgroundColor: '#000' }}>
            {videoId ? (
              <YoutubePlayer
                ref={playerRef}
                width={playerW}
                height={playerH}
                videoId={videoId}
                play={playing}
                forceAndroidAutoplay
                onChangeState={(s: YTState) => {
                  if (s === 'ended') setPlaying(false);
                }}
                initialPlayerParams={{
                  controls: true,
                  modestbranding: true,
                  rel: false,
                }}
                webViewProps={{
                  allowsFullscreenVideo: true,
                  allowsInlineMediaPlayback: true,
                  mediaPlaybackRequiresUserAction: false,
                  androidLayerType: Platform.OS === 'android' ? 'hardware' : undefined,
                }}
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff' }}>Vídeo indisponível</Text>
              </View>
            )}

            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            />
          </View>

          <View style={{ marginTop: 12 }}>
            <Pressable
              onPress={() => {
                setPlaying(false);
                setVideoOpen(false);
              }}
              style={{
                alignSelf: 'center',
                paddingVertical: 10,
                paddingHorizontal: 14,
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff' }}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export default function PrimaryButton({
  title, onPress, loading, disabled,
}:{
  title: string; onPress: ()=>void; loading?: boolean; disabled?: boolean;
}) {
  const tint        = useThemeColor({}, 'tint');
  const onTint      = useThemeColor({}, 'onTint');
  const disabledBg  = useThemeColor({}, 'disabledBg');
  const disabledTxt = useThemeColor({}, 'disabledText');
  const ripple      = useThemeColor({}, 'ripple');

  const isDisabled = !!disabled || !!loading;
  const bg  = isDisabled ? disabledBg  : tint;
  const txt = isDisabled ? disabledTxt : onTint;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      android_ripple={{ color: ripple }}
      style={[styles.btn, { backgroundColor: bg }]}
    >
      {loading
        ? <ActivityIndicator color={txt} />
        : <Text style={[styles.txt, { color: txt }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn:{ padding:14, borderRadius:10, alignItems:'center' },
  txt:{ fontWeight:'600' },
});

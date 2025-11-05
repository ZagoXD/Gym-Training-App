import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export default function PrimaryButton({ title, onPress, loading, disabled }:{
  title: string; onPress: ()=>void; loading?: boolean; disabled?: boolean;
}) {
  const scheme = useColorScheme(); const isDark = scheme === 'dark';
  return (
    <Pressable disabled={disabled || loading} onPress={onPress}
      style={[styles.btn, { backgroundColor: isDark ? '#2d7' : '#0a7' , opacity: (disabled||loading)?0.6:1 }]}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt}>{title}</Text>}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  btn:{ padding:14, borderRadius:10, alignItems:'center' },
  txt:{ color:'#fff', fontWeight:'600' }
});

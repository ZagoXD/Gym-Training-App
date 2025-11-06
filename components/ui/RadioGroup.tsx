import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export function RadioGroup<T extends string>({
  options, value, onChange,
}:{
  options: {label:string; value:T}[];
  value: T; onChange:(v:T)=>void;
}) {
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');

  return (
    <View style={styles.row}>
      {options.map(o=>(
        <Pressable key={o.value} onPress={()=>onChange(o.value)} style={styles.item}>
          <View style={[
            styles.dot,
            { borderColor: border, backgroundColor: value===o.value ? tint : 'transparent' },
          ]}/>
          <ThemedText style={{ color: text }}>{o.label}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row:{ flexDirection:'row', gap:16, alignItems:'center', justifyContent:'center', marginVertical:8 },
  item:{ flexDirection:'row', gap:8, alignItems:'center' },
  dot:{ width:18, height:18, borderRadius:9, borderWidth:2 },
});

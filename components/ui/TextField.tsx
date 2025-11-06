import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  rightAdornment?: React.ReactNode;
};

export default function TextField({ label, error, style, rightAdornment, ...rest }: Props) {
  const hasRight = !!rightAdornment;

  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const inputBg = useThemeColor({}, 'inputBg');
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ color: text }}>{label}</Text> : null}

      <View style={{ position: 'relative' }}>
        <TextInput
          {...rest}
          style={[
            styles.input,
            { color: text, borderColor: border, backgroundColor: inputBg },
            hasRight && { paddingRight: 44 },
            style,
          ]}
          placeholderTextColor={muted}
        />
        {hasRight && <View style={styles.right}>{rightAdornment}</View>}
      </View>

      {error ? <Text style={{ color: '#e11' }}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  right: { position: 'absolute', right: 10, top: 10, height: 24, justifyContent: 'center', alignItems: 'center' },
});

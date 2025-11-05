import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  rightAdornment?: React.ReactNode;
};

export default function TextField({ label, error, style, rightAdornment, ...rest }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const hasRight = !!rightAdornment;

  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ color: isDark ? '#fff' : '#000' }}>{label}</Text> : null}

      <View style={{ position: 'relative' }}>
        <TextInput
          {...rest}
          style={[
            styles.input,
            { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#ccc', backgroundColor: isDark ? '#0b0b0b' : '#fff' },
            hasRight && { paddingRight: 44 },
            style,
          ]}
          placeholderTextColor={isDark ? '#888' : '#888'}
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

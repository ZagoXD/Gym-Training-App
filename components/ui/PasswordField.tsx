import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import { Pressable, Text, TextInputProps } from 'react-native';
import TextField from './TextField';

type Props = TextInputProps & { label?: string };

export default function PasswordField(props: Props) {
  const [hidden, setHidden] = useState(true);
  const isDark = useColorScheme() === 'dark';

  return (
    <TextField
      {...props}
      secureTextEntry={hidden}
      rightAdornment={
        <Pressable onPress={() => setHidden((v) => !v)}>
          <Text style={{ color: isDark ? '#fff' : '#000' }}>
            {hidden ? '👁️' : '🙈'}
          </Text>
        </Pressable>
      }
    />
  );
}

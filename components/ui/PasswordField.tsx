import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, TextInputProps } from 'react-native';
import TextField from './TextField';

type Props = TextInputProps & { label?: string };

export default function PasswordField(props: Props) {
  const [hidden, setHidden] = useState(true);
  const isDark = useColorScheme() === 'dark';

  const color = isDark ? '#fff' : '#000';

  return (
    <TextField
      {...props}
      secureTextEntry={hidden}
      rightAdornment={
        <Pressable
          onPress={() => setHidden(v => !v)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
        >
          <MaterialCommunityIcons
            name={hidden ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={color}
          />
        </Pressable>
      }
    />
  );
}

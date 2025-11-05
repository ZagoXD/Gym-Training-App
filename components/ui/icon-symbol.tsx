import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'person.crop.circle': 'account-circle',
  'person.fill': 'person',
  'fitness-center': 'fitness-center',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const materialName = MAPPING[name] ?? 'help-outline';
  return <MaterialIcons name={materialName} size={size} color={color} style={style} />;
}

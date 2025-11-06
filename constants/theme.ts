import { Platform } from 'react-native';

const brandLight = '#0a7ea4';
const brandDark  = '#ffffffff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    card: '#FFFFFF',
    border: '#DDDDDD',
    muted: '#666666',
    icon: '#687076',

    tint: brandLight,
    onTint: '#FFFFFF',
    link: brandLight,
    tabIconDefault: '#687076',
    tabIconSelected: brandLight,

    chipBg: '#F2F2F2',
    chipBorder: '#E6E6E6',
    inputBg: '#FFFFFF',
    placeholder: '#888888',
    underline: '#111111',
    tabInactive: '#9B9B9B',

    ripple: '#e6e6e6',
    disabledBg: '#D1D5DB',
    disabledText: '#9CA3AF',

    success: '#16A34A',
    warning: '#F59E0B',
    danger:  '#DC2626',
  },

  dark: {
    text: '#ECEDEE',
    background: '#0B0B0B',
    surface: '#111111',
    card: '#111111',
    border: '#2A2A2A',
    muted: '#AAAAAA',
    icon: '#9BA1A6',

    tint: brandDark,
    onTint: '#000000',
    link: brandDark,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: brandDark,

    chipBg: '#1A1A1A',
    chipBorder: '#2A2A2A',
    inputBg: '#0B0B0B',
    placeholder: '#888888',
    underline: '#FFFFFF',
    tabInactive: '#8B8B8B',

    ripple: '#222222',
    disabledBg: '#1F2937',
    disabledText: '#6B7280',

    success: '#22C55E',
    warning: '#FBBF24',
    danger:  '#F87171',
  },
};

export type AppTheme = typeof Colors.light;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

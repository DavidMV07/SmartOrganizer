/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Paleta preferida: negro y azul (rango oscuro -> claro)
const primaryBlue = '#0a84ff'; // azul vivo
const primaryBlueLight = '#4fb3ff';
const nearBlack = '#0b0b0b';

export const Colors = {
  light: {
    text: '#08111a',
    background: '#f6f8fb',
    card: '#ffffff',
    tint: primaryBlue,
    tintLight: primaryBlueLight,
    accent: primaryBlue,
    icon: '#334155',
    muted: '#6b7280',
  },
  dark: {
    text: '#e6eef9',
    background: nearBlack,
    card: '#0f1724',
    tint: primaryBlueLight,
    tintLight: primaryBlue,
    accent: primaryBlueLight,
    icon: '#9aa9c7',
    muted: '#94a3b8',
  },
};

// spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

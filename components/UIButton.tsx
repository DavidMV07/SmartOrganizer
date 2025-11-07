import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../constants/theme';

type Variant = 'primary' | 'ghost' | 'danger' | 'check' | 'warning';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function UIButton({ title, onPress, variant = 'primary', style, textStyle }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        variant === 'check' && styles.check,
        variant === 'warning' && styles.warning,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.text, variant === 'ghost' && styles.textGhost, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: Colors.light.tint,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  check: {
    backgroundColor: '#1cae0cff',
  },
  warning: {
    backgroundColor: '#e59124ff'
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
  textGhost: {
    color: Colors.light.tint,
  },
});

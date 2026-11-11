import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../constants/theme';

// Boton unico de la app.
// variant: 'primary' | 'accent' | 'outline' | 'light' | 'ghost' | 'danger' | 'dangerGhost'
export default function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  small = false,
}) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        { backgroundColor: v.bg, borderColor: v.border },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? (
            <Ionicons name={icon} size={small ? 16 : 20} color={v.fg} style={styles.icon} />
          ) : null}
          <Text style={[styles.text, small && styles.textSmall, { color: v.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const VARIANTS = {
  primary: { bg: COLORS.primary, fg: COLORS.surface, border: COLORS.primary },
  accent: { bg: COLORS.accent, fg: COLORS.text, border: COLORS.accent },
  outline: { bg: 'transparent', fg: COLORS.primary, border: COLORS.primary },
  light: { bg: COLORS.surface, fg: COLORS.primaryDark, border: COLORS.surface },
  ghost: { bg: 'transparent', fg: COLORS.primary, border: 'transparent' },
  danger: { bg: COLORS.error, fg: COLORS.surface, border: COLORS.error },
  dangerGhost: { bg: 'transparent', fg: COLORS.error, border: 'transparent' },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  small: { minHeight: 36, paddingHorizontal: SPACING.md, borderRadius: RADIUS.sm + 2 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
  icon: { marginRight: SPACING.sm },
  text: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  textSmall: { fontSize: FONT_SIZES.sm },
});

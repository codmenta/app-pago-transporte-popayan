import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../constants/theme';

// Campo de texto con etiqueta, icono, error y boton para ver la contraseña
export default function TextField({ label, icon, error, secureTextEntry, onBlur, style, ...props }) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? COLORS.error : focused ? COLORS.primary : COLORS.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, { borderColor }, focused && styles.inputFocused]}>
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? COLORS.primary : COLORS.textLight}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.disabled}
          secureTextEntry={secureTextEntry && hidden}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden(!hidden)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textLight} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: SPACING.md },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs + 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 52,
  },
  inputFocused: { backgroundColor: '#FBFEFD' },
  icon: { marginRight: SPACING.sm },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    paddingVertical: SPACING.sm + 4,
    outlineStyle: 'none',
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs + 2, gap: 4 },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.sm, flexShrink: 1 },
});

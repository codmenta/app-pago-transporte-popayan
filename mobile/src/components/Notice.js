import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../constants/theme';

// Mensaje en pantalla (exito / error / info). Reemplaza a Alert.alert,
// que no muestra nada cuando la app corre en el navegador.
const TYPES = {
  success: { bg: COLORS.successLight, fg: '#166534', icon: 'checkmark-circle' },
  error: { bg: COLORS.errorLight, fg: '#991B1B', icon: 'alert-circle' },
  info: { bg: COLORS.primaryLight, fg: COLORS.primaryDark, icon: 'information-circle' },
};

export default function Notice({ type = 'info', message, style }) {
  if (!message) return null;
  const t = TYPES[type];
  return (
    <View style={[styles.box, { backgroundColor: t.bg }, style]} accessibilityLiveRegion="polite">
      <Ionicons name={t.icon} size={20} color={t.fg} />
      <Text style={[styles.text, { color: t.fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md - 4,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  text: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600' },
});

import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SHADOW, SPACING } from '../constants/theme';
import Logo from './Logo';

// Estructura comun de Login y Registro: cabecera de marca + tarjeta con el formulario
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Logo size={56} light tagline="Tu pasaje en Popayán, sin efectivo" />
        </View>

        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {children}
          </View>
        </View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: SPACING.xl },
  hero: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.xl * 2 + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xl + 8,
    borderBottomRightRadius: RADIUS.xl + 8,
  },
  cardWrap: {
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.xl - SPACING.md,
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 440,
    ...SHADOW,
  },
  title: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: SPACING.xs },
  footer: { alignItems: 'center', marginTop: SPACING.lg, paddingHorizontal: SPACING.md },
});

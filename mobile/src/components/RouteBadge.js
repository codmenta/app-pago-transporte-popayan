import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, ROUTE_COLORS } from '../constants/theme';

// Quita tildes, espacios y mayusculas: "Rápido Tambo" -> "rapidotambo"
function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

// Busca la empresa dentro del nombre de la ruta (ej. "Transpubenza - Ruta 5")
export function getRouteColors(ruta) {
  const n = normalizar(ruta);
  const empresa = Object.keys(ROUTE_COLORS).find((k) => n.includes(k));
  return empresa
    ? ROUTE_COLORS[empresa]
    : { bg: COLORS.primaryLight, fg: COLORS.primaryDark, dot: COLORS.accent };
}

// Etiqueta con los colores de la empresa de transporte, para reconocer la ruta de un vistazo
export default function RouteBadge({ ruta, style }) {
  if (!ruta) return null;
  const c = getRouteColors(ruta);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.fg }]} numberOfLines={1}>
        {ruta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    maxWidth: '100%',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: FONT_SIZES.xs, fontWeight: '700', flexShrink: 1 },
});

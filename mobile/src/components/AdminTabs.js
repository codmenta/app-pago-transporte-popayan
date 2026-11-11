import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SHADOW, SPACING } from '../constants/theme';

const TABS = [
  { route: 'BusRegister', label: 'Buses', icon: 'bus' },
  { route: 'ConductorRegister', label: 'Conductores', icon: 'people' },
  { route: 'AsignarTurno', label: 'Turnos', icon: 'calendar' },
];

// Pestañas del panel de administrador (reemplaza los enlaces al final de cada pantalla)
export default function AdminTabs() {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {TABS.map((t) => {
        const active = route.name === t.route;
        return (
          <Pressable
            key={t.route}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => !active && navigation.replace(t.route)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Ionicons
              name={active ? t.icon : `${t.icon}-outline`}
              size={18}
              color={active ? COLORS.surface : COLORS.textLight}
            />
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.md,
    ...SHADOW,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
  },
  tabActive: { backgroundColor: COLORS.primary },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight },
  labelActive: { color: COLORS.surface },
});

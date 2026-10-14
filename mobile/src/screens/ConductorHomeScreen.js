import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as storage from '../services/storage';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

export default function ConductorHomeScreen() {
  const { user } = useAuth();
  const [turno, setTurno] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarTurno() {
      try {
        const data = await storage.getTurnoActivo(user.email);
        setTurno(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    cargarTurno();
  }, [user.email]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Turno activo · Conductor</Text>
        <Text style={styles.driverName}>{user.fullName}</Text>

        {turno ? (
          <View style={styles.busBadge}>
            <Text style={styles.busIcon}>🚍</Text>
            <View>
              <Text style={styles.busName}>Bus #{turno.numero_interno}</Text>
              <Text style={styles.busRoute}>
                {turno.ruta} · {turno.placa_bus}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.busBadge}>
            <Text style={styles.busRoute}>{error || 'Sin turno asignado'}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>Recaudación en vivo</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#22C55E' }]}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statNum}>0</Text>
          <Text style={styles.statLabel}>Pasajeros hoy</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statNum}>$ 0</Text>
          <Text style={styles.statLabel}>Total recaudado</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>🔔 Panel de notificaciones</Text>
        <Text style={styles.emptyText}>Aún no hay pagos registrados en este turno.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: '#0f766e',
    padding: SPACING.lg,
  },
  headerLabel: { color: '#fff', opacity: 0.9, fontSize: FONT_SIZES.sm },
  driverName: {
    color: '#fff',
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  busBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  busIcon: { fontSize: 28 },
  busName: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
  busRoute: { color: '#fff', fontSize: FONT_SIZES.sm },
  sectionLabel: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    padding: SPACING.md,
  },
  statIcon: { fontSize: 22, marginBottom: SPACING.xs },
  statNum: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  panelTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
});
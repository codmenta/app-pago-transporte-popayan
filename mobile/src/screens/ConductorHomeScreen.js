import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import RouteBadge from '../components/RouteBadge';
import { COLORS, FONT_SIZES, RADIUS, SHADOW, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import * as storage from '../services/storage';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

// Cada cuanto se consultan los pagos nuevos (en milisegundos)
const INTERVALO_PAGOS = 5000;

export default function ConductorHomeScreen() {
  const { user } = useAuth();
  const [turno, setTurno] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [recaudo, setRecaudo] = useState({ total_pasajeros: 0, total_recaudado: 0, pagos: [] });
  const [aviso, setAviso] = useState(null);
  const ultimoPagoId = useRef(null);

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

  // Consulta periodica de pagos: asi el conductor ve cada pago apenas el pasajero paga
  useEffect(() => {
    let activo = true;
    let timeoutAviso;

    async function cargarPagos() {
      try {
        const data = await storage.getPagosConductor(user.email);
        if (!activo) return;

        const masReciente = data.pagos[0];
        // Solo avisamos de pagos que llegan despues de la primera carga
        if (masReciente && ultimoPagoId.current !== null && masReciente.id !== ultimoPagoId.current) {
          setAviso(masReciente);
          clearTimeout(timeoutAviso);
          timeoutAviso = setTimeout(() => setAviso(null), 4000);
        }
        ultimoPagoId.current = masReciente ? masReciente.id : '';
        setRecaudo(data);
      } catch (e) {
        // Si falla una consulta, se reintenta en el siguiente intervalo
      }
    }

    cargarPagos();
    const intervalo = setInterval(cargarPagos, INTERVALO_PAGOS);
    return () => {
      activo = false;
      clearInterval(intervalo);
      clearTimeout(timeoutAviso);
    };
  }, [user.email]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {aviso && (
        <View style={styles.aviso} accessibilityLiveRegion="polite">
          <Ionicons name="cash" size={20} color={COLORS.surface} />
          <Text style={styles.avisoText}>
            Nuevo pago de {aviso.nombre_pasajero}: {formatCurrency(aviso.monto)}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Conductor</Text>
          <Text style={styles.driverName}>{user.fullName}</Text>

          {turno ? (
            <View style={styles.busBadge}>
              <View style={styles.busIcon}>
                <Ionicons name="bus" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.busName}>Bus #{turno.numero_interno}</Text>
                <Text style={styles.busRoute}>Placa {turno.placa_bus}</Text>
                <RouteBadge ruta={turno.ruta} style={styles.routeBadge} />
              </View>
              <View style={styles.activePill}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Turno activo</Text>
              </View>
            </View>
          ) : (
            <View style={styles.busBadge}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.surface} />
              <Text style={[styles.busRoute, styles.flex]}>{error || 'Sin turno asignado'}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="people" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.statNum}>{recaudo.total_pasajeros}</Text>
            <Text style={styles.statLabel}>Pasajeros hoy</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.accentLight }]}>
              <Ionicons name="wallet" size={22} color="#B45309" />
            </View>
            <Text style={styles.statNum} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(recaudo.total_recaudado)}
            </Text>
            <Text style={styles.statLabel}>Total recaudado</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Pagos recibidos</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>En vivo</Text>
            </View>
          </View>

          {recaudo.pagos.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-outline" size={32} color={COLORS.disabled} />
              <Text style={styles.emptyText}>Aún no hay pagos en este turno.</Text>
              <Text style={styles.emptyHint}>Aparecerán aquí apenas un pasajero pague.</Text>
            </View>
          ) : (
            recaudo.pagos.map((p) => (
              <View key={p.id} style={styles.pagoRow}>
                <View style={styles.pagoAvatar}>
                  <Text style={styles.pagoInitial}>
                    {(p.nombre_pasajero || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.pagoNombre}>{p.nombre_pasajero}</Text>
                  <Text style={styles.pagoFecha}>{formatDate(p.fecha)}</Text>
                </View>
                <Text style={styles.pagoMonto}>+ {formatCurrency(p.monto)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: SPACING.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + SPACING.md,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerLabel: { color: COLORS.onPrimaryMuted, fontSize: FONT_SIZES.sm },
  driverName: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  busBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md,
    padding: SPACING.md - 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md - 4,
  },
  busIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busName: { color: COLORS.surface, fontSize: FONT_SIZES.md, fontWeight: '700' },
  busRoute: { color: COLORS.onPrimaryMuted, fontSize: FONT_SIZES.sm },
  routeBadge: { marginTop: 4 },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  activeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primaryDark },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md - 4,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.xl + SPACING.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statNum: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    margin: SPACING.md,
    padding: SPACING.md,
    ...SHADOW,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  panelTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.errorLight,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  liveText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#991B1B' },
  empty: { alignItems: 'center', paddingVertical: SPACING.lg, gap: 4 },
  emptyText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  emptyHint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success,
    padding: SPACING.md - 4,
  },
  avisoText: { color: COLORS.surface, fontWeight: '700', fontSize: FONT_SIZES.sm },
  pagoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md - 4,
    paddingVertical: SPACING.sm + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  pagoAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagoInitial: { color: COLORS.primary, fontWeight: '800' },
  pagoNombre: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  pagoFecha: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  pagoMonto: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.success },
});

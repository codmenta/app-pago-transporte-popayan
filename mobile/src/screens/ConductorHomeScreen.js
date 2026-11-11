import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as storage from '../services/storage';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

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
    <ScrollView style={styles.container}>
      {aviso && (
        <View style={styles.aviso}>
          <Text style={styles.avisoText}>
            💸 Nuevo pago de {aviso.nombre_pasajero}: {formatCurrency(aviso.monto)}
          </Text>
        </View>
      )}
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
          <Text style={styles.statNum}>{recaudo.total_pasajeros}</Text>
          <Text style={styles.statLabel}>Pasajeros hoy</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statNum}>{formatCurrency(recaudo.total_recaudado)}</Text>
          <Text style={styles.statLabel}>Total recaudado</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>🔔 Panel de notificaciones</Text>
        {recaudo.pagos.length === 0 ? (
          <Text style={styles.emptyText}>Aún no hay pagos registrados en este turno.</Text>
        ) : (
          recaudo.pagos.map((p) => (
            <View key={p.id} style={styles.pagoRow}>
              <View style={styles.pagoInfo}>
                <Text style={styles.pagoNombre}>{p.nombre_pasajero}</Text>
                <Text style={styles.pagoFecha}>{formatDate(p.fecha)}</Text>
              </View>
              <Text style={styles.pagoMonto}>+ {formatCurrency(p.monto)}</Text>
            </View>
          ))
        )}
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
  aviso: {
    backgroundColor: COLORS.success,
    padding: SPACING.md,
  },
  avisoText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm, textAlign: 'center' },
  pagoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  pagoInfo: { flex: 1 },
  pagoNombre: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  pagoFecha: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  pagoMonto: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.success },
});
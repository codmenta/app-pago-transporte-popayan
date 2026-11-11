import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AdminTabs from '../components/AdminTabs';
import Button from '../components/Button';
import Notice from '../components/Notice';
import { COLORS, FONT_SIZES, RADIUS, SHADOW, SPACING } from '../constants/theme';
import * as storage from '../services/storage';

const TURNOS = [
  { id: 'manana', label: 'Mañana', horario: '06:00 - 14:00', icon: 'sunny-outline', horaInicio: 6, horaFin: 14 },
  { id: 'tarde', label: 'Tarde', horario: '14:00 - 22:00', icon: 'moon-outline', horaInicio: 14, horaFin: 22 },
];

// Arma una fecha de hoy con la hora dada, sin zona horaria (YYYY-MM-DDTHH:00:00)
function fechaHoy(hora) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hora)}:00:00`;
}

export default function AsignarTurnoScreen() {
  const [conductores, setConductores] = useState([]);
  const [buses, setBuses] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [conductorSel, setConductorSel] = useState(null);
  const [busSel, setBusSel] = useState(null);
  const [turnoSel, setTurnoSel] = useState(null);
  const [confirmarId, setConfirmarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  async function cargarTurnos() {
    const lista = await storage.getTurnos();
    setTurnos(lista);
  }

  useEffect(() => {
    async function cargar() {
      try {
        const [listaConductores, listaBuses] = await Promise.all([
          storage.getConductores(),
          storage.getBuses(),
        ]);
        setConductores(listaConductores);
        setBuses(listaBuses);
        await cargarTurnos();
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  async function handleConfirmar() {
    setError('');
    setExito('');

    if (!conductorSel || !busSel || !turnoSel) {
      setError('Elige un conductor, un bus y un turno');
      return;
    }

    const turno = TURNOS.find((t) => t.id === turnoSel);

    setSaving(true);
    try {
      await storage.createTurno(
        conductorSel.correo,
        busSel.placa,
        fechaHoy(turno.horaInicio),
        fechaHoy(turno.horaFin)
      );
      setExito(`Turno asignado a ${conductorSel.nombre} en el bus #${busSel.numero_interno}`);
      setConductorSel(null);
      setBusSel(null);
      setTurnoSel(null);
      await cargarTurnos();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalizar(id) {
    setError('');
    setExito('');
    try {
      await storage.finalizarTurno(id);
      setExito('Turno finalizado');
      await cargarTurnos();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleEliminar(id) {
    setError('');
    setExito('');
    try {
      await storage.deleteTurno(id);
      setConfirmarId(null);
      setExito('Turno eliminado');
      await cargarTurnos();
    } catch (e) {
      setConfirmarId(null);
      setError(e.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const listo = conductorSel && busSel && turnoSel;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <AdminTabs />

      <View style={styles.card}>
        <StepTitle n={1} title="Conductor" done={!!conductorSel} />
        {conductores.length === 0 && (
          <Text style={styles.emptyText}>Aún no hay conductores registrados.</Text>
        )}
        {conductores.map((c) => (
          <Option
            key={c.correo}
            icon="person-outline"
            title={c.nombre}
            subtitle={c.correo}
            selected={conductorSel?.correo === c.correo}
            onPress={() => setConductorSel(c)}
          />
        ))}
      </View>

      <View style={styles.card}>
        <StepTitle n={2} title="Bus" done={!!busSel} />
        {buses.length === 0 && <Text style={styles.emptyText}>Aún no hay buses registrados.</Text>}
        {buses.map((b) => (
          <Option
            key={b.placa}
            icon="bus-outline"
            title={`Bus #${b.numero_interno}`}
            subtitle={`${b.ruta} · ${b.placa}`}
            selected={busSel?.placa === b.placa}
            onPress={() => setBusSel(b)}
          />
        ))}
      </View>

      <View style={styles.card}>
        <StepTitle n={3} title="Turno de hoy" done={!!turnoSel} />
        <View style={styles.turnoGrid}>
          {TURNOS.map((t) => {
            const sel = turnoSel === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTurnoSel(t.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: sel }}
                style={[styles.turnoOption, sel && styles.optionSelected]}
              >
                <Ionicons name={t.icon} size={24} color={sel ? COLORS.primary : COLORS.textLight} />
                <Text style={styles.optionTitle}>{t.label}</Text>
                <Text style={styles.optionSub}>{t.horario}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Notice type="error" message={error} style={styles.noticeGap} />
      <Notice type="success" message={exito} style={styles.noticeGap} />

      <Button
        title="Confirmar asignación"
        icon="checkmark-circle-outline"
        onPress={handleConfirmar}
        loading={saving}
        disabled={!listo}
        style={styles.confirm}
      />

      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Turnos asignados</Text>
        </View>
        {turnos.length === 0 && <Text style={styles.emptyText}>Aún no hay turnos asignados.</Text>}
        {turnos.map((t) => {
          const finalizado = t.estado === 'finalizado';
          return (
            <View key={t.id} style={styles.turnoRow}>
              <View style={styles.turnoHeader}>
                <Text style={[styles.optionTitle, styles.flex]}>{t.nombre_conductor}</Text>
                <View style={[styles.badge, finalizado && styles.badgeDone]}>
                  <Text style={[styles.badgeText, finalizado && styles.badgeTextDone]}>{t.estado}</Text>
                </View>
              </View>
              <Text style={styles.optionSub}>
                Bus #{t.numero_interno} · {t.ruta} · {t.placa_bus}
              </Text>
              <Text style={styles.optionSub}>
                {t.fecha} · {t.hora_inicio} - {t.hora_fin}
              </Text>

              <View style={styles.actionRow}>
                {confirmarId === t.id ? (
                  <>
                    <Text style={styles.confirmText}>¿Eliminar este turno?</Text>
                    <Button small variant="ghost" title="Cancelar" onPress={() => setConfirmarId(null)} />
                    <Button small variant="danger" title="Eliminar" onPress={() => handleEliminar(t.id)} />
                  </>
                ) : (
                  <>
                    {t.estado === 'activo' && (
                      <Button
                        small
                        variant="outline"
                        icon="flag-outline"
                        title="Finalizar"
                        onPress={() => handleFinalizar(t.id)}
                      />
                    )}
                    <Button
                      small
                      variant="dangerGhost"
                      icon="trash-outline"
                      title="Eliminar"
                      onPress={() => setConfirmarId(t.id)}
                    />
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function StepTitle({ n, title, done }) {
  return (
    <View style={styles.titleRow}>
      <View style={[styles.step, done && styles.stepDone]}>
        {done ? (
          <Ionicons name="checkmark" size={14} color={COLORS.surface} />
        ) : (
          <Text style={styles.stepText}>{n}</Text>
        )}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

function Option({ icon, title, subtitle, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <Ionicons name={icon} size={20} color={selected ? COLORS.primary : COLORS.textLight} />
      <View style={styles.flex}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSub}>{subtitle}</Text>
      </View>
      <Ionicons
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
        color={selected ? COLORS.primary : COLORS.border}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  flex: { flex: 1 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm + 2 },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  step: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: COLORS.success },
  stepText: { color: COLORS.primary, fontWeight: '800', fontSize: FONT_SIZES.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md - 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md - 4,
    marginBottom: SPACING.sm,
  },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  optionTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  optionSub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 2 },
  turnoGrid: { flexDirection: 'row', gap: SPACING.sm },
  turnoOption: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  noticeGap: { marginTop: 0, marginBottom: SPACING.md },
  confirm: { marginBottom: SPACING.lg },
  turnoRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.md - 4,
  },
  turnoHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  confirmText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.error, fontWeight: '600' },
  badge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  badgeDone: { backgroundColor: COLORS.successLight },
  badgeText: { color: '#92400E', fontSize: FONT_SIZES.xs, fontWeight: '700', textTransform: 'capitalize' },
  badgeTextDone: { color: '#166534' },
});

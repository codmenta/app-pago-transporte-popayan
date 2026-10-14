import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as storage from '../services/storage';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

const TURNOS = [
  { id: 'manana', label: 'Mañana · 06:00 - 14:00', horaInicio: 6, horaFin: 14 },
  { id: 'tarde', label: 'Tarde · 14:00 - 22:00', horaInicio: 14, horaFin: 22 },
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Asignación de Turnos</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. Conductor</Text>
        {conductores.length === 0 && (
          <Text style={styles.emptyText}>Aún no hay conductores registrados.</Text>
        )}
        {conductores.map((c) => (
          <TouchableOpacity
            key={c.correo}
            style={[styles.option, conductorSel?.correo === c.correo && styles.optionSelected]}
            onPress={() => setConductorSel(c)}
          >
            <Text style={styles.optionTitle}>{c.nombre}</Text>
            <Text style={styles.optionSub}>{c.correo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. Bus</Text>
        {buses.length === 0 && (
          <Text style={styles.emptyText}>Aún no hay buses registrados.</Text>
        )}
        {buses.map((b) => (
          <TouchableOpacity
            key={b.placa}
            style={[styles.option, busSel?.placa === b.placa && styles.optionSelected]}
            onPress={() => setBusSel(b)}
          >
            <Text style={styles.optionTitle}>Bus #{b.numero_interno}</Text>
            <Text style={styles.optionSub}>
              {b.ruta} · {b.placa}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>3. Turno de hoy</Text>
        {TURNOS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.option, turnoSel === t.id && styles.optionSelected]}
            onPress={() => setTurnoSel(t.id)}
          >
            <Text style={styles.optionTitle}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {exito ? <Text style={styles.successText}>{exito}</Text> : null}

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleConfirmar}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={COLORS.surface} />
        ) : (
          <Text style={styles.buttonText}>✓ Confirmar asignación</Text>
        )}
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Turnos asignados</Text>
        {turnos.length === 0 && (
          <Text style={styles.emptyText}>Aún no hay turnos asignados.</Text>
        )}
        {turnos.map((t) => (
          <View key={t.id} style={styles.turnoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{t.nombre_conductor}</Text>
              <Text style={styles.optionSub}>
                Bus #{t.numero_interno} · {t.ruta} · {t.placa_bus}
              </Text>
              <Text style={styles.optionSub}>
                {t.fecha} · {t.hora_inicio} - {t.hora_fin}
              </Text>
            </View>

            <View style={styles.actions}>
              <Text style={[styles.badge, t.estado === 'finalizado' && styles.badgeDone]}>
                {t.estado}
              </Text>

              {confirmarId === t.id ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => handleEliminar(t.id)}>
                    <Text style={styles.linkDanger}>Confirmar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setConfirmarId(null)}>
                    <Text style={styles.link}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  {t.estado === 'activo' && (
                    <TouchableOpacity onPress={() => handleFinalizar(t.id)}>
                      <Text style={styles.link}>Finalizar</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setConfirmarId(t.id)}>
                    <Text style={styles.linkDanger}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  option: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#eff6ff',
  },
  optionTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  optionSub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 2 },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  errorText: { color: COLORS.error, fontSize: FONT_SIZES.sm, marginBottom: SPACING.sm },
  successText: { color: '#166534', fontSize: FONT_SIZES.sm, marginBottom: SPACING.sm },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  buttonDisabled: { backgroundColor: COLORS.disabled },
  buttonText: { color: COLORS.surface, fontSize: FONT_SIZES.md, fontWeight: '600' },
  turnoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.sm,
  },
  actions: { alignItems: 'flex-end', gap: 6 },
  actionRow: { flexDirection: 'row', gap: 12 },
  badge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  badgeDone: { backgroundColor: '#dcfce7', color: '#166534' },
  link: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  linkDanger: { color: COLORS.error, fontSize: FONT_SIZES.sm, fontWeight: '600' },
});
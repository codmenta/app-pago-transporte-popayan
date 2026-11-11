import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import AdminTabs from '../components/AdminTabs';
import Button from '../components/Button';
import Notice from '../components/Notice';
import TextField from '../components/TextField';
import { COLORS, FONT_SIZES, RADIUS, SHADOW, SPACING } from '../constants/theme';
import * as storage from '../services/storage';

export default function BusRegisterScreen() {
  const [placa, setPlaca] = useState('');
  const [numeroInterno, setNumeroInterno] = useState('');
  const [ruta, setRuta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busCreado, setBusCreado] = useState(null);
  const [buses, setBuses] = useState([]);
  const [qrAbierto, setQrAbierto] = useState(null); // placa del bus cuyo QR se esta viendo
  const [qrImagen, setQrImagen] = useState(null);
  const [qrCargando, setQrCargando] = useState(false);

  async function cargarBuses() {
    try {
      setBuses(await storage.getBuses());
    } catch (e) {
      // Si falla, la lista simplemente queda vacia
    }
  }

  useFocusEffect(
    useCallback(() => {
      cargarBuses();
    }, [])
  );

  async function toggleQr(placaBus) {
    if (qrAbierto === placaBus) {
      setQrAbierto(null);
      return;
    }
    setQrAbierto(placaBus);
    setQrImagen(null);
    setQrCargando(true);
    try {
      const data = await storage.getBusQr(placaBus);
      setQrImagen(data.qrImage);
    } catch (e) {
      setQrImagen(null);
    } finally {
      setQrCargando(false);
    }
  }

  async function handleCrearBus() {
    setError('');

    if (!placa || !numeroInterno || !ruta) {
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const data = await storage.registerBus(placa, numeroInterno, ruta);
      setBusCreado(data);
      setPlaca('');
      setNumeroInterno('');
      setRuta('');
      cargarBuses();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <AdminTabs />

      <View style={styles.card}>
        <CardTitle icon="add-circle" title="Nuevo bus" />

        <TextField
          label="Placa del vehículo"
          icon="car-outline"
          placeholder="ABC-123"
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters"
        />
        <TextField
          label="Número interno del bus"
          icon="keypad-outline"
          placeholder="102"
          value={numeroInterno}
          onChangeText={setNumeroInterno}
          keyboardType="numeric"
        />
        <TextField
          label="Ruta / Empresa"
          icon="map-outline"
          placeholder="Transpubenza"
          value={ruta}
          onChangeText={setRuta}
        />

        <Notice type="error" message={error} />

        <Button
          title="Registrar bus y generar QR"
          icon="qr-code-outline"
          onPress={handleCrearBus}
          loading={loading}
          style={styles.mt}
        />
      </View>

      {busCreado && (
        <View style={[styles.card, styles.qrCreatedCard]}>
          <CardTitle icon="checkmark-circle" title="Bus registrado · QR listo" color={COLORS.success} />
          <View style={styles.qrPreview}>
            <View style={styles.qrFrame}>
              <Image source={{ uri: busCreado.qrImage }} style={styles.qrImage} />
            </View>
            <Text style={styles.qrCode}>{busCreado.codigo_qr}</Text>
            <Text style={styles.qrHint}>Imprime este código y pégalo dentro del bus</Text>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <CardTitle icon="bus" title={`Buses registrados (${buses.length})`} />
        {buses.length === 0 ? (
          <Text style={styles.emptyText}>Aún no hay buses registrados.</Text>
        ) : (
          buses.map((b) => (
            <View key={b.placa} style={styles.busRow}>
              <View style={styles.busRowHeader}>
                <View style={styles.busAvatar}>
                  <Text style={styles.busNumber}>{b.numero_interno}</Text>
                </View>
                <View style={styles.busInfo}>
                  <Text style={styles.busName}>{b.placa}</Text>
                  <Text style={styles.busRoute}>{b.ruta}</Text>
                </View>
                <Button
                  small
                  variant={qrAbierto === b.placa ? 'primary' : 'outline'}
                  icon={qrAbierto === b.placa ? 'eye-off-outline' : 'qr-code-outline'}
                  title={qrAbierto === b.placa ? 'Ocultar' : 'Ver QR'}
                  onPress={() => toggleQr(b.placa)}
                />
              </View>

              {qrAbierto === b.placa && (
                <View style={styles.qrPreview}>
                  {qrCargando ? (
                    <ActivityIndicator color={COLORS.primary} />
                  ) : qrImagen ? (
                    <>
                      <View style={styles.qrFrame}>
                        <Image source={{ uri: qrImagen }} style={styles.qrImage} />
                      </View>
                      <Text style={styles.qrCode}>{b.codigo_qr}</Text>
                    </>
                  ) : (
                    <Notice type="error" message="No se pudo cargar el QR" />
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function CardTitle({ icon, title, color = COLORS.primary }) {
  return (
    <View style={styles.cardTitleRow}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },
  mt: { marginTop: SPACING.lg },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW,
  },
  qrCreatedCard: { borderWidth: 1.5, borderColor: COLORS.success },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  qrPreview: { alignItems: 'center', paddingVertical: SPACING.md },
  qrFrame: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  qrImage: { width: 180, height: 180 },
  qrCode: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontFamily: 'monospace' },
  qrHint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.xs },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: SPACING.sm },
  busRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.sm + 2,
    marginTop: SPACING.sm,
  },
  busRowHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md - 4 },
  busAvatar: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busNumber: { color: COLORS.primary, fontWeight: '800' },
  busInfo: { flex: 1 },
  busName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  busRoute: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
});

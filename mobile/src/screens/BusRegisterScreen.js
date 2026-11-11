import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as storage from '../services/storage';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

export default function BusRegisterScreen({ navigation }) {
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registro de Buses</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nuevo bus</Text>

        <Text style={styles.label}>Placa del vehiculo</Text>
        <TextInput
          style={styles.input}
          placeholder="ABC-123"
          placeholderTextColor={COLORS.textLight}
          value={placa}
          onChangeText={setPlaca}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Numero interno de bus</Text>
        <TextInput
          style={styles.input}
          placeholder="102"
          placeholderTextColor={COLORS.textLight}
          value={numeroInterno}
          onChangeText={setNumeroInterno}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Ruta / Empresa</Text>
        <TextInput
          style={styles.input}
          placeholder="Transpubenza"
          placeholderTextColor={COLORS.textLight}
          value={ruta}
          onChangeText={setRuta}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleCrearBus} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.buttonText}>🖨️ Generar e Imprimir QR</Text>
          )}
        </TouchableOpacity>
      </View>

      {busCreado && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>QR generado</Text>
          <View style={styles.qrPreview}>
            <Image source={{ uri: busCreado.qrImage }} style={styles.qrImage} />
            <Text style={styles.qrCode}>{busCreado.codigo_qr}</Text>
          </View>
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Buses registrados</Text>
        {buses.length === 0 ? (
          <Text style={styles.emptyText}>Aun no hay buses registrados.</Text>
        ) : (
          buses.map((b) => (
            <View key={b.placa} style={styles.busRow}>
              <View style={styles.busRowHeader}>
                <View style={styles.busInfo}>
                  <Text style={styles.busName}>Bus #{b.numero_interno} · {b.placa}</Text>
                  <Text style={styles.busRoute}>{b.ruta}</Text>
                </View>
                <TouchableOpacity style={styles.qrButton} onPress={() => toggleQr(b.placa)}>
                  <Text style={styles.qrButtonText}>
                    {qrAbierto === b.placa ? 'Ocultar' : 'Ver QR'}
                  </Text>
                </TouchableOpacity>
              </View>

              {qrAbierto === b.placa && (
                <View style={styles.qrPreview}>
                  {qrCargando ? (
                    <ActivityIndicator color={COLORS.primary} />
                  ) : qrImagen ? (
                    <>
                      <Image source={{ uri: qrImagen }} style={styles.qrImage} />
                      <Text style={styles.qrCode}>{b.codigo_qr}</Text>
                    </>
                  ) : (
                    <Text style={styles.errorText}>No se pudo cargar el QR</Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={{ marginTop: 16, padding: 12, alignItems: 'center' }}
        onPress={() => navigation.navigate('ConductorRegister')}
      >
        <Text style={{ color: COLORS.primary, fontWeight: '600' }}>👤 Ir a Registro de Conductores</Text>
      </TouchableOpacity>
          
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
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
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  qrPreview: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  qrImage: {
    width: 180,
    height: 180,
    marginBottom: SPACING.sm,
  },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  busRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingVertical: SPACING.sm,
  },
  busRowHeader: { flexDirection: 'row', alignItems: 'center' },
  busInfo: { flex: 1 },
  busName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  busRoute: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  qrButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  qrButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZES.sm },
  qrCode: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontFamily: 'monospace',
  },
});
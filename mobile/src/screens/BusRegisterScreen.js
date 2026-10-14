import React, { useState } from 'react';
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
import * as storage from '../services/storage';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

export default function BusRegisterScreen({ navigation }) {
  const [placa, setPlaca] = useState('');
  const [numeroInterno, setNumeroInterno] = useState('');
  const [ruta, setRuta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busCreado, setBusCreado] = useState(null);

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
  qrCode: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontFamily: 'monospace',
  },
});
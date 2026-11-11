import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../context/AuthContext';
import * as storage from '../services/storage';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

export default function PayScreen({ navigation }) {
  const { user } = useAuth();
  const [tarifa, setTarifa] = useState(null);
  const [bus, setBus] = useState('');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [recibo, setRecibo] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  // Evita que el mismo QR se procese varias veces mientras la camara sigue leyendo
  const scanLock = useRef(false);

  useEffect(() => {
    storage.getTarifa().then(setTarifa).catch(() => setTarifa(null));
  }, []);

  async function pagar(codigo) {
    setError('');
    if (!codigo.trim()) {
      setError('Ingresa el numero del bus o el codigo del QR');
      return;
    }

    setPaying(true);
    try {
      const data = await storage.pagarPasaje(user.email, codigo.trim());
      setRecibo({ ...data.pago, balance: data.balance });
      setBus('');
    } catch (e) {
      setError(e.message);
    } finally {
      setPaying(false);
    }
  }

  async function abrirEscaner() {
    setError('');
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setError('Necesitamos permiso de la camara para escanear el QR del bus');
        return;
      }
    }
    scanLock.current = false;
    setScanning(true);
  }

  function handleScanned({ data }) {
    if (scanLock.current) return;
    scanLock.current = true;
    setScanning(false);

    if (!data || !data.toUpperCase().startsWith('POPAPAY-BUS-')) {
      setError('Ese QR no corresponde a un bus de PopaPay');
      return;
    }
    pagar(data);
  }

  // Vista de la camara para escanear el QR del bus
  if (scanning) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleScanned}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraHint}>Apunta al codigo QR del bus</Text>
          <View style={styles.cameraFrame} />
          <TouchableOpacity style={styles.cancelButton} onPress={() => setScanning(false)}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Comprobante del pago exitoso
  if (recibo) {
    return (
      <View style={styles.container}>
        <View style={styles.receipt}>
          <Text style={styles.receiptIcon}>✅</Text>
          <Text style={styles.receiptTitle}>Pago exitoso</Text>
          <Text style={styles.receiptAmount}>{formatCurrency(recibo.monto)}</Text>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Bus</Text>
            <Text style={styles.receiptValue}>#{recibo.numero_interno} · {recibo.placa_bus}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Ruta</Text>
            <Text style={styles.receiptValue}>{recibo.ruta}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Conductor</Text>
            <Text style={styles.receiptValue}>{recibo.nombre_conductor}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Fecha</Text>
            <Text style={styles.receiptValue}>{formatDate(recibo.fecha)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Saldo restante</Text>
            <Text style={styles.receiptValue}>{formatCurrency(recibo.balance)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Volver a mi billetera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Pagar pasaje</Text>
      <Text style={styles.subtitle}>
        Escanea el codigo QR del bus o ingresa su numero. El pago le llega al conductor de
        inmediato.
      </Text>

      <View style={styles.fareCard}>
        <Text style={styles.fareLabel}>Valor del pasaje</Text>
        <Text style={styles.fareValue}>{tarifa !== null ? formatCurrency(tarifa) : '...'}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.scanButton, paying && styles.buttonDisabled]}
        onPress={abrirEscaner}
        disabled={paying}
      >
        {paying ? (
          <ActivityIndicator color={COLORS.surface} />
        ) : (
          <Text style={styles.buttonText}>📷 Escanear QR del bus</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>O ingresa el numero del bus</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 12 o POPAPAY-BUS-12-ABC123"
        placeholderTextColor={COLORS.textLight}
        autoCapitalize="characters"
        value={bus}
        onChangeText={setBus}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, paying && styles.buttonDisabled]}
        onPress={() => pagar(bus)}
        disabled={paying}
      >
        {paying ? (
          <ActivityIndicator color={COLORS.surface} />
        ) : (
          <Text style={styles.buttonText}>Pagar con numero</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  fareCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  fareLabel: { color: '#DCEFE4', fontSize: FONT_SIZES.sm },
  fareValue: { color: COLORS.surface, fontSize: FONT_SIZES.xl, fontWeight: '700' },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#DDDDDD',
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
  buttonDisabled: { backgroundColor: COLORS.textLight },
  buttonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  scanButton: { marginTop: 0 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xl,
  },
  cameraHint: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  cameraFrame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: RADIUS.lg,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  receipt: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  receiptIcon: { fontSize: 40, marginBottom: SPACING.sm },
  receiptTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.success },
  receiptAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: SPACING.md,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  receiptLabel: { color: COLORS.textLight, fontSize: FONT_SIZES.sm },
  receiptValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: SPACING.md,
  },
});

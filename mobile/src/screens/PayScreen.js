import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '../components/Button';
import Notice from '../components/Notice';
import TextField from '../components/TextField';
import { COLORS, FONT_SIZES, RADIUS, SHADOW, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import * as storage from '../services/storage';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

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
      setError('Ingresa el número del bus o el código del QR');
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
        setError('Necesitamos permiso de la cámara para escanear el QR del bus');
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
          <View style={styles.cameraHint}>
            <Ionicons name="scan-outline" size={18} color={COLORS.surface} />
            <Text style={styles.cameraHintText}>Apunta al código QR del bus</Text>
          </View>
          <View style={styles.cameraFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Button
            title="Cancelar"
            icon="close"
            variant="light"
            onPress={() => setScanning(false)}
            style={styles.fullWidth}
          />
        </View>
      </View>
    );
  }

  // Comprobante del pago exitoso
  if (recibo) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <View style={styles.receipt}>
          <View style={styles.receiptIcon}>
            <Ionicons name="checkmark" size={40} color={COLORS.surface} />
          </View>
          <Text style={styles.receiptTitle}>¡Pago exitoso!</Text>
          <Text style={styles.receiptAmount}>{formatCurrency(recibo.monto)}</Text>
          <Text style={styles.receiptHint}>Muéstrale esta pantalla al conductor si te la pide</Text>

          <View style={styles.divider} />

          <ReceiptRow icon="bus-outline" label="Bus" value={`#${recibo.numero_interno} · ${recibo.placa_bus}`} />
          <ReceiptRow icon="map-outline" label="Ruta" value={recibo.ruta} />
          <ReceiptRow icon="person-outline" label="Conductor" value={recibo.nombre_conductor} />
          <ReceiptRow icon="time-outline" label="Fecha" value={formatDate(recibo.fecha)} />
          <ReceiptRow icon="wallet-outline" label="Saldo restante" value={formatCurrency(recibo.balance)} />
        </View>

        <Button
          title="Volver a mi billetera"
          icon="wallet-outline"
          onPress={() => navigation.goBack()}
          style={styles.mt}
        />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.fareCard}>
          <View>
            <Text style={styles.fareLabel}>Valor del pasaje</Text>
            <Text style={styles.fareValue}>{tarifa !== null ? formatCurrency(tarifa) : '…'}</Text>
          </View>
          <Ionicons name="ticket" size={40} color="rgba(255,255,255,0.35)" />
        </View>

        <Pressable
          onPress={abrirEscaner}
          disabled={paying}
          accessibilityRole="button"
          style={({ pressed }) => [styles.scanCard, pressed && styles.pressed, paying && styles.disabled]}
        >
          <View style={styles.scanIcon}>
            <Ionicons name="qr-code" size={36} color={COLORS.text} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.scanTitle}>Escanear QR del bus</Text>
            <Text style={styles.scanSubtitle}>La forma más rápida de pagar</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.text} />
        </Pressable>

        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>o paga con el número</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.card}>
          <TextField
            label="Número del bus"
            icon="bus-outline"
            placeholder="Ej. 12 o POPAPAY-BUS-12-ABC123"
            autoCapitalize="characters"
            value={bus}
            onChangeText={setBus}
            onSubmitEditing={() => pagar(bus)}
            returnKeyType="go"
            style={styles.noTop}
          />
          <Button
            title={tarifa !== null ? `Pagar ${formatCurrency(tarifa)}` : 'Pagar'}
            icon="card-outline"
            onPress={() => pagar(bus)}
            loading={paying}
            style={styles.mt}
          />
        </View>

        <Notice type="error" message={error} />

        <Text style={styles.footnote}>
          <Ionicons name="flash-outline" size={12} color={COLORS.textLight} /> El pago le llega al
          conductor de inmediato.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ReceiptRow({ icon, label, value }) {
  return (
    <View style={styles.receiptRow}>
      <Ionicons name={icon} size={18} color={COLORS.textLight} />
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={styles.receiptValue}>{value}</Text>
    </View>
  );
}

const CORNER = 36;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },
  flex: { flex: 1 },
  mt: { marginTop: SPACING.md },
  noTop: { marginTop: 0 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
  fullWidth: { alignSelf: 'stretch' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW,
  },
  fareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  fareLabel: { color: COLORS.onPrimaryMuted, fontSize: FONT_SIZES.sm },
  fareValue: { color: COLORS.surface, fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW,
  },
  scanIcon: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  scanSubtitle: { fontSize: FONT_SIZES.sm, color: '#78350F', marginTop: 2 },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.lg,
  },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  separatorText: { color: COLORS.textLight, fontSize: FONT_SIZES.sm },
  footnote: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.lg,
  },
  // Camara
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xl,
  },
  cameraHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
  },
  cameraHintText: { color: COLORS.surface, fontSize: FONT_SIZES.md, fontWeight: '600' },
  cameraFrame: { width: 250, height: 250 },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: COLORS.accent },
  cornerTL: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 16 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 16 },
  // Comprobante
  receipt: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOW,
  },
  receiptIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  receiptTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.success },
  receiptAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  receiptHint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center' },
  divider: {
    alignSelf: 'stretch',
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  receiptLabel: { color: COLORS.textLight, fontSize: FONT_SIZES.sm },
  receiptValue: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
});

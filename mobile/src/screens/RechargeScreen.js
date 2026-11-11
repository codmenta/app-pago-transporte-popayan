import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import React, { useState } from 'react';
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
import { formatCurrency } from '../utils/formatCurrency';
import { rechargeSchema } from '../utils/validationSchemas';

// Montos rapidos para agilizar la recarga (ajustables segun el negocio)
const QUICK_AMOUNTS = [3000, 10000, 20000, 50000];

// Simula la espera de una pasarela de pago (Nequi / DaviPlata en sandbox)
function simulatePaymentDelay() {
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

export default function RechargeScreen({ navigation }) {
  const { user } = useAuth();
  const [rechargeError, setRechargeError] = useState('');
  const [recargado, setRecargado] = useState(null);

  async function handleRecharge(values, { setSubmitting, resetForm }) {
    setRechargeError('');
    try {
      await simulatePaymentDelay();
      await storage.addRecharge(user.email, Number(values.amount));
      resetForm();
      setRecargado(Number(values.amount));
    } catch (error) {
      setRechargeError('No pudimos procesar la recarga. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  // Confirmacion en pantalla (Alert.alert no funciona en la version web)
  if (recargado !== null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color={COLORS.surface} />
          </View>
          <Text style={styles.successTitle}>¡Recarga exitosa!</Text>
          <Text style={styles.successAmount}>{formatCurrency(recargado)}</Text>
          <Text style={styles.successText}>Ya está disponible en tu saldo.</Text>
        </View>
        <Button
          title="Volver a mi billetera"
          icon="wallet-outline"
          onPress={() => navigation.goBack()}
          style={styles.fullButton}
        />
        <Button
          title="Hacer otra recarga"
          variant="ghost"
          onPress={() => setRecargado(null)}
          style={styles.fullButton}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Formik
          initialValues={{ amount: '' }}
          validationSchema={rechargeSchema}
          onSubmit={handleRecharge}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
            <View>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>¿Cuánto quieres recargar?</Text>
                <View style={styles.quickAmountsGrid}>
                  {QUICK_AMOUNTS.map((amount) => {
                    const active = Number(values.amount) === amount;
                    return (
                      <Pressable
                        key={amount}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setFieldValue('amount', String(amount))}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {formatCurrency(amount)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <TextField
                  label="O escribe otro monto"
                  icon="cash-outline"
                  placeholder="Ej. 15000"
                  keyboardType="numeric"
                  onChangeText={handleChange('amount')}
                  onBlur={handleBlur('amount')}
                  value={values.amount}
                  error={touched.amount && errors.amount}
                />
              </View>

              <Notice
                type="info"
                message="Recarga simulada: no se realiza ningún cobro real. La integración con Nequi y DaviPlata se probará en entorno sandbox."
              />
              <Notice type="error" message={rechargeError} />

              <Button
                title={
                  Number(values.amount) > 0
                    ? `Recargar ${formatCurrency(Number(values.amount))}`
                    : 'Confirmar recarga'
                }
                icon="add-circle-outline"
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.submit}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', padding: SPACING.lg },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickAmountsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: {
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md - 2,
    backgroundColor: COLORS.surface,
  },
  chipActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  chipText: { color: COLORS.text, fontWeight: '700', fontSize: FONT_SIZES.md },
  chipTextActive: { color: COLORS.primaryDark },
  submit: { marginTop: SPACING.lg },
  successCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOW,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  successAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: SPACING.sm,
  },
  successText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  fullButton: { marginTop: SPACING.sm },
});

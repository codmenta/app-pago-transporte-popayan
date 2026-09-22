import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import { useAuth } from '../context/AuthContext';
import * as storage from '../services/storage';
import { rechargeSchema } from '../utils/validationSchemas';
import { formatCurrency } from '../utils/formatCurrency';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

// Montos rapidos para agilizar la recarga (ajustables segun el negocio)
const QUICK_AMOUNTS = [3000, 10000, 20000, 50000];

// Simula la espera de una pasarela de pago (Nequi / DaviPlata en sandbox)
function simulatePaymentDelay() {
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

export default function RechargeScreen({ navigation }) {
  const { user } = useAuth();
  const [rechargeError, setRechargeError] = useState('');

  async function handleRecharge(values, { setSubmitting, resetForm }) {
    setRechargeError('');
    try {
      await simulatePaymentDelay();
      await storage.addRecharge(user.email, Number(values.amount));
      resetForm();
      Alert.alert(
        'Recarga exitosa',
        `Se agregaron ${formatCurrency(values.amount)} a tu saldo.`,
        [{ text: 'Ver mi billetera', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      setRechargeError('No pudimos procesar la recarga. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Recargar saldo</Text>
      <Text style={styles.subtitle}>
        Esta recarga es simulada: no se realiza ningun cobro real. La
        integracion con Nequi y DaviPlata se probara en entorno sandbox.
      </Text>

      <Formik
        initialValues={{ amount: '' }}
        validationSchema={rechargeSchema}
        onSubmit={handleRecharge}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
          <View style={styles.form}>
            <Text style={styles.label}>Elige un monto</Text>
            <View style={styles.quickAmountsRow}>
              {QUICK_AMOUNTS.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountChip,
                    Number(values.amount) === amount && styles.quickAmountChipActive,
                  ]}
                  onPress={() => setFieldValue('amount', String(amount))}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      Number(values.amount) === amount && styles.quickAmountTextActive,
                    ]}
                  >
                    {formatCurrency(amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>O ingresa otro monto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 15000"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              onChangeText={handleChange('amount')}
              onBlur={handleBlur('amount')}
              value={values.amount}
            />
            {touched.amount && errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}

            {rechargeError ? <Text style={styles.errorText}>{rechargeError}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.surface} />
              ) : (
                <Text style={styles.buttonText}>Confirmar recarga</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </Formik>
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
  form: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickAmountChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  quickAmountChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  quickAmountTextActive: {
    color: COLORS.surface,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

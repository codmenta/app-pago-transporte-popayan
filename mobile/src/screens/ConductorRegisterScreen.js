import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import * as storage from '../services/storage';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

export default function ConductorRegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCrearConductor() {
    setError('');

    if (!nombre || !cedula || !celular || !correo || !password) {
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await storage.registerConductor(nombre, cedula, celular, correo, password);
      Alert.alert('Conductor registrado', `Se creo la cuenta de ${nombre} correctamente.`);
      setNombre('');
      setCedula('');
      setCelular('');
      setCorreo('');
      setPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registro de Conductores</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Datos del conductor</Text>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Juan Perez Lopez"
          placeholderTextColor={COLORS.textLight}
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Cedula / Documento</Text>
        <TextInput
          style={styles.input}
          placeholder="1234567890"
          placeholderTextColor={COLORS.textLight}
          value={cedula}
          onChangeText={setCedula}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Telefono</Text>
        <TextInput
          style={styles.input}
          placeholder="3001234567"
          placeholderTextColor={COLORS.textLight}
          value={celular}
          onChangeText={setCelular}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Correo electronico</Text>
        <TextInput
          style={styles.input}
          placeholder="conductor@popapay.com"
          placeholderTextColor={COLORS.textLight}
          autoCapitalize="none"
          keyboardType="email-address"
          value={correo}
          onChangeText={setCorreo}
        />

        <Text style={styles.label}>Contraseña temporal</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={COLORS.textLight}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleCrearConductor} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.buttonText}>✓ Registrar conductor</Text>
          )}
        </TouchableOpacity>
      </View>
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
});
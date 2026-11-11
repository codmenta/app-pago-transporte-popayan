import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AdminTabs from '../components/AdminTabs';
import Button from '../components/Button';
import Notice from '../components/Notice';
import TextField from '../components/TextField';
import { COLORS, FONT_SIZES, RADIUS, SHADOW, SPACING } from '../constants/theme';
import * as storage from '../services/storage';

export default function ConductorRegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  async function handleCrearConductor() {
    setError('');
    setExito('');

    if (!nombre || !cedula || !celular || !correo || !password) {
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await storage.registerConductor(nombre, cedula, celular, correo, password);
      // Mensaje en pantalla (Alert.alert no funciona en la version web)
      setExito(`Se creó la cuenta de ${nombre}. Ya puede iniciar sesión con ${correo}.`);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <AdminTabs />

      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="person-add" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Datos del conductor</Text>
        </View>

        <TextField
          label="Nombre completo"
          icon="person-outline"
          placeholder="Ej: Juan Pérez López"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextField
          label="Cédula / Documento"
          icon="id-card-outline"
          placeholder="1234567890"
          value={cedula}
          onChangeText={setCedula}
          keyboardType="numeric"
        />
        <TextField
          label="Teléfono"
          icon="call-outline"
          placeholder="3001234567"
          value={celular}
          onChangeText={setCelular}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <TextField
          label="Correo electrónico"
          icon="mail-outline"
          placeholder="conductor@popapay.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={correo}
          onChangeText={setCorreo}
        />
        <TextField
          label="Contraseña temporal"
          icon="lock-closed-outline"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Notice type="error" message={error} />
        <Notice type="success" message={exito} />

        <Button
          title="Registrar conductor"
          icon="checkmark-circle-outline"
          onPress={handleCrearConductor}
          loading={loading}
          style={styles.mt}
        />
      </View>
    </ScrollView>
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
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
});

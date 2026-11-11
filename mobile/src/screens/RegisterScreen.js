import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Notice from '../components/Notice';
import TextField from '../components/TextField';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../utils/validationSchemas';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [registerError, setRegisterError] = useState('');
  const [registrado, setRegistrado] = useState(false);

  async function handleRegister(values, { setSubmitting, resetForm }) {
    setRegisterError('');
    try {
      await register(values);
      resetForm();
      setRegistrado(true);
    } catch (error) {
      setRegisterError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Confirmacion en pantalla (Alert.alert no funciona en la version web)
  if (registrado) {
    return (
      <AuthLayout title="¡Cuenta creada!">
        <View style={styles.successBox}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color={COLORS.surface} />
          </View>
          <Text style={styles.successText}>
            Tu registro fue exitoso. Ya puedes iniciar sesión, recargar saldo y pagar tu pasaje.
          </Text>
        </View>
        <Button
          title="Iniciar sesión"
          icon="log-in-outline"
          onPress={() => navigation.navigate('Login')}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Regístrate para pagar tu pasaje desde el celular"
      footer={
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text style={styles.linkText}>
            ¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia sesión</Text>
          </Text>
        </Pressable>
      }
    >
      <Formik
        initialValues={{
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={registerSchema}
        onSubmit={handleRegister}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View>
            <TextField
              label="Nombre completo"
              icon="person-outline"
              placeholder="Ej. Ana María Rodríguez"
              autoComplete="name"
              onChangeText={handleChange('fullName')}
              onBlur={handleBlur('fullName')}
              value={values.fullName}
              error={touched.fullName && errors.fullName}
            />

            <TextField
              label="Correo electrónico"
              icon="mail-outline"
              placeholder="nombre@correo.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              error={touched.email && errors.email}
            />

            <TextField
              label="Celular"
              icon="call-outline"
              placeholder="3001234567"
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              value={values.phone}
              error={touched.phone && errors.phone}
            />

            <TextField
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              error={touched.password && errors.password}
            />

            <TextField
              label="Confirmar contraseña"
              icon="shield-checkmark-outline"
              placeholder="Repite tu contraseña"
              secureTextEntry
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              value={values.confirmPassword}
              error={touched.confirmPassword && errors.confirmPassword}
            />

            <Notice type="error" message={registerError} />

            <Button
              title="Crear mi cuenta"
              icon="person-add-outline"
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.submit}
            />
          </View>
        )}
      </Formik>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: SPACING.lg },
  linkText: { color: COLORS.textLight, fontSize: FONT_SIZES.sm },
  linkTextBold: { color: COLORS.primary, fontWeight: '700' },
  successBox: { alignItems: 'center', marginVertical: SPACING.lg },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
});

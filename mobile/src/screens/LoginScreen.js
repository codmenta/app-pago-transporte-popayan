import { Formik } from 'formik';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Notice from '../components/Notice';
import TextField from '../components/TextField';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../utils/validationSchemas';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState('');

  async function handleLogin(values, { setSubmitting }) {
    setLoginError('');
    try {
      await login(values);
      // Si el login es correcto, AppNavigator cambia de stack solo
      // (ver src/navigation/AppNavigator.js), no hace falta navegar aqui.
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para pagar tu pasaje y consultar tu saldo"
      footer={
        <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
          <Text style={styles.linkText}>
            ¿No tienes cuenta? <Text style={styles.linkTextBold}>Regístrate aquí</Text>
          </Text>
        </Pressable>
      }
    >
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View>
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
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="Tu contraseña"
              secureTextEntry
              autoComplete="password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              onSubmitEditing={handleSubmit}
              returnKeyType="go"
              value={values.password}
              error={touched.password && errors.password}
            />

            <Notice type="error" message={loginError} />

            <Button
              title="Iniciar sesión"
              icon="log-in-outline"
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
});

import { Formik } from 'formik';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';

// Esquema de validación con Yup
const registerSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .required('El nombre es obligatorio'),
  apellido: Yup.string()
    .min(3, 'El apellido debe tener al menos 3 caracteres')
    .required('El apellido es obligatorio'),
  cedula: Yup.string()
    .matches(/^[0-9]+$/, 'La cédula solo debe contener números')
    .min(5, 'La cédula debe tener al menos 5 dígitos')
    .max(10, 'La cédula no puede tener más de 10 dígitos')
    .required('La cédula es obligatoria'),
  email: Yup.string()
    .email('Email inválido')
    .required('El email es obligatorio'),
  telefono: Yup.string()
    .matches(/^[0-9]+$/, 'El teléfono solo debe contener números')
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .required('El teléfono es obligatorio'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

export default function RegisterScreen({ navigation }) {
  
  const handleRegister = async (values) => {
    // Aquí iría la lógica de registro con tu backend
    // Por ahora, simulamos el registro exitoso
    
    console.log('Datos del registro:', values);
    
    Alert.alert(
      'Registro Exitoso',
      `¡Bienvenido ${values.nombre}! Tu cuenta ha sido creada.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Registro de Pasajero</Text>

        <Formik
          initialValues={{
            nombre: '',
            apellido: '',
            cedula: '',
            email: '',
            telefono: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={[styles.input, touched.nombre && errors.nombre && styles.inputError]}
                  placeholder="Ingresa tu nombre"
                  onChangeText={handleChange('nombre')}
                  onBlur={handleBlur('nombre')}
                  value={values.nombre}
                />
                {touched.nombre && errors.nombre && (
                  <Text style={styles.errorText}>{errors.nombre}</Text>
                )}
              </View>

              {/* Apellido */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  style={[styles.input, touched.apellido && errors.apellido && styles.inputError]}
                  placeholder="Ingresa tu apellido"
                  onChangeText={handleChange('apellido')}
                  onBlur={handleBlur('apellido')}
                  value={values.apellido}
                />
                {touched.apellido && errors.apellido && (
                  <Text style={styles.errorText}>{errors.apellido}</Text>
                )}
              </View>

              {/* Cédula */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cédula</Text>
                <TextInput
                  style={[styles.input, touched.cedula && errors.cedula && styles.inputError]}
                  placeholder="Número de cédula"
                  onChangeText={handleChange('cedula')}
                  onBlur={handleBlur('cedula')}
                  value={values.cedula}
                  keyboardType="numeric"
                />
                {touched.cedula && errors.cedula && (
                  <Text style={styles.errorText}>{errors.cedula}</Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                  style={[styles.input, touched.email && errors.email && styles.inputError]}
                  placeholder="tu@email.com"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              {/* Teléfono */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={[styles.input, touched.telefono && errors.telefono && styles.inputError]}
                  placeholder="Número de teléfono"
                  onChangeText={handleChange('telefono')}
                  onBlur={handleBlur('telefono')}
                  value={values.telefono}
                  keyboardType="phone-pad"
                />
                {touched.telefono && errors.telefono && (
                  <Text style={styles.errorText}>{errors.telefono}</Text>
                )}
              </View>

              {/* Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={[styles.input, touched.password && errors.password && styles.inputError]}
                  placeholder="Mínimo 6 caracteres"
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirmar Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Contraseña</Text>
                <TextInput
                  style={[styles.input, touched.confirmPassword && errors.confirmPassword && styles.inputError]}
                  placeholder="Repite tu contraseña"
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                  secureTextEntry
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Botón de Registro */}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Registrarse</Text>
              </TouchableOpacity>

              {/* Link para ir al Login */}
              <TouchableOpacity
                style={styles.linkContainer}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkBold: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Logo from '../components/Logo';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import AsignarTurnoScreen from '../screens/AsignarTurnoScreen';
import BusRegisterScreen from '../screens/BusRegisterScreen';
import ConductorHomeScreen from '../screens/ConductorHomeScreen';
import ConductorRegisterScreen from '../screens/ConductorRegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import PayScreen from '../screens/PayScreen';
import RechargeScreen from '../screens/RechargeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WalletScreen from '../screens/WalletScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading, logout } = useAuth();

  const logoutButton = () => (
    <Pressable
      onPress={logout}
      style={styles.logoutBtn}
      accessibilityRole="button"
      accessibilityLabel="Cerrar sesión"
      hitSlop={8}
    >
      <Ionicons name="log-out-outline" size={18} color={COLORS.surface} />
      <Text style={styles.logoutText}>Salir</Text>
    </Pressable>
  );

  // Cabecera con el logo (admin y conductor)
  const brandHeader = {
    headerTitle: () => <Logo size={30} light />,
    headerTitleAlign: 'left',
    headerRight: logoutButton,
    headerShadowVisible: false,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Logo size={72} showName={false} />
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <NavigationContainer documentTitle={{ formatter: (_, route) => `PopaPay · ${TITLES[route?.name] || 'Inicio'}` }}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.surface,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!user ? (
          // Sin sesion iniciada
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : user.role === 'admin' ? (
          // Sesion de administrador: las pantallas se cambian con las pestañas (AdminTabs)
          <>
            <Stack.Screen name="BusRegister" component={BusRegisterScreen} options={{ ...brandHeader, animation: 'none' }} />
            <Stack.Screen name="ConductorRegister" component={ConductorRegisterScreen} options={{ ...brandHeader, animation: 'none' }} />
            <Stack.Screen name="AsignarTurno" component={AsignarTurnoScreen} options={{ ...brandHeader, animation: 'none' }} />
          </>
        ) : user.role === 'conductor' ? (
          // Sesion de conductor
          <Stack.Screen name="ConductorHome" component={ConductorHomeScreen} options={brandHeader} />
        ) : (
          // Sesion de pasajero (por defecto)
          <>
            <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Recharge" component={RechargeScreen} options={{ title: TITLES.Recharge }} />
            <Stack.Screen name="Pay" component={PayScreen} options={{ title: TITLES.Pay }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Titulos de cada pantalla (tambien se usan como titulo de la pestaña del navegador)
const TITLES = {
  Login: 'Iniciar sesión',
  Register: 'Crear cuenta',
  BusRegister: 'Buses',
  ConductorRegister: 'Conductores',
  AsignarTurno: 'Turnos',
  ConductorHome: 'Panel del conductor',
  Wallet: 'Mi billetera',
  Recharge: 'Recargar saldo',
  Pay: 'Pagar pasaje',
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  loader: { marginTop: SPACING.lg },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.md - 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
    // En web la cabecera no agrega margen a la derecha
    marginRight: Platform.OS === 'web' ? SPACING.md : 0,
  },
  logoutText: { color: COLORS.surface, fontWeight: '600', fontSize: FONT_SIZES.sm },
});

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RechargeScreen from '../screens/RechargeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WalletScreen from '../screens/WalletScreen';
import BusRegisterScreen from '../screens/BusRegisterScreen';
import ConductorRegisterScreen from '../screens/ConductorRegisterScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.surface,
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        {!user ? (
          // Sin sesion iniciada
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesion', headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta', headerShown: false }} />
          </>
        ) : user.role === 'admin' ? (
          // Sesion de administrador
          <>
            <Stack.Screen name="BusRegister" component={BusRegisterScreen} options={{ title: 'Registrar bus' }} />
            <Stack.Screen name="ConductorRegister" component={ConductorRegisterScreen} options={{ title: 'Registrar conductor' }} />
  
          </>
        ) : user.role === 'conductor' ? (
          // Sesion de conductor (pendiente de construir su dashboard)
          <>
            <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Panel de conductor (temporal)' }} />
          </>
        ) : (
          // Sesion de pasajero (por defecto)
          <>
            <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Mi billetera' }} />
            <Stack.Screen name="Recharge" component={RechargeScreen} options={{ title: 'Recargar saldo' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
});
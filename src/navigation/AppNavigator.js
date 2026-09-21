import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RechargeScreen from '../screens/RechargeScreen';
import WalletScreen from '../screens/WalletScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Transporte Popayán' }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Mi Billetera' }} />
      <Stack.Screen name="Recharge" component={RechargeScreen} options={{ title: 'Recargar Saldo' }} />
    </Stack.Navigator>
  );
}
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RechargeScreen({ route, navigation }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('nequi'); // 'nequi' o 'daviplata'

  const handleRecharge = () => {
    const rechargeAmount = parseInt(amount);
    
    // Validación simple
    if (!amount || rechargeAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    if (rechargeAmount < 5000) {
      Alert.alert('Error', 'La recarga mínima es de $5.000');
      return;
    }

    // Simular recarga exitosa
    Alert.alert(
      'Recarga exitosa',
      `Has recargado $${rechargeAmount.toLocaleString()} con ${paymentMethod === 'nequi' ? 'Nequi' : 'DaviPlata'}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Llamar a la función que actualiza el saldo en Wallet
            if (route.params?.onRecharge) {
              route.params.onRecharge(rechargeAmount);
            }
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recargar Saldo</Text>

      <Text style={styles.label}>Monto a recargar (COP)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 20000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Método de pago</Text>
      <View style={styles.paymentOptions}>
        <Button 
          title={paymentMethod === 'nequi' ? '✓ Nequi' : 'Nequi'} 
          onPress={() => setPaymentMethod('nequi')} 
        />
        <Button 
          title={paymentMethod === 'daviplata' ? '✓ DaviPlata' : 'DaviPlata'} 
          onPress={() => setPaymentMethod('daviplata')} 
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Esta es una recarga simulada. En la versión final, 
          se conectará con la API de {paymentMethod === 'nequi' ? 'Nequi' : 'DaviPlata'}.
        </Text>
      </View>

      <Button title="Confirmar Recarga" onPress={handleRecharge} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 8, fontWeight: '600' },
  input: { 
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 12, 
    marginBottom: 20, 
    borderRadius: 8 
  },
  paymentOptions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  infoBox: { 
    backgroundColor: '#E3F2FD', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 20 
  },
  infoText: { color: '#1976D2', fontSize: 14 }
});
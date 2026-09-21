import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WalletScreen({ navigation }) {
  // ESTADO LOCAL - después vendrá de tu backend/API
  const [balance, setBalance] = useState(15000); // Saldo inicial simulado
  
  const [transactions, setTransactions] = useState([
    { id: '1', type: 'Recarga', amount: 20000, date: '2026-09-20', description: 'Recarga con Nequi' },
    { id: '2', type: 'Pago', amount: -2500, date: '2026-09-21', description: 'Pasaje bus TP9BT' },
    { id: '3', type: 'Pago', amount: -2500, date: '2026-09-22', description: 'Pasaje bus TP5BT' },
  ]);

  // Función para recargar (se llama desde RechargeScreen)
  const addBalance = (amount) => {
    setBalance(balance + amount);
    const newTransaction = {
      id: Date.now().toString(),
      type: 'Recarga',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      description: 'Recarga simulada'
    };
    setTransactions([newTransaction, ...transactions]);
  };

  return (
    <View style={styles.container}>
      {/* SALDO ACTUAL */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balanceAmount}>${balance.toLocaleString()} COP</Text>
      </View>

      {/* BOTÓN RECARGAR */}
      <TouchableOpacity 
        style={styles.rechargeButton}
        onPress={() => navigation.navigate('Recharge', { onRecharge: addBalance })}
      >
        <Text style={styles.rechargeButtonText}>+ Recargar Saldo</Text>
      </TouchableOpacity>

      {/* HISTORIAL DE MOVIMIENTOS */}
      <Text style={styles.sectionTitle}>Historial de movimientos</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View>
              <Text style={styles.transactionType}>{item.type}</Text>
              <Text style={styles.transactionDesc}>{item.description}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              { color: item.amount > 0 ? 'green' : 'red' }
            ]}>
              {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  balanceCard: { 
    backgroundColor: '#4CAF50', 
    padding: 25, 
    borderRadius: 12, 
    marginBottom: 20,
    alignItems: 'center'
  },
  balanceLabel: { color: 'white', fontSize: 16 },
  balanceAmount: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  rechargeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  rechargeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  transactionItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  transactionType: { fontWeight: 'bold', fontSize: 14 },
  transactionDesc: { color: '#666', fontSize: 12 },
  transactionDate: { color: '#999', fontSize: 11 },
  transactionAmount: { fontWeight: 'bold', fontSize: 16 }
});
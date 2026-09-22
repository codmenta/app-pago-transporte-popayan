import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as storage from '../services/storage';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

export default function WalletScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, movements: [] });
  const [refreshing, setRefreshing] = useState(false);

  async function loadWallet() {
    if (!user) return;
    const data = await storage.getWallet(user.email);
    setWallet(data);
  }

  // SCRUM-18 / SCRUM-19: recargamos el saldo y el historial cada vez que
  // esta pantalla vuelve a tener foco, por ejemplo al volver de Recharge.
  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [user])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadWallet();
    setRefreshing(false);
  }

  function renderMovement({ item }) {
    return (
      <View style={styles.movementRow}>
        <View style={styles.movementIcon}>
          <Text style={styles.movementIconText}>+</Text>
        </View>
        <View style={styles.movementInfo}>
          <Text style={styles.movementDescription}>{item.description}</Text>
          <Text style={styles.movementDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.movementAmount}>{formatCurrency(item.amount)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user?.fullName?.split(' ')[0]}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesion</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balanceValue}>{formatCurrency(wallet.balance)}</Text>
        <TouchableOpacity
          style={styles.rechargeButton}
          onPress={() => navigation.navigate('Recharge')}
        >
          <Text style={styles.rechargeButtonText}>Recargar saldo</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyTitle}>Historial de movimientos</Text>

      <FlatList
        data={wallet.movements}
        keyExtractor={(item) => item.id}
        renderItem={renderMovement}
        contentContainerStyle={
          wallet.movements.length === 0 ? styles.emptyListContent : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Todavia no tienes movimientos. Recarga tu saldo para empezar.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  balanceLabel: {
    color: '#DCEFE4',
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  balanceValue: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xl + 8,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  rechargeButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
  },
  rechargeButtonText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  historyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  movementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  movementIconText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  movementInfo: {
    flex: 1,
  },
  movementDescription: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  movementDate: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  movementAmount: {
    color: COLORS.success,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyStateText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
});

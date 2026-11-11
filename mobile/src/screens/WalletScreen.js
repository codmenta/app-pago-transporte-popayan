import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import { COLORS, FONT_SIZES, RADIUS, SHADOW, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import * as storage from '../services/storage';
import { formatCurrency, formatDate } from '../utils/formatCurrency';

export default function WalletScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [wallet, setWallet] = useState({ balance: 0, movements: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadWallet() {
    if (!user) return;
    const data = await storage.getWallet(user.email);
    setWallet(data);
    setLoaded(true);
  }

  // SCRUM-18 / SCRUM-19: recargamos el saldo y el historial cada vez que
  // esta pantalla vuelve a tener foco, por ejemplo al volver de Recharge o Pay.
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
    const esPago = item.type === 'pago';
    return (
      <View style={styles.movementRow}>
        <View style={[styles.movementIcon, esPago ? styles.iconPago : styles.iconRecarga]}>
          <Ionicons
            name={esPago ? 'bus' : 'arrow-down'}
            size={18}
            color={esPago ? COLORS.error : COLORS.success}
          />
        </View>
        <View style={styles.movementInfo}>
          <Text style={styles.movementDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.movementDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={[styles.movementAmount, esPago && styles.amountPago]}>
          {esPago ? '− ' : '+ '}
          {formatCurrency(item.amount)}
        </Text>
      </View>
    );
  }

  const header = (
    <View>
      <View style={[styles.top, { paddingTop: insets.top + SPACING.md }]}>
        <View style={styles.topBar}>
          <Logo size={34} light />
          <Pressable
            onPress={logout}
            style={styles.logoutBtn}
            accessibilityLabel="Cerrar sesión"
            hitSlop={8}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.surface} />
            <Text style={styles.logoutText}>Salir</Text>
          </Pressable>
        </View>

        <Text style={styles.greeting}>Hola, {user?.fullName?.split(' ')[0]} 👋</Text>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balanceValue}>{formatCurrency(wallet.balance)}</Text>
      </View>

      <View style={styles.actions}>
        <ActionTile
          icon="qr-code"
          title="Pagar pasaje"
          subtitle="Escanea el QR del bus"
          highlight
          onPress={() => navigation.navigate('Pay')}
        />
        <ActionTile
          icon="add-circle"
          title="Recargar"
          subtitle="Agrega saldo"
          onPress={() => navigation.navigate('Recharge')}
        />
      </View>

      <Text style={styles.historyTitle}>Movimientos recientes</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={wallet.movements}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderMovement}
      ListHeaderComponent={header}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
      }
      ListEmptyComponent={
        loaded ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Aún no tienes movimientos</Text>
            <Text style={styles.emptyStateText}>
              Recarga tu saldo para empezar a pagar tus pasajes.
            </Text>
          </View>
        ) : null
      }
    />
  );
}

function ActionTile({ icon, title, subtitle, onPress, highlight }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.tile, highlight && styles.tileHighlight, pressed && styles.tilePressed]}
    >
      <View style={[styles.tileIcon, highlight && styles.tileIconHighlight]}>
        <Ionicons name={icon} size={26} color={highlight ? COLORS.text : COLORS.primary} />
      </View>
      <Text style={[styles.tileTitle, highlight && styles.tileTitleHighlight]}>{title}</Text>
      <Text style={[styles.tileSubtitle, highlight && styles.tileSubtitleHighlight]}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingBottom: SPACING.xl },
  top: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
    borderBottomLeftRadius: RADIUS.xl + 8,
    borderBottomRightRadius: RADIUS.xl + 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.md - 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
  },
  logoutText: { color: COLORS.surface, fontWeight: '600', fontSize: FONT_SIZES.sm },
  greeting: { color: COLORS.surface, fontSize: FONT_SIZES.lg, fontWeight: '700' },
  balanceLabel: { color: COLORS.onPrimaryMuted, fontSize: FONT_SIZES.sm, marginTop: SPACING.md },
  balanceValue: {
    color: COLORS.surface,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md - 4,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.xl - SPACING.sm,
  },
  tile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW,
  },
  tileHighlight: { backgroundColor: COLORS.accent },
  tilePressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  tileIconHighlight: { backgroundColor: 'rgba(255,255,255,0.45)' },
  tileTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  tileTitleHighlight: { color: COLORS.text },
  tileSubtitle: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  tileSubtitleHighlight: { color: '#78350F' },
  historyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md - 4,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md - 4,
  },
  iconRecarga: { backgroundColor: COLORS.successLight },
  iconPago: { backgroundColor: COLORS.errorLight },
  movementInfo: { flex: 1 },
  movementDescription: { color: COLORS.text, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  movementDate: { color: COLORS.textLight, fontSize: FONT_SIZES.xs, marginTop: 2 },
  movementAmount: { color: COLORS.success, fontWeight: '700', fontSize: FONT_SIZES.sm },
  amountPago: { color: COLORS.error },
  emptyState: { alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  emptyStateText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

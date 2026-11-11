import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

const LOGO = require('../../assets/images/popapay-logo.png');

// Logo de PopaPay: icono + nombre. "light" es para fondos oscuros (texto blanco).
export default function Logo({ size = 48, light = false, showName = true, tagline }) {
  const fontSize = Math.round(size * 0.6);
  return (
    <View style={styles.row}>
      <Image source={LOGO} style={{ width: size, height: size }} accessibilityLabel="PopaPay" />
      {showName && (
        <View style={styles.textBox}>
          <Text style={[styles.name, { fontSize }, light && styles.nameLight]}>
            Popa<Text style={styles.pay}>Pay</Text>
          </Text>
          {tagline ? (
            <Text style={[styles.tagline, light && styles.taglineLight]}>{tagline}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  textBox: { marginLeft: 10 },
  name: { fontWeight: '800', color: COLORS.primaryDark, letterSpacing: -0.5 },
  nameLight: { color: COLORS.surface },
  pay: { color: COLORS.accent },
  tagline: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  taglineLight: { color: COLORS.onPrimaryMuted },
});

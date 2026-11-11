// Paleta de PopaPay (psicologia del color para transporte + pagos):
// - Azul: confianza y seguridad (bancos, billeteras, sistemas de transporte).
// - Ambar: atencion y movimiento (buses, señalizacion); solo en acciones clave.
// Son los mismos colores del logo (assets/images/popapay-logo.svg).
export const COLORS = {
  primary: '#1E40AF',
  primaryDark: '#1E3A8A',
  primaryLight: '#EAF0FF',
  secondary: '#3B82F6',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  background: '#F4F6FB',
  surface: '#FFFFFF',
  text: '#0F172A',
  textLight: '#64748B',
  border: '#E2E8F0',
  disabled: '#94A3B8',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  success: '#16A34A',
  successLight: '#DCFCE7',
  onPrimaryMuted: '#C7D5FB',
};

// Colores de cada empresa de transporte, usados solo como etiqueta de la ruta
// (ver src/components/RouteBadge.js). La marca PopaPay es neutral y sirve para todas.
export const ROUTE_COLORS = {
  transpubenza: { bg: '#1D4ED8', fg: '#FFFFFF', dot: '#FACC15' }, // azul y amarillo
  rapidotambo: { bg: '#15803D', fg: '#FFFFFF', dot: '#FFFFFF' }, // verde y blanco
  sotracauca: { bg: '#4B5563', fg: '#FFFFFF', dot: '#EF4444' }, // gris y rojo
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

// Sombra suave para tarjetas (iOS, Android y web)
export const SHADOW = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

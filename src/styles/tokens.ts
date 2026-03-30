// ─── tokens.ts ────────────────────────────────────────────────────────────────
// Sistema de diseño centralizado de SmartCampus.
// Contiene ÚNICAMENTE valores visuales: colores, tipografía, espaciado,
// bordes y sombras. Sin lógica de negocio.
//
// Las funciones de dominio como getStatusColor y getPriorityColor
// pertenecen a la capa de services/, no a este archivo.
// Los componentes UI reciben esos valores ya resueltos como props.

import { StyleSheet } from 'react-native'

// ─── Paleta de colores ────────────────────────────────────────────────────────

export const COLORS = {
  // Primarios
  primary:     '#21D0B2',   // Teal — botones, badges activos, acentos principales
  primaryDark: '#1AB99D',   // Teal oscuro — estados pressed
  primaryLight:'#E8F9F7',   // Teal muy claro — fondos info, banners

  // Secundarios
  accent:      '#1DCDFE',   // Azul claro — elementos de autoridad, links
  accentDark:  '#0EADD9',   // Azul oscuro — estados pressed

  // Neutros
  navy:        '#2F455C',   // Azul marino — headers, texto principal, botones secundarios
  navyLight:   '#4A6080',   // Azul marino claro — texto secundario

  // Texto
  textPrimary:   '#2F455C',
  textSecondary: '#8B9BA8',
  textWhite:     '#FFFFFF',
  textMuted:     '#6B7280',

  // Fondos
  bgPrimary:   '#FFFFFF',
  bgSecondary: '#F5F7FA',
  bgTertiary:  '#F8FAFB',

  // Bordes
  border:      '#E1E8ED',
  borderLight: '#E5E7EB',

  // Estados de reporte
  statusPending:   '#FFA726',   // Pendiente — naranja
  statusInProgress:'#42A5F5',   // En proceso — azul
  statusResolved:  '#66BB6A',   // Resuelto — verde

  // Prioridades
  priorityHigh:   '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow:    '#6366F1',

  // Feedback
  success: '#32CD32',
  error:   '#FF4444',
  warning: '#FFD700',
  info:    '#4895EF',

  // PDF / Informes
  pdfBlue:      '#1E40AF',
  pdfBlueDark:  '#042C53',
  pdfBlueLight: '#EFF6FF',

  // Roles
  bgAutoridad:   '#2F455C',
  bgDocente:     'transparent',
  bgMantenimiento:'#2F455C',
  bgSistemas:    '#2F455C',
} as const

// ─── Tipografía ───────────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  // Tamaños
  xs:   11,
  sm:   12,
  md:   14,
  base: 16,
  lg:   18,
  xl:   20,
  xxl:  24,
  xxxl: 28,
  hero: 32,

  // Pesos
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
} as const

// ─── Espaciado ────────────────────────────────────────────────────────────────

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  base:16,
  lg:  20,
  xl:  24,
  xxl: 32,
  xxxl:40,
} as const

// ─── Bordes redondeados ───────────────────────────────────────────────────────

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 999,
} as const

// ─── Sombras ──────────────────────────────────────────────────────────────────

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  primary: {
    shadowColor: '#21D0B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  accent: {
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pdf: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
} as const

// ─── Estilos base compartidos ─────────────────────────────────────────────────
// Fragmentos de StyleSheet usados por múltiples componentes.
// No son componentes completos, son piezas que se combinan.

export const BASE_STYLES = StyleSheet.create({
  // Contenedores
  flex1:         { flex: 1 },
  centered:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  row:           { flexDirection: 'row', alignItems: 'center' },
  bgSecondary:   { backgroundColor: COLORS.bgSecondary },
  bgTertiary:    { backgroundColor: COLORS.bgTertiary },

  // Tarjeta base
  card: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },

  // Input base
  input: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
  },

  // Label base
  label: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  // Sección
  section: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
})
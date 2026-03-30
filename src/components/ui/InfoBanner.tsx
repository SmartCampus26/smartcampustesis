// ─── InfoBanner.tsx ───────────────────────────────────────────────────────────
// Franja informativa con ícono y texto descriptivo.
// Usada para avisos contextuales dentro de formularios y pantallas.
//
// Reemplaza:
//   - `infoCard` en crearReporteStyles.ts
//   - `infoBox` en empleadoNuevoStyles.ts y usuarioNuevoStyles.ts
//   - Banners de error/éxito en ContraseniaOlvidada.tsx
//
// USO:
//   <InfoBanner
//     text="El reporte se creará con estado 'Pendiente' y será asignado por el jefe."
//   />
//   <InfoBanner
//     text="Correo enviado correctamente."
//     variant="success"
//     icon="checkmark-circle"
//   />
//   <InfoBanner
//     text="No se pudo enviar el correo."
//     variant="error"
//     icon="alert-circle"
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Variantes visuales del banner */
type BannerVariant = 'info' | 'success' | 'error' | 'warning'

interface InfoBannerProps {
  /** Texto descriptivo del banner */
  text: string
  /** Variante visual. Default: 'info' */
  variant?: BannerVariant
  /** Ícono de Ionicons. Tiene defaults por variante si no se especifica */
  icon?: React.ComponentProps<typeof Ionicons>['name']
}

// ─── Configuración por variante ───────────────────────────────────────────────

const VARIANT_CONFIG: Record<BannerVariant, {
  bg: string
  border: string
  iconColor: string
  defaultIcon: React.ComponentProps<typeof Ionicons>['name']
}> = {
  info: {
    bg:          COLORS.primaryLight,
    border:      COLORS.primary,
    iconColor:   COLORS.primary,
    defaultIcon: 'information-circle',
  },
  success: {
    bg:          '#F0FFF0',
    border:      COLORS.success,
    iconColor:   COLORS.success,
    defaultIcon: 'checkmark-circle',
  },
  error: {
    bg:          '#FFF0F0',
    border:      COLORS.error,
    iconColor:   COLORS.error,
    defaultIcon: 'alert-circle',
  },
  warning: {
    bg:          '#FFF9E6',
    border:      '#FFA726',
    iconColor:   '#FFA726',
    defaultIcon: 'warning',
  },
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function InfoBanner({
  text,
  variant = 'info',
  icon,
}: InfoBannerProps) {
  const config = VARIANT_CONFIG[variant]
  const iconName = icon ?? config.defaultIcon

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: config.bg,
        borderLeftColor: config.border,
      },
    ]}>
      <Ionicons name={iconName} size={20} color={config.iconColor} />
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    marginBottom: SPACING.xl,
  },

  text: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
})
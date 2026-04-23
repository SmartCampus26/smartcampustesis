// ─── StatCard.tsx ─────────────────────────────────────────────────────────────
// Tarjeta de estadística individual para los homes.
// Muestra un ícono, número grande y etiqueta sobre fondo de color.
// Opcionalmente presionable para navegar a una vista filtrada.
//
// USO:
//   <StatCard value={42} label="Pendientes" color={COLORS.statusPending} />
//   <StatCard value={8}  label="Resueltos"  color={COLORS.statusResolved} onPress={() => router.push('...')} />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  /** Número mostrado en grande */
  value: number
  /** Etiqueta descriptiva debajo del número */
  label: string
  /** Color de fondo de la tarjeta */
  color: string
  /** Ícono de Ionicons (opcional) */
  iconName?: React.ComponentProps<typeof Ionicons>['name']
  /** Función ejecutada al presionar. Si no se pasa, la tarjeta no es presionable */
  onPress?: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function StatCard({
  value,
  label,
  color,
  iconName,
  onPress,
}: StatCardProps) {
  const Container = onPress ? TouchableOpacity : View

  return (
    <Container
      style={[styles.card, { backgroundColor: color }]}
      {...(onPress ? { onPress, activeOpacity: 0.82 } : {})}
    >
      {iconName && (
        <Ionicons
          name={iconName}
          size={22}
          color={COLORS.textWhite}
          style={styles.icon}
        />
      )}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Container>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 110,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  icon: {
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.textWhite,
    lineHeight: TYPOGRAPHY.xxl * 1.2,
  },
  label: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textWhite,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 2,
  },
})
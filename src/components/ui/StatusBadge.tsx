// ─── StatusBadge.tsx ──────────────────────────────────────────────────────────
// Badge de color para mostrar el estado o prioridad de un reporte.
// Es un componente puramente presentacional: recibe el color ya resuelto
// desde el servicio correspondiente y solo se encarga de renderizarlo.
//
// Las funciones getStatusColor y getPriorityColor viven en services/
// y son quienes calculan el color antes de pasarlo aquí.
//
// Reemplaza badges inline en:
//   HomeAutoridad, HomeEmpleado, ListadoReportes, ReportesPendientes,
//   TodosReportes y ReporteDetalleModal.
//
// USO (el color viene resuelto desde el hook o servicio):
//   const color = getStatusColor(reporte.estReporte)   // desde services/
//   <StatusBadge label="pendiente" color={color} />
//
//   const color = getPriorityColor(reporte.prioReporte) // desde services/
//   <StatusBadge label="alta" color={color} />
//
//   <StatusBadge label="en proceso" color={color} size="sm" />

import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type BadgeSize = 'sm' | 'md'

interface StatusBadgeProps {
  /** Texto visible dentro del badge */
  label: string
  /** Color de fondo ya resuelto por el servicio correspondiente */
  color: string
  /** Tamaño del badge. Default: 'md' */
  size?: BadgeSize
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function StatusBadge({
  label,
  color,
  size = 'md',
}: StatusBadgeProps) {
  return (
    <View style={[
      styles.badge,
      { backgroundColor: color },
      size === 'sm' && styles.badgeSm,
    ]}>
      <Text style={[
        styles.text,
        size === 'sm' && styles.textSm,
      ]}>
        {label}
      </Text>
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },

  badgeSm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },

  text: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  textSm: {
    fontSize: TYPOGRAPHY.xs,
  },
})
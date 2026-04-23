// ─── ReporteCard.tsx ──────────────────────────────────────────────────────────
// Tarjeta de reporte individual. Muestra id, estado, descripción, fecha,
// prioridad y colaborador asignado. Completamente presentacional.
//
// Reemplaza implementaciones en:
//   HomeAutoridad.tsx, HomeDocente.tsx, HomeEmpleado.tsx,
//   ListadoReportes.tsx, TodosReportes.tsx
//
// Los colores de estado y prioridad se reciben ya resueltos desde el hook
// o servicio correspondiente (getStatusColor / getPriorityColor).
//
// USO:
//   const statusColor   = getStatusColor(reporte.estReporte)   // desde service
//   const priorityColor = getPriorityColor(reporte.prioReporte) // desde service
//
//   <ReporteCard
//     id={reporte.idReporte}
//     descripcion={reporte.descriReporte}
//     estado={reporte.estReporte}
//     statusColor={statusColor}
//     fecha={reporte.fecReporte}
//     prioridad={reporte.prioReporte}
//     priorityColor={priorityColor}
//     empleadoNombre="María López"
//     onPress={() => abrirDetalle(reporte)}
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ReporteCardProps {
  /** ID del reporte */
  id: string | number
  /** Descripción del problema */
  descripcion: string
  /** Texto del estado (ej: 'pendiente') */
  estado: string
  /** Color de fondo del badge de estado — resuelto por el servicio */
  statusColor: string
  /** Fecha ISO del reporte */
  fecha: string
  /** Texto de la prioridad (ej: 'alta') */
  prioridad?: string
  /** Color del texto de prioridad — resuelto por el servicio */
  priorityColor?: string
  /** Nombre completo del colaborador asignado (opcional) */
  empleadoNombre?: string
  /** Función ejecutada al presionar la tarjeta */
  onPress: () => void
  /** Función de eliminación (opcional — solo autoridades en TodosReportes) */
  onDelete?: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ReporteCard({
  id,
  descripcion,
  estado,
  statusColor,
  fecha,
  prioridad,
  priorityColor,
  empleadoNombre,
  onPress,
  onDelete,
}: ReporteCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Cabecera: ID + badge de estado */}
      <View style={styles.header}>
        <Text style={styles.id} numberOfLines={1}>#{id}</Text>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{estado}</Text>
          </View>
          {!!onDelete && (
            <TouchableOpacity
              onPress={e => { e.stopPropagation(); onDelete() }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={16} color="#e63946" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Descripción */}
      <Text style={styles.descripcion} numberOfLines={2}>
        {descripcion}
      </Text>

      {/* Footer: fecha + prioridad */}
      <View style={styles.footer}>
        <View style={styles.fechaContainer}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.fecha}>
            {new Date(fecha).toLocaleDateString('es-ES', {
              day: '2-digit', month: 'short',
            })}
          </Text>
        </View>

        {!!prioridad && prioridad !== 'no asignada' && !!priorityColor && (
          <View style={styles.prioridadContainer}>
            <Ionicons name="flag" size={14} color={priorityColor} />
            <Text style={[styles.prioridad, { color: priorityColor }]}>
              {prioridad}
            </Text>
          </View>
        )}
      </View>

      {/* Colaborador asignado */}
      {!!empleadoNombre && (
        <View style={styles.empleadoContainer}>
          <Ionicons name="person" size={14} color={COLORS.primary} />
          <Text style={styles.empleadoText}>
            Solicitado por: {empleadoNombre}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgPrimary,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexShrink: 0,
  },
  id: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    flexShrink: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    flexShrink: 0,
  },
  statusText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    textTransform: 'capitalize',
  },
  descripcion: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  fecha: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  prioridadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  prioridad: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    textTransform: 'capitalize',
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  empleadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFFE',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  empleadoText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.semibold,
  },
})
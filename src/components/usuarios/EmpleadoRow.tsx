// ─── EmpleadoRow.tsx ──────────────────────────────────────────────────────────
// Fila de colaborador con avatar de iniciales, nombre, cargo, departamento
// y barra de progreso de resolución opcional.
//
// Usado por:
//   - PdfPreview.tsx        (lista de colaboradores del departamento)
//   - PdfResumidoPreview.tsx (tabla de colaboradores para autoridad)
//   - ReasignarEmpleado.tsx  (lista de colaboradores en modal de asignación)
//
// Las estadísticas son opcionales — si no se pasan, se muestra solo
// el nombre, cargo y departamento.
//
// USO:
//   <EmpleadoRow
//     nombre="María López"
//     cargo="colaborador"
//     departamento="sistemas"
//     stats={{ total: 12, pendientes: 3, enProceso: 5, resueltos: 4 }}
//   />
//   <EmpleadoRow
//     nombre="Carlos Pérez"
//     cargo="jefe"
//     departamento="mantenimiento"
//     onPress={() => confirmarAsignacion(empleado)}
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EmpleadoStats {
  total:      number
  pendientes: number
  enProceso:  number
  resueltos:  number
}

interface EmpleadoRowProps {
  /** Nombre completo del colaborador */
  nombre: string
  /** Cargo del colaborador (ej: 'jefe', 'colaborador') */
  cargo: string
  /** Departamento del colaborador (ej: 'sistemas', 'mantenimiento') */
  departamento: string
  /** Estadísticas de reportes (opcional) */
  stats?: EmpleadoStats
  /** Mostrar barra de progreso de resolución (requiere stats) */
  mostrarProgreso?: boolean
  /** Si se pasa, la fila es presionable */
  onPress?: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EmpleadoRow({
  nombre,
  cargo,
  departamento,
  stats,
  mostrarProgreso = false,
  onPress,
}: EmpleadoRowProps) {
  const inicial       = nombre.charAt(0).toUpperCase()
  const cargoCapital  = cargo.charAt(0).toUpperCase() + cargo.slice(1)
  const deptCapital   = departamento.charAt(0).toUpperCase() + departamento.slice(1)
  const pctResuelto   = stats && stats.total > 0
    ? Math.round((stats.resueltos / stats.total) * 100)
    : 0

  const Container = onPress ? TouchableOpacity : View

  return (
    <Container
      style={styles.row}
      {...(onPress ? { onPress, activeOpacity: 0.75 } : {})}
    >
      {/* Avatar con inicial */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{inicial}</Text>
      </View>

      {/* Info principal */}
      <View style={styles.info}>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.cargo}>
          {cargoCapital} · {deptCapital}
        </Text>

        {/* Estadísticas mini (opcional) */}
        {!!stats && (
          <View style={styles.statsRow}>
            <View style={[styles.miniStat, { borderLeftColor: '#F59E0B' }]}>
              <Text style={[styles.miniNum, { color: '#F59E0B' }]}>{stats.pendientes}</Text>
              <Text style={styles.miniLbl}>Pend.</Text>
            </View>
            <View style={[styles.miniStat, { borderLeftColor: '#3B82F6' }]}>
              <Text style={[styles.miniNum, { color: '#3B82F6' }]}>{stats.enProceso}</Text>
              <Text style={styles.miniLbl}>Proc.</Text>
            </View>
            <View style={[styles.miniStat, { borderLeftColor: '#22C55E' }]}>
              <Text style={[styles.miniNum, { color: '#22C55E' }]}>{stats.resueltos}</Text>
              <Text style={styles.miniLbl}>Res.</Text>
            </View>
          </View>
        )}

        {/* Barra de progreso (opcional) */}
        {mostrarProgreso && !!stats && (
          <View style={styles.progresoContainer}>
            <View style={styles.progresoBar}>
              <View style={[styles.progresoFill, { width: `${pctResuelto}%` as any }]} />
            </View>
            <Text style={styles.progresoLbl}>{pctResuelto}%</Text>
          </View>
        )}
      </View>

      {/* Total de reportes (si hay stats) */}
      {!!stats && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalNum}>{stats.total}</Text>
          <Text style={styles.totalLbl}>reportes</Text>
        </View>
      )}

      {/* Flecha si es presionable */}
      {!!onPress && (
        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
      )}
    </Container>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: SPACING.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.pdfBlue,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.base,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: '#1F2937',
  },
  cargo: {
    fontSize: TYPOGRAPHY.xs,
    color: '#6B7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  miniStat: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.sm - 2,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderLeftWidth: 2,
  },
  miniNum: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.extrabold,
  },
  miniLbl: {
    fontSize: TYPOGRAPHY.xs - 1,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  progresoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  progresoBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progresoFill: {
    height: 6,
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  progresoLbl: {
    fontSize: TYPOGRAPHY.xs,
    color: '#6B7280',
    width: 30,
    textAlign: 'right',
  },
  totalContainer: {
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  totalNum: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.pdfBlue,
  },
  totalLbl: {
    fontSize: TYPOGRAPHY.xs - 1,
    color: '#9CA3AF',
  },
})
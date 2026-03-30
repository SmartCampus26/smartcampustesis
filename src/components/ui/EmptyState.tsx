// ─── EmptyState.tsx ───────────────────────────────────────────────────────────
// Estado vacío genérico con ícono, texto principal, subtexto y acción opcional.
//
// Reemplaza implementaciones propias en:
//   HomeAutoridad, HomeDocente, HomeEmpleado, ListadoReportes,
//   TodosReportes, ReportesPendientes, Buscador y ReasignarEmpleado.
//
// USO:
//   <EmptyState
//     icon="document-text-outline"
//     title="No tienes reportes aún"
//     subtitle="Crea tu primer reporte para comenzar"
//   />
//   <EmptyState
//     icon="search"
//     title="No se encontraron resultados"
//     subtitle="Intenta con otros términos de búsqueda"
//     actionLabel="Limpiar búsqueda"
//     onAction={() => setBusqueda('')}
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Ícono de Ionicons centrado en la parte superior */
  icon: React.ComponentProps<typeof Ionicons>['name']
  /** Texto principal en grande */
  title: string
  /** Texto descriptivo secundario */
  subtitle?: string
  /** Texto del botón de acción (opcional) */
  actionLabel?: string
  /** Función ejecutada al presionar el botón de acción */
  onAction?: () => void
  /** Color del ícono. Default: gris claro */
  iconColor?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  iconColor = '#E1E8ED',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* Ícono decorativo */}
      <Ionicons name={icon} size={64} color={iconColor} />

      {/* Texto principal */}
      <Text style={styles.title}>{title}</Text>

      {/* Subtexto descriptivo */}
      {!!subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}

      {/* Botón de acción opcional */}
      {!!actionLabel && !!onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.lg,
  },

  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },

  subtitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },

  // Botón de acción con color primario
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },

  actionText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
  },
})
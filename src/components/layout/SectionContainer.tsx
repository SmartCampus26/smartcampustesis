// ─── SectionContainer.tsx ─────────────────────────────────────────────────────
// Contenedor de sección con título, acción opcional a la derecha y children.
// Elimina el patrón repetido de sectionHeader + sectionTitle + verTodos
// que aparecía en HomeAutoridad y HomeDocente.
//
// USO:
//   <SectionContainer title="Reportes Recientes" actionLabel="Ver todos →" onAction={() => router.push('/ListadoReportes')}>
//     {reportes.map(...)}
//   </SectionContainer>
//
//   <SectionContainer title="Mis Tareas">
//     {tareas.map(...)}
//   </SectionContainer>

import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SectionContainerProps {
  /** Título de la sección */
  title: string
  /** Texto del enlace de acción a la derecha del título (opcional) */
  actionLabel?: string
  /** Función ejecutada al presionar la acción (opcional) */
  onAction?: () => void
  /** Contenido de la sección */
  children: React.ReactNode
  /** Padding horizontal adicional. Default: true */
  padded?: boolean
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SectionContainer({
  title,
  actionLabel,
  onAction,
  children,
  padded = true,
}: SectionContainerProps) {
  return (
    <View style={[styles.container, padded && styles.padded]}>
      {/* Header: solo se renderiza si hay título */}
      {!!title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {!!actionLabel && !!onAction && (
            <TouchableOpacity onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.action}>{actionLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Contenido */}
      {children}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  padded: {
    paddingHorizontal: SPACING.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  action: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.semibold,
  },
})
// ─── ListHeader.tsx ───────────────────────────────────────────────────────────
// Header con fondo navy, título y subtítulo para pantallas de listado de personal.
// Encapsula el estilo del encabezado del Buscador (ListadoMaxAutoridad).
//
// USO:
//   <ListHeader title="Listado de Personal" subtitle="Total: 42 personas" />

import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ListHeaderProps {
  /** Título principal */
  title: string
  /** Subtítulo informativo (ej: total de registros) */
  subtitle?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ListHeader({ title, subtitle }: ListHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.navy,
    padding: SPACING.xl,
    paddingTop: SPACING.base,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
  },
})
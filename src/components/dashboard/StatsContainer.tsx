// ─── StatsContainer.tsx ───────────────────────────────────────────────────────
// Contenedor vertical para los StatCard del dashboard.
// Elimina el View con estilos inline que aparecía en HomeAutoridad y HomeDocente.
//
// USO:
//   <StatsContainer>
//     <StatCard ... />
//     <StatCard ... />
//   </StatsContainer>

import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { SPACING } from '../../styles/tokens'

interface StatsContainerProps {
  children: React.ReactNode
  /** Si true, muestra los stats en fila horizontal (default: columna) */
  row?: boolean
}

export default function StatsContainer({ children, row = false }: StatsContainerProps) {
  return <View style={[styles.container, row && styles.row]}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.base,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
  },
})
// ─── PdfSectionCard.tsx ───────────────────────────────────────────────────────
// Sección composable para pantallas de informes PDF.
// Elimina el patrón seccion / seccionTitulo que se repetía en las tres
// pantallas PDF (PdfPreview, PdfResumidoPreview, PdfPersonalPreview).
//
// Se usa dentro de PdfLayout como slot:
//   <PdfLayout ...>
//     <PdfSectionCard title="Todos los colaboradores">
//       {empleados.map(...)}
//     </PdfSectionCard>
//     <PdfSectionCard title="Análisis estadístico">
//       <GraficosPie ... />
//     </PdfSectionCard>
//   </PdfLayout>

import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PdfSectionCardProps {
  /** Título de la sección en mayúsculas pequeñas */
  title: string
  /** Contenido de la sección */
  children: React.ReactNode
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PdfSectionCard({ title, children }: PdfSectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: '#1E3A5F',
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
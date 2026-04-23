// ─── LoadingScreen.tsx ────────────────────────────────────────────────────────
// Pantalla de carga centrada con spinner y texto opcional.
// Reemplaza el bloque `if (cargando) return (...)` repetido en:
//   HomeAutoridad, HomeDocente, HomeEmpleado, ListadoReportes,
//   TodosReportes, ReportesPendientes, Buscador, ReasignarEmpleado,
//   PdfPreview, PdfResumidoPreview, PdfPersonalPreview.
//
// USO:
//   if (cargando) return <LoadingScreen />
//   if (cargando) return <LoadingScreen text="Cargando reportes..." color="#1DCDFE" />

import * as React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface LoadingScreenProps {
  /** Texto mostrado debajo del spinner. Default: ninguno */
  text?: string
  /** Color del spinner. Default: primary teal */
  color?: string
  /** Color del fondo. Default: bgSecondary */
  backgroundColor?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LoadingScreen({
  text,
  color = COLORS.primary,
  backgroundColor = COLORS.bgSecondary,
}: LoadingScreenProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size="large" color={color} />
      {!!text && <Text style={styles.text}>{text}</Text>}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
})
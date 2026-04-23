// ─── PdfDownloadButton.tsx ────────────────────────────────────────────────────
// Botón de descarga de PDF con estado de generación y cancelación.
// Maneja los tres estados visuales:
//   - Normal:    botón azul con ícono de descarga
//   - Generando: indicador de progreso + botón cancelar
//   - Deshabilitado: sin datos suficientes para generar
//
// Usado en PdfLayout, que lo renderiza en el footer de cada pantalla PDF.
//
// USO:
//   <PdfDownloadButton
//     label="Descargar PDF General"
//     generando={generando}
//     puedeDescargar={stats.total > 0}
//     onDescargar={handleDescargar}
//     onCancelar={cancelar}
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PdfDownloadButtonProps {
  /** Texto del botón principal. Ej: "Descargar PDF General" */
  label: string
  /** Muestra el estado de generación en curso */
  generando: boolean
  /** Si es false, el botón aparece deshabilitado */
  puedeDescargar: boolean
  /** Acción al presionar el botón de descarga */
  onDescargar: () => void
  /** Acción al presionar el botón de cancelar (visible solo durante generando) */
  onCancelar: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PdfDownloadButton({
  label,
  generando,
  puedeDescargar,
  onDescargar,
  onCancelar,
}: PdfDownloadButtonProps) {
  // ── Estado: generando ────────────────────────────────────────────────────
  if (generando) {
    return (
      <View style={styles.generandoRow}>
        <View style={styles.generandoInfo}>
          <ActivityIndicator size="small" color={COLORS.pdfBlue} />
          <Text style={styles.generandoText}>Generando PDF...</Text>
        </View>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancelar}>
          <Ionicons name="close-circle-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Estado: deshabilitado ────────────────────────────────────────────────
  if (!puedeDescargar) {
    return (
      <TouchableOpacity style={styles.btnDisabled} disabled>
        <Ionicons name="document-text-outline" size={18} color={COLORS.textMuted} />
        <Text style={styles.btnDisabledText}>Sin datos para generar</Text>
      </TouchableOpacity>
    )
  }

  // ── Estado: normal ───────────────────────────────────────────────────────
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onDescargar}
      activeOpacity={0.85}
    >
      <Ionicons name="download-outline" size={20} color={COLORS.textWhite} />
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Estado normal
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.pdfBlue,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xl,
  },
  btnText: {
    color: COLORS.textWhite,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
  },

  // Estado deshabilitado
  btnDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xl,
  },
  btnDisabledText: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
  },

  // Estado generando
  generandoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.pdfBlueLight,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  generandoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  generandoText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.pdfBlue,
    fontWeight: TYPOGRAPHY.semibold,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },
})
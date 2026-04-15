// ─── PdfButtonRow.tsx ─────────────────────────────────────────────────────────
// Fila de botones de acceso a PDFs en HomeEmpleado.
// Pertenece al dominio PDF — ubicado en components/pdf/.
// Muestra el botón "Mi PDF" siempre y "PDF General" solo para jefes.
//
// USO:
//   <PdfButtonRow
//     onPdfPersonal={abrirPdfPersonal}
//     mostrarGeneral={mostrarBtnGeneral}
//     verificandoAcceso={verificandoAcceso}
//     onPdfGeneral={() => router.push('/PdfPreview')}
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

interface PdfButtonRowProps {
  onPdfPersonal:     () => void
  mostrarGeneral:    boolean
  verificandoAcceso: boolean
  onPdfGeneral?:     () => void
}

export default function PdfButtonRow({
  onPdfPersonal,
  mostrarGeneral,
  verificandoAcceso,
  onPdfGeneral,
}: PdfButtonRowProps) {
  const mostrarDos = !verificandoAcceso && mostrarGeneral

  return (
    <View style={[styles.row, mostrarDos && styles.rowDoble]}>
      <TouchableOpacity
        style={[styles.btn, styles.btnPersonal, mostrarDos && styles.btnFlex]}
        onPress={onPdfPersonal}
        activeOpacity={0.85}
      >
        <Ionicons name="document-text-outline" size={18} color={COLORS.textWhite} />
        <Text style={styles.btnText}>Mi PDF</Text>
      </TouchableOpacity>

      {mostrarDos && (
        <TouchableOpacity
          style={[styles.btn, styles.btnGeneral, styles.btnFlex]}
          onPress={onPdfGeneral}
          activeOpacity={0.85}
        >
          <Ionicons name="people-outline" size={18} color={COLORS.textWhite} />
          <Text style={styles.btnText}>PDF General</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: SPACING.base,
    paddingTop:        SPACING.md,
    paddingBottom:     SPACING.xs,
    backgroundColor:   COLORS.bgSecondary,
  },
  rowDoble: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  btn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.xs,
    borderRadius:   RADIUS.md,
    paddingVertical: SPACING.md,
  },
  btnFlex:     { flex: 1 },
  btnPersonal: { backgroundColor: '#FF5252' },
  btnGeneral:  { backgroundColor: COLORS.pdfBlue },
  btnText: {
    color:      COLORS.textWhite,
    fontSize:   TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
})
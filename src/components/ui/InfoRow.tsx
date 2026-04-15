// ─── InfoRow.tsx ─────────────────────────────────────────────────────────────
// Fila de información con ícono + label + valor.
// Reutilizable en cualquier vista que muestre datos de un usuario o empleado.
//
// USO:
//   <InfoRow icon="mail-outline" label="Correo" value="usuario@mail.com" />
//   <InfoRow icon="briefcase-outline" label="Cargo" value="Docente" />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

interface InfoRowProps {
  icon:  React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: string
  /** Estilos del contenedor padre (ej: profileStyles.infoRow) — opcional */
  containerStyle?: object
  labelStyle?:     object
  valueStyle?:     object
}

export default function InfoRow({ icon, label, value, containerStyle, labelStyle, valueStyle }: InfoRowProps) {
  return (
    <View style={[s.row, containerStyle]}>
      <Ionicons name={icon} size={20} color={COLORS.navy} />
      <View style={s.text}>
        <Text style={[s.label, labelStyle]}>{label}</Text>
        <Text style={[s.value, valueStyle]}>{value}</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md },
  text:  { marginLeft: SPACING.md, flex: 1 },
  label: { fontSize: TYPOGRAPHY.sm,  color: COLORS.textSecondary, marginBottom: 3 },
  value: { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary,  fontWeight: '500' },
})
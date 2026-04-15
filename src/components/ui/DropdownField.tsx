// ─── DropdownField.tsx ────────────────────────────────────────────────────────
// Selector tipo dropdown que muestra/oculta una lista de opciones al tocar.
// Usado en CrearReporte para Tipo de Aula.

import * as React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../styles/tokens'

interface Opcion { label: string; value: string }

interface DropdownFieldProps {
  label:       string
  placeholder: string
  options:     Opcion[]
  value:       string
  onChange:    (v: string) => void
}

export default function DropdownField({ label, placeholder, options, value, onChange }: DropdownFieldProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <View style={s.wrapper}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={s.trigger} onPress={() => setOpen(v => !v)}>
        <Text style={value ? s.triggerTexto : s.triggerPlaceholder}>{value || placeholder}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {open && (
        <View style={s.opciones}>
          {options.map((op, i) => (
            <TouchableOpacity
              key={op.value}
              style={[s.opcion, value === op.value && s.opcionActiva, i < options.length - 1 && s.opcionDivider]}
              onPress={() => { onChange(op.value); setOpen(false) }}
            >
              <Text style={[s.opcionTexto, value === op.value && s.opcionTextoActivo]}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  wrapper:            { gap: SPACING.xs },
  label:              { fontSize: TYPOGRAPHY.md, fontWeight: '600', color: COLORS.textPrimary },
  trigger:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.bgPrimary, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  triggerTexto:       { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary },
  triggerPlaceholder: { fontSize: TYPOGRAPHY.base, color: COLORS.textSecondary },
  opciones:           { backgroundColor: COLORS.bgPrimary, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', marginTop: 4 },
  opcion:             { padding: SPACING.md, backgroundColor: COLORS.bgPrimary },
  opcionActiva:       { backgroundColor: COLORS.primaryLight },
  opcionDivider:      { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  opcionTexto:        { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary },
  opcionTextoActivo:  { color: COLORS.primary, fontWeight: '600' },
})
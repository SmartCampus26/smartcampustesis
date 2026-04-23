// ─── ListSelector.tsx ─────────────────────────────────────────────────────────
// Lista vertical de opciones seleccionables con ícono opcional.
// Al tocar una opción se resalta con color primario.
// Usada en CrearReporte para Categoría del Objeto y Lugar.

import * as React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../styles/tokens'

interface Opcion {
  label: string
  value: string
  icon?: React.ComponentProps<typeof Ionicons>['name']
}

interface ListSelectorProps {
  label:    string
  options:  Opcion[]
  value:    string
  onChange: (v: string) => void
}

export default function ListSelector({ label, options, value, onChange }: ListSelectorProps) {
  return (
    <View style={s.wrapper}>
      <Text style={s.label}>{label}</Text>
      <View style={s.lista}>
        {options.map((op, i) => (
          <TouchableOpacity
            key={op.value}
            style={[s.fila, value === op.value && s.filaActiva, i < options.length - 1 && s.filaDivider]}
            onPress={() => onChange(op.value)}
          >
            {op.icon && (
              <Ionicons name={op.icon} size={18} color={value === op.value ? COLORS.primary : COLORS.textSecondary} />
            )}
            <Text style={[s.texto, value === op.value && s.textoActivo]}>{op.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrapper:      { gap: SPACING.xs },
  label:        { fontSize: TYPOGRAPHY.md, fontWeight: '600', color: COLORS.textPrimary },
  lista:        { borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  fila:         { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: COLORS.bgPrimary },
  filaActiva:   { backgroundColor: COLORS.primaryLight },
  filaDivider:  { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  texto:        { fontSize: TYPOGRAPHY.base, color: COLORS.textPrimary, flex: 1 },
  textoActivo:  { color: COLORS.primary, fontWeight: '600' },
})
// ─── OptionSelector.tsx ───────────────────────────────────────────────────────
// Selector de opción única de entre un conjunto de opciones.
// Solo una opción puede estar activa a la vez (selección exclusiva).
//
// Reemplaza:
//   - Selector de rol (docente/autoridad) en UsuarioNuevo.tsx
//   - Selector de departamento/cargo en EmpleadoNuevo.tsx
//   - Selector de departamento responsable en CrearReporte.tsx
//
// USO:
//   <OptionSelector
//     label="Rol del Usuario *"
//     options={[
//       { value: 'docente',    label: 'Docente',      icon: 'school' },
//       { value: 'autoridad',  label: 'Coordinador',  icon: 'shield-checkmark' },
//     ]}
//     value={rolSeleccionado}
//     onChange={setRolSeleccionado}
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Option {
  /** Valor interno de la opción (lo que se guarda en el estado) */
  value: string
  /** Texto visible en el botón */
  label: string
  /** Ícono de Ionicons (opcional) */
  icon?: React.ComponentProps<typeof Ionicons>['name']
}

interface OptionSelectorProps {
  /** Label descriptivo mostrado arriba del selector */
  label?: string
  /** Lista de opciones disponibles */
  options: Option[]
  /** Valor actualmente seleccionado */
  value: string
  /** Función llamada cuando el usuario selecciona una opción */
  onChange: (value: string) => void
  /** Color del fondo del botón activo. Default: primary teal */
  activeColor?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OptionSelector({
  label,
  options,
  value,
  onChange,
  activeColor = COLORS.primary,
}: OptionSelectorProps) {
  return (
    <View style={styles.container}>
      {/* Label opcional */}
      {!!label && <Text style={styles.label}>{label}</Text>}

      {/* Fila de botones */}
      <View style={styles.row}>
        {options.map((option) => {
          const isActive = value === option.value
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isActive && { backgroundColor: activeColor, borderColor: activeColor },
              ]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.8}
            >
              {/* Ícono opcional */}
              {option.icon && (
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={isActive ? COLORS.textWhite : COLORS.textPrimary}
                />
              )}

              {/* Texto de la opción */}
              <Text style={[
                styles.optionText,
                isActive && styles.optionTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },

  label: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  // Fila horizontal de botones
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  // Botón individual de opción
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  optionText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Texto cuando la opción está activa
  optionTextActive: {
    color: COLORS.textWhite,
  },
})
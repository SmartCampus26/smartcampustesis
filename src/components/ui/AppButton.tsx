// ─── AppButton.tsx ────────────────────────────────────────────────────────────
// Botón unificado de SmartCampus con tres variantes visuales.
// Reemplaza: submitButton, cancelButton, loginButton, btnDescargar, reassignButton
// y todas sus variantes duplicadas en el proyecto actual.
//
// USO:
//   <AppButton label="Crear Reporte" onPress={handleCrear} />
//   <AppButton label="Cancelar" variant="secondary" onPress={handleCancelar} />
//   <AppButton label="Eliminar" variant="danger" onPress={handleEliminar} />
//   <AppButton label="Guardando..." loading onPress={handleGuardar} />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Variantes visuales disponibles para el botón */
type ButtonVariant = 'primary' | 'secondary' | 'danger'

interface AppButtonProps {
  /** Texto visible dentro del botón */
  label: string
  /** Función ejecutada al presionar */
  onPress: () => void
  /** Variante visual. Default: 'primary' */
  variant?: ButtonVariant
  /** Muestra spinner y deshabilita el botón cuando es true */
  loading?: boolean
  /** Deshabilita el botón sin mostrar spinner */
  disabled?: boolean
  /** Nombre del ícono de Ionicons (opcional) */
  icon?: React.ComponentProps<typeof Ionicons>['name']
  /** Ocupa el ancho completo del contenedor. Default: true */
  fullWidth?: boolean
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
}: AppButtonProps) {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        !fullWidth && styles.inline,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        // Estado de carga: spinner centrado
        <ActivityIndicator
          color={variant === 'secondary' ? COLORS.textPrimary : COLORS.textWhite}
        />
      ) : (
        // Estado normal: ícono opcional + texto
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={variant === 'secondary' ? COLORS.textPrimary : COLORS.textWhite}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, styles[`label_${variant}`]]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Base compartida por todas las variantes
  base: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },

  // Variante primaria — teal sólido con sombra
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.primary,
  },

  // Variante secundaria — borde con fondo blanco
  secondary: {
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  // Variante peligro — rojo para acciones destructivas
  danger: {
    backgroundColor: '#E63946',
    ...SHADOWS.md,
  },

  // Estado deshabilitado aplicado sobre cualquier variante
  disabled: {
    opacity: 0.5,
    ...SHADOWS.sm,
  },

  // Botón inline (no ocupa todo el ancho)
  inline: {
    alignSelf: 'flex-start',
  },

  // Contenedor interno de ícono + texto
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  icon: {
    marginRight: 2,
  },

  // Textos por variante
  label: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
  },
  label_primary: {
    color: COLORS.textWhite,
  },
  label_secondary: {
    color: COLORS.textPrimary,
  },
  label_danger: {
    color: COLORS.textWhite,
  },
})
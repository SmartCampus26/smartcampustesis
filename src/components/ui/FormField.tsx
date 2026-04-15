// ─── FormField.tsx ────────────────────────────────────────────────────────────
// Campo de formulario reutilizable con label, ícono izquierdo, input y
// toggle opcional de visibilidad para contraseñas.
//
// Reemplaza:
//   - Componente local `Campo` en UsuarioNuevo.tsx
//   - Componente local `CampoTexto` en ContraseniaOlvidada.tsx
//   - Inputs repetidos en index.tsx (login) y EmpleadoNuevo.tsx
//
// USO:
//   <FormField
//     label="Correo electrónico"
//     placeholder="ejemplo@correo.com"
//     value={correo}
//     onChangeText={setCorreo}
//     icon="mail-outline"
//     keyboardType="email-address"
//   />
//   <FormField
//     label="Contraseña"
//     placeholder="Mínimo 6 caracteres"
//     value={contrasena}
//     onChangeText={setContrasena}
//     icon="lock-closed-outline"
//     isPassword
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { useState } from 'react'
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FormFieldProps {
  /** Texto del label superior */
  label: string
  /** Placeholder del input */
  placeholder: string
  /** Valor controlado del input */
  value: string
  /** Función de actualización del valor */
  onChangeText: (text: string) => void
  /** Nombre del ícono de Ionicons mostrado a la izquierda */
  icon: React.ComponentProps<typeof Ionicons>['name']
  /** Activa el toggle de visibilidad y oculta el texto por defecto */
  isPassword?: boolean
  /** Tipo de teclado. Default: 'default' */
  keyboardType?: KeyboardTypeOptions
  /** Comportamiento de capitalización. Default: 'none' */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  /** Mensaje de error mostrado debajo del input */
  error?: string | null
  /** Longitud máxima permitida */
  maxLength?: number
  /** Número de líneas para input multiline */
  numberOfLines?: number
  /** Permite múltiples líneas de texto */
  multiline?: boolean
  /** Deshabilita el input */
  editable?: boolean
  /** Muestra botón X para limpiar el campo (útil en búsquedas) */
  onClear?: () => void
  /** Oculta el label superior (útil en barras de búsqueda) */
  hideLabel?: boolean
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  maxLength,
  editable = true,
  onClear,
  hideLabel = false,
  multiline = false,
  numberOfLines = 1,
}: FormFieldProps) {
  // Controla si la contraseña es visible o no
  const [secureText, setSecureText] = useState(isPassword)
  // Resalta el borde cuando el campo tiene foco
  const [focused, setFocused] = useState(false)

  return (
    <View style={[styles.container, hideLabel && styles.containerSearch]}>
      {/* Label superior — oculto en modo búsqueda */}
      {!hideLabel && <Text style={styles.label}>{label}</Text>}

      {/* Contenedor del input con borde dinámico */}
      <View style={[
        styles.inputWrapper,
        hideLabel && styles.inputWrapperSearch,
        focused && styles.inputWrapperFocused,
        !!error && styles.inputWrapperError,
      ]}>
        {/* Ícono izquierdo */}
        <Ionicons
          name={icon}
          size={20}
          color={error ? COLORS.error : COLORS.textSecondary}
          style={styles.icon}
        />

        {/* Input de texto */}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {/* Botón limpiar — solo en modo búsqueda con texto */}
        {!!onClear && !!value && (
          <TouchableOpacity onPress={onClear} style={styles.eyeButton}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Toggle de visibilidad — solo para campos de contraseña */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setSecureText(prev => !prev)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={secureText ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Mensaje de error inline — solo si existe */}
      {!!error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.base,
  },

  // Modo búsqueda — margen superior adicional para separarse del header
  containerSearch: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },

  label: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  // Wrapper del input con ícono y toggle
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: SPACING.base,
  },

  // Modo búsqueda — fondo blanco con borde gris visible, sin label
  inputWrapperSearch: {
    backgroundColor: COLORS.bgPrimary,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  // Estado con foco — resalta el borde en teal
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.bgPrimary,
  },

  // Estado con error — resalta el borde en rojo
  inputWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF0F0',
  },

  icon: {
    marginRight: SPACING.md,
  },

  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
  },

  inputMultiline: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },

  eyeButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },

  errorText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
})
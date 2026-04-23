// ─── FormLayout.tsx ───────────────────────────────────────────────────────────
// Layout base para pantallas de formulario con header de ícono/título/subtítulo,
// KeyboardAvoidingView y ScrollView preconfigurados.
//
// Reemplaza la estructura repetida en:
//   UsuarioNuevo.tsx, EmpleadoNuevo.tsx
//
// USO:
//   <FormLayout
//     icon="person-add"
//     iconColor="#1DCDFE"
//     title="Nuevo Usuario"
//     subtitle="Completa la información del docente o coordinador"
//   >
//     {/* Campos del formulario */}
//   </FormLayout>

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FormLayoutProps {
  /** Ícono de Ionicons centrado en el header */
  icon: React.ComponentProps<typeof Ionicons>['name']
  /** Color del ícono. Default: primary teal */
  iconColor?: string
  /** Título principal del formulario */
  title: string
  /** Subtítulo descriptivo */
  subtitle?: string
  /** Campos y botones del formulario */
  children: React.ReactNode
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FormLayout({
  icon,
  iconColor = COLORS.primary,
  title,
  subtitle,
  children,
}: FormLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header: ícono + título + subtítulo */}
        <View style={styles.header}>
          <Ionicons name={icon} size={50} color={iconColor} />
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>

        {/* Contenido del formulario */}
        <View style={styles.form}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgTertiary,
  },

  scrollContent: {
    flexGrow: 1,
  },

  // Header con ícono centrado
  header: {
    backgroundColor: COLORS.bgPrimary,
    padding: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  title: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },

  // Contenedor del formulario con padding uniforme
  form: {
    padding: SPACING.lg,
  },
})
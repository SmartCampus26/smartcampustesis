// ─── HomeHeader.tsx ───────────────────────────────────────────────────────────
// Header de bienvenida compartido por HomeAutoridad, HomeDocente y HomeEmpleado.
// Muestra el saludo "¡Hola!" y el nombre del usuario sobre un fondo configurable.
//
// Reemplaza la sección de header en:
//   HomeAutoridad.tsx, HomeDocente.tsx, HomeEmpleado.tsx
//
// USO:
//   <HomeHeader nombre="María López" />
//   <HomeHeader nombre="Juan Pérez" backgroundColor="#2F455C" />

import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface HomeHeaderProps {
  /** Nombre del usuario autenticado */
  nombre: string
  /** Color de fondo del header. Default: navy */
  backgroundColor?: string
  /** Contenido adicional renderizado a la derecha del saludo (ej. botón de PDF) */
  rightContent?: React.ReactNode
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HomeHeader({
  nombre,
  backgroundColor = COLORS.navy,
  rightContent,
}: HomeHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      {/* Bloque de saludo */}
      <View style={styles.textBlock}>
        <Text style={styles.greeting}>¡Hola!</Text>
        <Text style={styles.nombre} numberOfLines={1}>{nombre}</Text>
      </View>

      {/* Contenido opcional a la derecha (botón PDF, ícono, etc.) */}
      {rightContent && (
        <View style={styles.right}>
          {rightContent}
        </View>
      )}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textBlock: {
    flex: 1,
  },

  greeting: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textWhite,
    opacity: 0.8,
  },

  nombre: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    marginTop: SPACING.xs,
  },

  right: {
    marginLeft: SPACING.base,
  },
})
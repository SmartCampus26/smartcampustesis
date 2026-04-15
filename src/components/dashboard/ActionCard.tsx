// ─── ActionCard.tsx ───────────────────────────────────────────────────────────
// Tarjeta de acción destacada con ícono circular, título, subtítulo y flecha.
// Reemplaza el patrón createBtn / createIcon que se repetía en los tres homes.
//
// Reglas:
//   - Sin imports de services
//   - Sin estado propio
//   - Solo props + render + estilos con tokens
//
// USO:
//   <ActionCard
//     title="Crear Nuevo Reporte"
//     subtitle="Reporta un problema o solicitud"
//     iconName="add"
//     iconColor="#1DCDFE"
//     onPress={handleCrearReporte}
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ActionCardProps {
  title:     string
  subtitle:  string
  iconName:  React.ComponentProps<typeof Ionicons>['name']
  iconColor?: string
  onPress:   () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ActionCard({
  title,
  subtitle,
  iconName,
  iconColor = COLORS.primary,
  onPress,
}: ActionCardProps) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[s.iconCircle, { backgroundColor: iconColor }]}>
        <Ionicons name={iconName} size={28} color={COLORS.textWhite} />
      </View>
      <View style={s.textBlock}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={iconColor} />
    </TouchableOpacity>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
    shadowColor: COLORS.accent,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.base,
    flexShrink: 0,
  },
  textBlock: { flex: 1 },
  title:     { fontSize: TYPOGRAPHY.base, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary, marginBottom: 2 },
  subtitle:  { fontSize: TYPOGRAPHY.sm,   color: COLORS.textSecondary },
})
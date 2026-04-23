// ─── SectionCard.tsx ──────────────────────────────────────────────────────────
// Tarjeta con ícono + título en el header y children en el cuerpo.
// Usada en CrearReporte para agrupar secciones visuales (Fotos, Objeto, Ubicación).

import * as React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../styles/tokens'

interface SectionCardProps {
  icon:     React.ComponentProps<typeof Ionicons>['name']
  title:    string
  children: React.ReactNode
}

export default function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <View style={s.card}>
      <View style={s.header}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={s.title}>{title}</Text>
      </View>
      <View style={s.body}>{children}</View>
    </View>
  )
}

const s = StyleSheet.create({
  card:   { backgroundColor: COLORS.bgPrimary, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.md, gap: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title:  { fontSize: TYPOGRAPHY.lg, fontWeight: '700', color: COLORS.textPrimary },
  body:   { gap: SPACING.md },
})
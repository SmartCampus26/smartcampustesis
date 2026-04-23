// ─── TipCard.tsx ──────────────────────────────────────────────────────────────
// Tarjeta informativa tipo "consejo del día" con borde izquierdo naranja,
// fondo amarillo claro, ícono de bombilla y texto libre.
// Usada en HomeAutoridad y HomeDocente al final del contenido.
//
// USO:
//   <TipCard text="Proporciona la mayor cantidad de detalles al crear un reporte." />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

interface TipCardProps {
  text: string
}

export default function TipCard({ text }: TipCardProps) {
  return (
    <View style={styles.card}>
      <Ionicons name="bulb" size={20} color="#FFA726" style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.titulo}>Consejo del día</Text>
        <Text style={styles.texto}>{text}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    gap: SPACING.sm,
  },
  icon: {
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  titulo: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: '#2F455C',
    marginBottom: SPACING.xs,
  },
  texto: {
    fontSize: TYPOGRAPHY.sm,
    color: '#2F455C',
    lineHeight: 20,
  },
})
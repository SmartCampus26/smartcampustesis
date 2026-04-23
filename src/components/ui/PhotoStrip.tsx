// ─── PhotoStrip.tsx ───────────────────────────────────────────────────────────
// Muestra miniaturas de las fotos ya tomadas.
// Acepta SavedPhoto[] del SavedContext — usa .uri para la imagen.
// Si no hay fotos no renderiza nada.

import * as React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { SPACING, RADIUS } from '../../styles/tokens'

interface SavedPhoto { uri: string; [key: string]: any }
interface PhotoStripProps { fotos: SavedPhoto[] }

export default function PhotoStrip({ fotos }: PhotoStripProps) {
  if (!fotos.length) return null
  return (
    <View style={s.row}>
      {fotos.map((foto, i) => <Image key={i} source={{ uri: foto.uri }} style={s.thumb} />)}
    </View>
  )
}

const s = StyleSheet.create({
  row:   { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  thumb: { width: 64, height: 64, borderRadius: RADIUS.sm },
})
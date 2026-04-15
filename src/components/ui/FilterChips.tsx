// ─── FilterChips.tsx ──────────────────────────────────────────────────────────
// Fila horizontal de chips de filtro con selección exclusiva.
// Elimina el patrón de ScrollView horizontal con chips que se repetía
// en TodosReportes y ListadoReportes.
//
// USO:
//   <FilterChips
//     chips={[
//       { key: 'todos',     label: 'Todos' },
//       { key: 'pendiente', label: '⏳ Pendiente', dotColor: '#FFA726' },
//       { key: 'resuelto',  label: '✅ Resuelto',  dotColor: '#66BB6A' },
//     ]}
//     selected={filtroActivo}
//     onSelect={setFiltroActivo}
//   />
//
//   // Con divisor entre grupos de chips:
//   <FilterChips chips={chipsPrimerGrupo} selected={filtro} onSelect={setFiltro} />
//   <FilterChipsDivider />
//   <FilterChips chips={chipsSegundoGrupo} selected={filtro} onSelect={setFiltro} />

import * as React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ChipOption {
  /** Valor interno del chip (lo que se guarda en el estado) */
  key: string
  /** Texto visible en el chip */
  label: string
  /** Punto de color opcional a la izquierda del texto */
  dotColor?: string
  /** Ícono de Ionicons opcional (se renderiza antes del texto) */
  icon?: React.ReactNode
}

interface FilterChipsProps {
  /** Lista de opciones disponibles */
  chips: ChipOption[]
  /** Chip actualmente seleccionado */
  selected: string
  /** Función llamada al seleccionar un chip */
  onSelect: (key: string) => void
  /** Muestra el ScrollView horizontal. Default: true */
  horizontal?: boolean
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FilterChips({
  chips,
  selected,
  onSelect,
  horizontal = true,
}: FilterChipsProps) {
  const content = (
    <View style={[styles.row, !horizontal && styles.wrap]}>
      {chips.map(chip => {
        const isActive = selected === chip.key
        return (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(chip.key)}
            activeOpacity={0.75}
          >
            {/* Punto de color opcional */}
            {!!chip.dotColor && (
              <View style={[styles.dot, { backgroundColor: chip.dotColor }]} />
            )}
            {/* Ícono opcional */}
            {chip.icon}
            {/* Texto */}
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )

  if (!horizontal) return content

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      {content}
    </ScrollView>
  )
}

// ─── Divisor entre grupos ─────────────────────────────────────────────────────

/**
 * Divisor vertical para separar grupos de chips dentro del mismo ScrollView.
 * Se usa cuando hay dos categorías de filtro en la misma fila (ej: rol + estado).
 */
export function FilterChipsDivider() {
  return <View style={styles.divider} />
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    height: 48,
    marginBottom: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  wrap: {
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 1,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  chipTextActive: {
    color: COLORS.textWhite,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.xs,
  },
})
// ─── PdfStatsGrid.tsx ─────────────────────────────────────────────────────────
// Grilla de estadísticas + gráficos para pantallas de previsualización PDF.
// Muestra: 4 stat cards + gráfico de pastel (por estado) + barras (por prioridad).
// Toda la lógica de gráficos vive aquí — las vistas no saben nada de SVG.
//
// USO:
//   <PdfStatsGrid stats={stats} reportes={reportes} />
//   <PdfStatsGrid stats={stats} />  ← sin gráficos si no se pasan reportes

import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'
import { Reporte } from '../../types/Database'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PdfStats {
  total:      number
  pendientes: number
  enProceso:  number
  resueltos:  number
}

interface PdfStatsGridProps {
  stats:     PdfStats
  reportes?: Reporte[]
}

// ─── Colores de gráficos ──────────────────────────────────────────────────────

const C = {
  pendiente: '#FFA726',
  enProceso: '#42A5F5',
  resuelto:  '#66BB6A',
  alta:      '#EF4444',
  media:     '#F59E0B',
  baja:      '#6366F1',
}

// ─── Gráfico pastel por estado ────────────────────────────────────────────────

function GraficoPie({ pendientes, enProceso, resueltos }: {
  pendientes: number; enProceso: number; resueltos: number
}) {
  const total = pendientes + enProceso + resueltos
  const S = 130, cx = S / 2, cy = S / 2, r = S * 0.38

  if (total === 0) return (
    <Svg width={S} height={S}>
      <Circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />
      <SvgText x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill="#9ca3af">Sin datos</SvgText>
    </Svg>
  )

  const datos = [
    { valor: pendientes, color: C.pendiente },
    { valor: enProceso,  color: C.enProceso },
    { valor: resueltos,  color: C.resuelto  },
  ].filter(d => d.valor > 0)

  let paths: React.ReactElement[]
  if (datos.length === 1) {
    paths = [<Circle key="0" cx={cx} cy={cy} r={r} fill={datos[0].color} />]
  } else {
    let ang = -Math.PI / 2
    paths = datos.map((d, i) => {
      const arco = (d.valor / total) * 2 * Math.PI
      const x1 = cx + r * Math.cos(ang); const y1 = cy + r * Math.sin(ang)
      ang += arco
      const x2 = cx + r * Math.cos(ang); const y2 = cy + r * Math.sin(ang)
      return <Path key={i} d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${arco > Math.PI ? 1 : 0} 1 ${x2} ${y2}Z`} fill={d.color} stroke="white" strokeWidth={1.5} />
    })
  }

  return (
    <Svg width={S} height={S}>
      {paths}
      <Circle cx={cx} cy={cy} r={r * 0.33} fill="white" />
      <SvgText x={cx} y={cy - 3} textAnchor="middle" fontSize={8} fill="#6b7280">Total</SvgText>
      <SvgText x={cx} y={cy + 10} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#1f2937">{total}</SvgText>
    </Svg>
  )
}

// ─── Gráfico barras por prioridad ─────────────────────────────────────────────

function GraficoBarras({ reportes }: { reportes: Reporte[] }) {
  const alta  = reportes.filter(r => r.prioReporte?.toLowerCase() === 'alta').length
  const media = reportes.filter(r => r.prioReporte?.toLowerCase() === 'media').length
  const baja  = reportes.filter(r => r.prioReporte?.toLowerCase() === 'baja').length
  const maxV  = Math.max(alta, media, baja, 1)
  const hMax  = 65

  const barra = (x: number, valor: number, color: string, label: string) => {
    const h = Math.max((valor / maxV) * hMax, valor > 0 ? 3 : 0)
    const y = 75 - h
    return (
      <React.Fragment key={label}>
        <Rect x={x} y={y} width={26} height={h} fill={color} rx={3} />
        <SvgText x={x + 13} y={y - 4} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#1f2937">{valor}</SvgText>
        <SvgText x={x + 13} y={90} textAnchor="middle" fontSize={8} fill="#374151">{label}</SvgText>
      </React.Fragment>
    )
  }

  return (
    <Svg width={120} height={100}>
      {barra(10,  alta,  C.alta,  'Alta')}
      {barra(47,  media, C.media, 'Media')}
      {barra(84,  baja,  C.baja,  'Baja')}
    </Svg>
  )
}

// ─── Stat cells ───────────────────────────────────────────────────────────────

const CELLS = [
  { label: 'Total',      key: 'total'      as keyof PdfStats, color: COLORS.pdfBlue,          bg: COLORS.pdfBlueLight },
  { label: 'Pendientes', key: 'pendientes' as keyof PdfStats, color: C.pendiente,              bg: '#FFF7ED' },
  { label: 'En Proceso', key: 'enProceso'  as keyof PdfStats, color: COLORS.statusInProgress,  bg: '#EFF6FF' },
  { label: 'Resueltos',  key: 'resueltos'  as keyof PdfStats, color: COLORS.statusResolved,    bg: '#F0FDF4' },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PdfStatsGrid({ stats, reportes }: PdfStatsGridProps) {
  const tieneGraficos = !!reportes && reportes.length > 0

  return (
    <View>
      {/* Stats numéricos */}
      <View style={styles.grid}>
        {CELLS.map(cell => (
          <View key={cell.key} style={[styles.cell, { backgroundColor: cell.bg }]}>
            <Text style={[styles.num, { color: cell.color }]}>{stats[cell.key]}</Text>
            <Text style={styles.cellLabel}>{cell.label}</Text>
          </View>
        ))}
      </View>

      {/* Gráficos — solo si se pasan reportes */}
      {tieneGraficos && (
        <View style={styles.graficosRow}>
          <View style={styles.graficoWrap}>
            <Text style={styles.graficoTitulo}>Por Estado</Text>
            <GraficoPie
              pendientes={stats.pendientes}
              enProceso={stats.enProceso}
              resueltos={stats.resueltos}
            />
          </View>
          <View style={styles.graficoWrap}>
            <Text style={styles.graficoTitulo}>Por Prioridad</Text>
            <GraficoBarras reportes={reportes} />
          </View>
        </View>
      )}

      {/* Leyenda */}
      {tieneGraficos && (
        <View style={styles.leyenda}>
          {[
            { color: C.pendiente, label: `Pendientes (${stats.pendientes})` },
            { color: C.enProceso, label: `En Proceso (${stats.enProceso})` },
            { color: C.resuelto,  label: `Resueltos (${stats.resueltos})` },
          ].map(item => (
            <View key={item.label} style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: item.color }]} />
              <Text style={styles.leyendaTexto}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cell: {
    flexBasis: '48%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  num: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.extrabold,
    lineHeight: TYPOGRAPHY.xxl * 1.15,
  },
  cellLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  graficosRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  graficoWrap: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  graficoTitulo: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: SPACING.xs,
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  leyendaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaTexto: {
    fontSize: TYPOGRAPHY.sm,
    color: '#374151',
  },
})
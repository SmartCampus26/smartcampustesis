// ─── DashboardLayout.tsx ──────────────────────────────────────────────────────
// Layout base compartido por los tres homes (Autoridad, Docente, Empleado).
// Maneja: header con saludo, grid de stats, botones PDF opcionales,
// título de sección con acción, y children scrolleables.
//
// Reglas:
//   - Sin imports de services ni hooks
//   - Sin lógica de negocio
//   - Solo props + render + estilos con tokens

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../styles/tokens'
import HomeHeader from './HomeHeader'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total:      number
  pendientes: number
  enProceso:  number
  resueltos:  number
}

interface PdfBtn { onPress: () => void }

interface DashboardLayoutProps {
  // Header
  nombre:        string
  headerColor?:  string
  headerRight?:  React.ReactNode
  // Stats — opcionales. Si no se pasan, el grid interno no se renderiza.
  // Las vistas que manejan sus propios StatCard (HomeAutoridad, HomeDocente)
  // no pasan estas props y renderizan los stats directamente en children.
  stats?:        DashboardStats
  cargando?:     boolean
  onStatPress?:  (filtro: string) => void
  // Botones PDF (solo HomeEmpleado)
  pdfPersonal?:  PdfBtn
  pdfGeneral?:   PdfBtn
  // Sección de contenido
  sectionTitle?: string
  sectionAction?:{ label: string; onPress: () => void }
  // Scroll
  refrescando:   boolean
  onRefresh:     () => void
  children:      React.ReactNode
}

// ─── Subcomponente: tarjeta de stat individual ────────────────────────────────

function StatTile({
  value, label, color, onPress,
}: {
  value: number; label: string; color: string; onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[s.statTile, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DashboardLayout({
  nombre, headerColor, headerRight,
  stats, cargando = false, onStatPress,
  pdfPersonal, pdfGeneral,
  sectionTitle, sectionAction,
  refrescando, onRefresh,
  children,
}: DashboardLayoutProps) {
  return (
    <View style={s.container}>
      <HomeHeader
        nombre={nombre}
        backgroundColor={headerColor}
        rightContent={headerRight}
      />

      <ScrollView
        style={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
      >
        {/* Grid de stats — solo si se pasan stats y onStatPress */}
        {!cargando && stats && onStatPress && (
          <View style={s.statsGrid}>
            <StatTile value={stats.total}      label="Total"      color="#1DCDFE" onPress={() => onStatPress('todos')} />
            <StatTile value={stats.pendientes} label="Pendientes" color="#FFA726" onPress={() => onStatPress('pendiente')} />
            <StatTile value={stats.enProceso}  label="En Proceso" color="#1E90FF" onPress={() => onStatPress('en_proceso')} />
            <StatTile value={stats.resueltos}  label="Resueltos"  color="#32CD32" onPress={() => onStatPress('resuelto')} />
          </View>
        )}

        {/* Botones PDF — solo visibles en HomeEmpleado */}
        {(pdfPersonal || pdfGeneral) && (
          <View style={[s.pdfRow, pdfGeneral && s.pdfRowDoble]}>
            {pdfPersonal && (
              <TouchableOpacity
                style={[s.pdfBtn, s.pdfBtnPersonal, pdfGeneral && s.pdfBtnFlex]}
                onPress={pdfPersonal.onPress}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text-outline" size={18} color={COLORS.textWhite} />
                <Text style={s.pdfBtnText}>Mi PDF</Text>
              </TouchableOpacity>
            )}
            {pdfGeneral && (
              <TouchableOpacity
                style={[s.pdfBtn, s.pdfBtnGeneral, s.pdfBtnFlex]}
                onPress={pdfGeneral.onPress}
                activeOpacity={0.85}
              >
                <Ionicons name="people-outline" size={18} color={COLORS.textWhite} />
                <Text style={s.pdfBtnText}>PDF General</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Encabezado de sección con acción opcional */}
        {sectionTitle && (
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{sectionTitle}</Text>
            {sectionAction && (
              <TouchableOpacity
                onPress={sectionAction.onPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.sectionAction}>{sectionAction.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Contenido específico de cada home */}
        <View style={s.content}>
          {children}
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgSecondary },
  scroll:    { flex: 1 },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  statTile: {
    flex: 1,
    minWidth: '45%',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.hero,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textWhite,
    opacity: 0.9,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Botones PDF
  pdfRow: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  pdfRowDoble: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  pdfBtnFlex:     { flex: 1 },
  pdfBtnPersonal: { backgroundColor: '#FF5252' },
  pdfBtnGeneral:  { backgroundColor: COLORS.pdfBlue },
  pdfBtnText:     { color: COLORS.textWhite, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.bold },

  // Sección
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  sectionTitle:  { fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary },
  sectionAction: { fontSize: TYPOGRAPHY.md, color: COLORS.accent, fontWeight: TYPOGRAPHY.semibold },

  // Contenido
  content: { paddingHorizontal: SPACING.base },
})
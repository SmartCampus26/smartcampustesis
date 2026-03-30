// ─── DashboardLayout.tsx ──────────────────────────────────────────────────────
// Layout base compartido por HomeAutoridad, HomeDocente y HomeEmpleado.
// Gestiona el ScrollView con pull-to-refresh y posiciona el header,
// el grid de estadísticas y el contenido específico de cada home.
//
// Reemplaza la estructura repetida en:
//   HomeAutoridad.tsx, HomeDocente.tsx, HomeEmpleado.tsx
//
// USO:
//   <DashboardLayout
//     nombre={usuario.nomUser}
//     cargando={cargando}
//     refrescando={refrescando}
//     onRefresh={onRefresh}
//     stats={stats}
//     getStatColor={(key) => colores[key]}
//     onStatPress={(filtro) => router.push({ pathname: '/ListadoReportes', params: { filtro } })}
//   >
//     {/* Contenido específico del home: botones PDF, lista de reportes, etc. */}
//   </DashboardLayout>

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

/** Estructura de estadísticas del dashboard */
export interface DashboardStats {
  total:      number
  pendientes: number
  enProceso:  number
  resueltos:  number
}

/** Clave de cada estadística para identificarla al presionar */
type StatKey = 'todos' | 'pendiente' | 'en proceso' | 'resuelto'

interface StatItem {
  key:   StatKey
  label: string
  value: number
  color: string
}

interface DashboardLayoutProps {
  /** Nombre del usuario autenticado para el header */
  nombre: string
  /** Color de fondo del header. Default: navy */
  headerColor?: string
  /** Estadísticas a mostrar en el grid */
  stats: DashboardStats
  /** Indica si los datos están cargando por primera vez */
  cargando: boolean
  /** Indica si está activo el pull-to-refresh */
  refrescando: boolean
  /** Función de refresco ejecutada al bajar la lista */
  onRefresh: () => void
  /** Función ejecutada al presionar una tarjeta de estadística.
   *  Recibe el filtro correspondiente ('todos', 'pendiente', etc.) */
  onStatPress: (filtro: StatKey) => void
  /** Contenido específico del home renderizado debajo del grid de stats */
  children: React.ReactNode
  /** Contenido adicional en el lado derecho del header (ej. botones PDF) */
  headerRight?: React.ReactNode
}

// ─── Configuración del grid de estadísticas ───────────────────────────────────

/** Devuelve los items del grid ya armados con sus colores y valores */
function buildStatItems(stats: DashboardStats): StatItem[] {
  return [
    { key: 'todos',      label: 'Totales',    value: stats.total,      color: '#13947F' },
    { key: 'pendiente',  label: 'Pendientes', value: stats.pendientes, color: '#FFA726' },
    { key: 'en proceso', label: 'En Proceso', value: stats.enProceso,  color: '#42A5F5' },
    { key: 'resuelto',   label: 'Resueltos',  value: stats.resueltos,  color: '#66BB6A' },
  ]
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DashboardLayout({
  nombre,
  headerColor,
  stats,
  cargando,
  refrescando,
  onRefresh,
  onStatPress,
  children,
  headerRight,
}: DashboardLayoutProps) {
  const statItems = buildStatItems(stats)

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header con saludo y nombre */}
        <HomeHeader
          nombre={nombre || 'Usuario'}
          backgroundColor={headerColor}
          rightContent={headerRight}
        />

        {/* Grid de 4 tarjetas de estadísticas */}
        <View style={styles.statsGrid}>
          {statItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.statCard, { backgroundColor: item.color }]}
              onPress={() => onStatPress(item.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.statNumber}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contenido específico de cada home (botones, listas, consejos) */}
        {children}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },

  scroll: {
    flex: 1,
  },

  // Grid de 2×2 para las 4 tarjetas de estadísticas
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.base,
    gap: SPACING.md,
  },

  // Tarjeta individual de estadística
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },

  statNumber: {
    fontSize: TYPOGRAPHY.hero,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textWhite,
    marginBottom: SPACING.xs,
  },

  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textWhite,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  bottomSpacer: {
    height: 100,
  },
})
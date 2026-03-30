// ─── PdfLayout.tsx ────────────────────────────────────────────────────────────
// Layout base compartido por las tres pantallas de informes PDF:
//   PdfPreview (PDF General para jefes)
//   PdfResumidoPreview (PDF Resumido para autoridad)
//   PdfPersonalPreview (PDF Personal para empleados)
//
// Contiene el 70% del JSX que estas pantallas tienen en común:
//   - Estado de carga
//   - Estado de error
//   - Header con ícono, título, generador, fecha y badge de departamento
//   - Sección de estadísticas en grid de 4 tarjetas
//   - Sección central variable (recibida como children)
//   - Botón de descarga con estado de generando y cancelación
//   - Botón de volver
//
// USO:
//   <PdfLayout
//     cargando={cargando}
//     error={error}
//     titulo="Informe General"
//     generador="María López (Jefa de Sistemas)"
//     departamento="sistemas"
//     stats={statsGlobales}
//     generando={generando}
//     puedeDescargar={datos !== null}
//     onDescargar={handleDescargar}
//     onCancelar={cancelarGeneracion}
//     onVolver={() => router.replace('/HomeEmpleado')}
//     labelDescargar="Descargar PDF General"
//   >
//     {/* Contenido específico: lista de empleados, gráficos, selector de filtro */}
//   </PdfLayout>

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import LoadingScreen from '../ui/LoadingScreen'
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Estadísticas globales mostradas en el grid superior */
export interface PdfStats {
  total:      number
  pendientes: number
  enProceso:  number
  resueltos:  number
}

type Departamento = 'sistemas' | 'mantenimiento' | 'todos'

interface PdfLayoutProps {
  /** Muestra LoadingScreen mientras es true */
  cargando: boolean
  /** Muestra pantalla de error si tiene valor */
  error?: string | null
  /** Título principal del informe */
  titulo: string
  /** Nombre y cargo de quien genera el informe */
  generador?: string
  /** Departamento para el badge inferior del header */
  departamento?: Departamento
  /** Estadísticas mostradas en el grid de 4 tarjetas */
  stats: PdfStats
  /** Muestra spinner en el botón de descarga cuando es true */
  generando: boolean
  /** Habilita o deshabilita el botón de descarga */
  puedeDescargar: boolean
  /** Función de descarga ejecutada al presionar el botón */
  onDescargar: () => void
  /** Función de cancelación mostrada durante la generación */
  onCancelar: () => void
  /** Función de navegación al presionar "Volver" */
  onVolver: () => void
  /** Texto del botón de descarga. Default: 'Descargar PDF' */
  labelDescargar?: string
  /** Contenido específico de cada pantalla (gráficos, listas, filtros) */
  children: React.ReactNode
}

// ─── Subcomponente: tarjeta de estadística ────────────────────────────────────

interface StatCardProps {
  value: number
  label: string
  color: string
}

function StatCard({ value, label, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statNum, { color }]}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PdfLayout({
  cargando,
  error,
  titulo,
  generador,
  departamento,
  stats,
  generando,
  puedeDescargar,
  onDescargar,
  onCancelar,
  onVolver,
  labelDescargar = 'Descargar PDF',
  children,
}: PdfLayoutProps) {

  // ── Estado de carga ──────────────────────────────────────────────────────
  if (cargando) {
    return <LoadingScreen text="Preparando informe…" color={COLORS.pdfBlue} />
  }

  // ── Estado de error ──────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centrado}>
        <Ionicons name="alert-circle-outline" size={56} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.btnVolver} onPress={onVolver}>
          <Ionicons name="arrow-back-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.btnVolverText}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Ícono de departamento para el badge ──────────────────────────────────
  const deptIcon: React.ComponentProps<typeof Ionicons>['name'] =
    departamento === 'sistemas' ? 'desktop-outline' : 'construct-outline'

  const deptLabel = departamento
    ? departamento.charAt(0).toUpperCase() + departamento.slice(1)
    : undefined

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Ionicons name="document-text" size={40} color={COLORS.pdfBlue} />
          <Text style={styles.headerTitulo}>{titulo}</Text>
          {!!generador && (
            <Text style={styles.headerSub}>{generador}</Text>
          )}
          <Text style={styles.headerFecha}>
            {new Date().toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>
          {!!deptLabel && departamento !== 'todos' && (
            <View style={styles.deptBadge}>
              <Ionicons name={deptIcon} size={14} color={COLORS.pdfBlue} />
              <Text style={styles.deptText}>{deptLabel}</Text>
            </View>
          )}
        </View>

        {/* ── GRID DE ESTADÍSTICAS ── */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Resumen</Text>
          <View style={styles.statsGrid}>
            <StatCard value={stats.total}      label="Total"      color={COLORS.pdfBlue} />
            <StatCard value={stats.pendientes} label="Pendientes" color="#F59E0B" />
            <StatCard value={stats.enProceso}  label="En Proceso" color="#3B82F6" />
            <StatCard value={stats.resueltos}  label="Resueltos"  color="#22C55E" />
          </View>
        </View>

        {/* ── CONTENIDO ESPECÍFICO DE CADA PANTALLA PDF ── */}
        {children}

        {/* ── BOTÓN DE DESCARGA ── */}
        <TouchableOpacity
          style={[
            styles.btnDescargar,
            (!puedeDescargar || generando) && styles.btnDescargarDisabled,
          ]}
          onPress={onDescargar}
          disabled={!puedeDescargar || generando}
          activeOpacity={0.8}
        >
          {generando ? (
            // Durante la generación: spinner + opción de cancelar
            <TouchableOpacity
              onPress={onCancelar}
              style={styles.btnGenerandoInner}
            >
              <ActivityIndicator size="small" color={COLORS.textWhite} />
              <Text style={styles.btnDescargarText}>Generando…</Text>
              <Text style={styles.btnCancelarText}>  Cancelar ✕</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Ionicons name="download-outline" size={22} color={COLORS.textWhite} />
              <Text style={styles.btnDescargarText}>{labelDescargar}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── BOTÓN VOLVER ── */}
        <TouchableOpacity style={styles.btnVolver} onPress={onVolver}>
          <Ionicons name="arrow-back-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.btnVolverText}>Volver</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll:    { padding: SPACING.lg, paddingBottom: SPACING.xxxl },

  // Estados de carga y error
  centrado:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: { marginTop: SPACING.md, fontSize: TYPOGRAPHY.base, color: COLORS.error, textAlign: 'center', lineHeight: 22 },

  // Header del informe
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.base,
    ...SHADOWS.sm,
  },
  headerTitulo: { fontSize: TYPOGRAPHY.lg,  fontWeight: TYPOGRAPHY.bold,    color: '#1E3A5F', textAlign: 'center', marginTop: SPACING.sm,  lineHeight: 24 },
  headerSub:    { fontSize: TYPOGRAPHY.sm,  fontWeight: TYPOGRAPHY.semibold, color: '#059669', textAlign: 'center', marginTop: SPACING.xs },
  headerFecha:  { fontSize: TYPOGRAPHY.xs,  color: COLORS.textSecondary,     marginTop: SPACING.xs },
  deptBadge:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.pdfBlueLight, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, marginTop: SPACING.sm },
  deptText:     { fontSize: TYPOGRAPHY.sm, color: COLORS.pdfBlue, fontWeight: TYPOGRAPHY.semibold },

  // Sección contenedora genérica
  seccion: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  seccionTitulo: { fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.bold, color: '#1E3A5F', marginBottom: SPACING.md, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Grid de 4 estadísticas en fila
  statsGrid: { flexDirection: 'row', gap: SPACING.sm },
  statCard:  { flex: 1, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.sm, padding: SPACING.sm, alignItems: 'center', borderLeftWidth: 3 },
  statNum:   { fontSize: TYPOGRAPHY.xxl, fontWeight: TYPOGRAPHY.extrabold },
  statLbl:   { fontSize: TYPOGRAPHY.xs,  color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2, textAlign: 'center' },

  // Botón de descarga
  btnDescargar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.pdfBlue,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.base,
    marginBottom: SPACING.sm,
    ...SHADOWS.pdf,
  },
  btnDescargarDisabled: { backgroundColor: '#93C5FD', elevation: 0, shadowOpacity: 0 },
  btnDescargarText:     { color: COLORS.textWhite, fontSize: TYPOGRAPHY.base, fontWeight: TYPOGRAPHY.bold },
  btnGenerandoInner:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  btnCancelarText:      { color: '#FCA5A5', fontSize: TYPOGRAPHY.sm },

  // Botón volver
  btnVolver:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.md },
  btnVolverText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.medium },
})
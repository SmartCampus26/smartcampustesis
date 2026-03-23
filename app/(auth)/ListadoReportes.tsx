// 📄 ListadoReportes.tsx
// Pantalla de listado de reportes del usuario autenticado.
// Permite filtrar por estado (todos, pendiente, en proceso, resuelto),
// buscar por texto, refrescar con pull-to-refresh y ver el detalle
// de cada reporte en un modal.

import { useEffect, useState } from 'react'
import {
  ActivityIndicator, RefreshControl, ScrollView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { Reporte } from '../../src/types/Database'
import { styles } from '../../src/components/listadoReportesStyles'
import {
  FiltroEstado,
  cargarMisReportes,
  aplicarFiltrosReportes,
  getStatusColor,
  getPriorityColor,
} from '../../src/services/ListadoReportesService'
import ReporteDetalleModal from '../../src/components/Reportedetallemodal'
import { useToast } from '../../src/components/ToastContext'
import * as React from 'react'

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Lista de reportes del usuario autenticado con filtros y búsqueda.
 * Acepta el param `filtro` por ruta para pre-seleccionar el filtro de estado.
 */
export default function MisReportes() {
  const { filtro } = useLocalSearchParams<{ filtro?: string }>()
  const { showToast } = useToast()

  // ── Estado de datos ──────────────────────────────────────────────────────
  const [reportes, setReportes]                   = useState<Reporte[]>([])
  const [reportesFiltrados, setReportesFiltrados] = useState<Reporte[]>([])
  const [cargando, setCargando]                   = useState(true)
  const [refrescando, setRefrescando]             = useState(false)

  // ── Estado de filtros y búsqueda ─────────────────────────────────────────
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [busqueda, setBusqueda]         = useState('')

  // ── Estado del modal de detalle ──────────────────────────────────────────
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [modalVisible, setModalVisible]               = useState(false)

  // Pre-selecciona el filtro si viene como param de navegación
  useEffect(() => {
    if (filtro && ['todos', 'pendiente', 'en proceso', 'resuelto'].includes(filtro)) {
      setFiltroEstado(filtro as FiltroEstado)
    }
  }, [filtro])

  useEffect(() => { fetchReportes() }, [])

  // Recalcula la lista filtrada cada vez que cambian reportes, filtro o búsqueda
  useEffect(() => {
    setReportesFiltrados(aplicarFiltrosReportes(reportes, filtroEstado, busqueda))
  }, [reportes, filtroEstado, busqueda])

  /**
   * Carga los reportes del usuario autenticado desde Supabase.
   */
  const fetchReportes = async () => {
    try {
      const data = await cargarMisReportes()
      setReportes(data)
    } catch (err: any) {
      showToast(err.message || 'Error al cargar reportes', 'error')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  /** Activa el refresco por pull-to-refresh y recarga los datos */
  const onRefresh = () => { setRefrescando(true); fetchReportes() }

  /**
   * Abre el modal de detalle para el reporte seleccionado.
   * @param reporte - Reporte a visualizar
   */
  const handleVerDetalle = (reporte: Reporte) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  /**
   * Cuenta cuántos reportes tienen un estado específico.
   * Se usa para mostrar el conteo en cada chip de filtro.
   * @param estado - Estado a contar ('pendiente' | 'en proceso' | 'resuelto')
   */
  const contarPor = (estado: string) =>
    reportes.filter((r) => r.estReporte === estado).length

  // ── Loading ───────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#21D0B2" />
      </View>
    )
  }

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Reportes</Text>
        <Text style={styles.headerSubtitle}>
          {reportes.length} {reportes.length === 1 ? 'reporte' : 'reportes'} en total
        </Text>
      </View>

      {/* ── BARRA DE BÚSQUEDA ── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8B9BA8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por descripción o ID..."
          value={busqueda}
          onChangeText={setBusqueda}
          placeholderTextColor="#8B9BA8"
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={20} color="#8B9BA8" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── CHIPS DE FILTRO POR ESTADO ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {([
          { key: 'todos',      label: `Todos (${reportes.length})`,              color: null },
          { key: 'pendiente',  label: `Pendientes (${contarPor('pendiente')})`,  color: '#FFA726' },
          { key: 'en proceso', label: `En Proceso (${contarPor('en proceso')})`, color: '#42A5F5' },
          { key: 'resuelto',   label: `Resueltos (${contarPor('resuelto')})`,    color: '#66BB6A' },
        ] as { key: FiltroEstado; label: string; color: string | null }[]).map(({ key, label, color }) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterButton, filtroEstado === key && styles.filterButtonActive]}
            onPress={() => setFiltroEstado(key)}
          >
            {color && <View style={[styles.filterDot, { backgroundColor: color }]} />}
            <Text style={[styles.filterText, filtroEstado === key && styles.filterTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── LISTA DE REPORTES ── */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#21D0B2']} />
        }
      >
        {reportesFiltrados.length === 0 ? (
          // Estado vacío — cambia el mensaje según el contexto
          <View style={styles.emptyState}>
            <Ionicons
              name={busqueda ? 'search' : 'document-text-outline'}
              size={64}
              color="#E1E8ED"
            />
            <Text style={styles.emptyText}>
              {busqueda
                ? 'No se encontraron reportes'
                : filtroEstado === 'todos'
                ? 'No tienes reportes aún'
                : `No tienes reportes ${filtroEstado}`}
            </Text>
            <Text style={styles.emptySubtext}>
              {busqueda
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea un nuevo reporte desde la pantalla de inicio'}
            </Text>
          </View>
        ) : (
          reportesFiltrados.map((reporte) => (
            <TouchableOpacity
              key={reporte.idReporte}
              style={styles.reportCard}
              onPress={() => handleVerDetalle(reporte)}
              activeOpacity={0.7}
            >
              <View style={styles.reportHeader}>
                <View style={styles.reportIdContainer}>
                  <Text style={styles.reportId}>#{reporte.idReporte}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reporte.estReporte) }]}>
                    <Text style={styles.statusText}>{reporte.estReporte}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
              </View>

              <Text style={styles.reportDesc} numberOfLines={3}>
                {reporte.descriReporte}
              </Text>

              {/* Metadata: fecha y prioridad */}
              <View style={styles.reportMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#8B9BA8" />
                  <Text style={styles.metaText}>
                    {new Date(reporte.fecReporte).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
                {reporte.prioReporte && reporte.prioReporte !== 'no asignada' && (
                  <View style={styles.metaItem}>
                    <Ionicons name="flag" size={14} color={getPriorityColor(reporte.prioReporte)} />
                    <Text style={[styles.metaText, { color: getPriorityColor(reporte.prioReporte) }]}>
                      {reporte.prioReporte}
                    </Text>
                  </View>
                )}
              </View>

              {/* Colaborador asignado (si existe) */}
              {reporte.empleado && (
                <View style={styles.assignedSection}>
                  <Ionicons name="person" size={16} color="#21D0B2" />
                  <Text style={styles.assignedText}>
                    Asignado a: {reporte.empleado.nomEmpl} {reporte.empleado.apeEmpl}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de detalle de reporte */}
      <ReporteDetalleModal
        visible={modalVisible}
        reporte={reporteSeleccionado}
        onClose={() => setModalVisible(false)}
      />
    </View>
  )
}
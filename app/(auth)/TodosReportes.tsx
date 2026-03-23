// 📋 TodosReportes.tsx
// Pantalla de visualización de TODOS los reportes del sistema para la autoridad.
// Permite filtrar por rol del usuario (docente / coordinador) y por estado,
// buscar por texto, y ver el detalle completo de cada reporte en un modal.

import { useEffect, useState } from 'react'
import {
  ActivityIndicator, ScrollView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { styles } from '../../src/components/todosReportesStyles'
import {
  usuario,
  reporte,
  cargarDatosTodosReportes,
  getUsuarioInfo,
  filtrarTodosReportes,
  getEstadoColor,
  getEstadoTexto,
  getPrioridadColor,
} from '../../src/services/TodosReportesService'
import { Reporte } from '../../src/types/Database'
import ReporteDetalleModal from '../../src/components/Reportedetallemodal'
import { useToast } from '../../src/components/ToastContext'
import * as React from 'react'

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Listado global de reportes para la autoridad.
 * Carga todos los usuarios y reportes del sistema al montar.
 * Los filtros se aplican en memoria sobre la lista completa.
 */
export default function TodosReportes() {
  const { showToast } = useToast()

  // ── Estado de datos ──────────────────────────────────────────────────────
  const [reportes, setReportes] = useState<reporte[]>([])
  const [usuarios, setUsuarios] = useState<usuario[]>([])
  const [cargando, setCargando] = useState(true)

  // ── Estado de filtros y búsqueda ─────────────────────────────────────────
  const [busqueda, setBusqueda]         = useState('')
  const [filtroRol, setFiltroRol]       = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // ── Estado del modal de detalle ──────────────────────────────────────────
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [modalVisible, setModalVisible]               = useState(false)

  useEffect(() => { cargarDatos() }, [])

  /**
   * Carga todos los usuarios y reportes del sistema desde Supabase.
   */
  const cargarDatos = async () => {
    setCargando(true)
    try {
      const { usuarios: usuData, reportes: repData } = await cargarDatosTodosReportes()
      setUsuarios(usuData)
      setReportes(repData)
    } catch (error: any) {
      showToast(error.message || 'Error al cargar reportes', 'error')
    } finally {
      setCargando(false)
    }
  }

  // Lista filtrada en memoria según búsqueda, rol y estado
  const reportesFiltrados = filtrarTodosReportes(reportes, usuarios, busqueda, filtroRol, filtroEstado)

  /**
   * Abre el modal de detalle completo para el reporte seleccionado.
   * El reporte viene del servicio ya con usuario, objeto y lugar incluidos.
   * @param rep - Reporte a visualizar
   */
  const abrirDetalle = (rep: reporte) => {
    setReporteSeleccionado(rep as unknown as Reporte)
    setModalVisible(true)
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    )
  }

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* ── TARJETAS DE ESTADÍSTICAS RÁPIDAS ── */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={28} color="#1DCDFE" />
          <Text style={styles.statNumber}>{reportes.length}</Text>
          <Text style={styles.statLabel}>Total Reportes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="school" size={28} color="#21D0B2" />
          <Text style={styles.statNumber}>
            {usuarios.filter(u => u.rolUser === 'docente').length}
          </Text>
          <Text style={styles.statLabel}>Docentes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark" size={28} color="#34F5C5" />
          <Text style={styles.statNumber}>
            {usuarios.filter(u => u.rolUser === 'autoridad').length}
          </Text>
          <Text style={styles.statLabel}>Coordinadores</Text>
        </View>
      </View>

      {/* ── BARRA DE BÚSQUEDA ── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por descripción o usuario..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── FILTROS: ROL Y ESTADO ── */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

          {/* Filtros por rol del creador del reporte */}
          {(['todos', 'docente', 'autoridad'] as const).map((rol) => (
            <TouchableOpacity
              key={rol}
              style={[styles.filterChip, filtroRol === rol && styles.filterChipActive]}
              onPress={() => setFiltroRol(rol)}
            >
              {rol === 'docente' && (
                <Ionicons name="school" size={16} color={filtroRol === rol ? '#FFF' : '#21D0B2'} />
              )}
              {rol === 'autoridad' && (
                <Ionicons name="shield-checkmark" size={16} color={filtroRol === rol ? '#FFF' : '#34F5C5'} />
              )}
              <Text style={[styles.filterChipText, filtroRol === rol && styles.filterChipTextActive]}>
                {rol === 'todos' ? 'Todos' : rol === 'docente' ? 'Docentes' : 'Coordinadores'}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.filterDivider} />

          {/* Filtros por estado del reporte */}
          {([
            { key: 'todos',      label: 'Todos los Estados' },
            { key: 'pendiente',  label: '⏳ Pendiente' },
            { key: 'en_proceso', label: '🔄 En Proceso' },
            { key: 'completado', label: '✅ Completado' },
          ] as const).map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, filtroEstado === key && styles.filterChipActive]}
              onPress={() => setFiltroEstado(key)}
            >
              <Text style={[styles.filterChipText, filtroEstado === key && styles.filterChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── LISTA DE REPORTES ── */}
      <ScrollView style={styles.reportesList}>
        {reportesFiltrados.length === 0 ? (
          // Estado vacío
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No hay reportes</Text>
            <Text style={styles.emptySubtitle}>
              {busqueda ? 'No se encontraron reportes con tu búsqueda' : 'No hay reportes disponibles'}
            </Text>
          </View>
        ) : (
          <View style={styles.reportesContainer}>
            <Text style={styles.resultCount}>
              Mostrando {reportesFiltrados.length} de {reportes.length} reportes
            </Text>

            {reportesFiltrados.map((reporte) => {
              const usuarioInfo = getUsuarioInfo(usuarios, reporte.idUser)
              return (
                <TouchableOpacity
                  key={reporte.idReporte}
                  style={styles.reportCard}
                  onPress={() => abrirDetalle(reporte)}
                  activeOpacity={0.75}
                >
                  {/* Cabecera: ID, prioridad y estado */}
                  <View style={styles.reportHeader}>
                    <View style={styles.reportBadge}>
                      <Text style={styles.reportBadgeText}>#{reporte.idReporte}</Text>
                    </View>
                    <View style={styles.statusBadges}>
                      {reporte.prioReporte && (
                        <View style={[styles.prioridadBadge, { backgroundColor: getPrioridadColor(reporte.prioReporte) }]}>
                          <Text style={styles.prioridadText}>
                            {reporte.prioReporte === 'alta' ? '🔴 Alta' :
                             reporte.prioReporte === 'media' ? '🟡 Media' : '🟢 Baja'}
                          </Text>
                        </View>
                      )}
                      <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(reporte.estReporte) }]}>
                        <Text style={styles.estadoText}>{getEstadoTexto(reporte.estReporte)}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.reportDesc} numberOfLines={3}>
                    {reporte.descriReporte || 'Sin descripción'}
                  </Text>

                  {/* Info del usuario que creó el reporte */}
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <Ionicons
                        name={usuarioInfo.rol === 'autoridad' ? 'shield-checkmark' : 'school'}
                        size={20}
                        color="#FFF"
                      />
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{usuarioInfo.nombre}</Text>
                      <View style={styles.userRolBadge}>
                        <Text style={styles.userRolText}>
                          {usuarioInfo.rol === 'autoridad' ? '👔 Coordinador' : '📚 Docente'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Metadata: fecha y comentarios */}
                  <View style={styles.metadata}>
                    {reporte.fecReporte && (
                      <View style={styles.metadataItem}>
                        <Ionicons name="calendar" size={14} color="#6B7280" />
                        <Text style={styles.metadataText}>
                          {new Date(reporte.fecReporte).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    )}
                    {reporte.comentReporte && (
                      <View style={styles.metadataItem}>
                        <Ionicons name="chatbox-ellipses" size={14} color="#6B7280" />
                        <Text style={styles.metadataText}>Con comentarios</Text>
                      </View>
                    )}
                  </View>

                  {/* Indicador de modo solo lectura */}
                  <View style={[styles.readOnlyBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                    <Ionicons name="eye" size={16} color="#1DCDFE" />
                    <Text style={styles.readOnlyText}>Ver detalle completo</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal de detalle completo del reporte */}
      <ReporteDetalleModal
        visible={modalVisible}
        reporte={reporteSeleccionado}
        onClose={() => setModalVisible(false)}
      />
    </View>
  )
}
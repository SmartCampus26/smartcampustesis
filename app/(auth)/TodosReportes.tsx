// 📋 TodosReportes.tsx
// Pantalla de visualización de TODOS los reportes del sistema para la autoridad.
// Permite filtrar por rol del usuario (docente / coordinador) y por estado,
// buscar por texto, ver el detalle completo de cada reporte en un modal,
// y eliminar reportes (acción exclusiva de autoridades).
//
// Subcomponentes:
//   - ConfirmModal: modal de confirmación con la misma estética del ToastContext
//     (fondo oscuro #1a1a2e, borde rojo #e63946, punto indicador, texto claro).
//     Reemplaza Alert.alert para la acción destructiva de eliminación,
//     manteniendo consistencia visual con el sistema de notificaciones de la app.

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import ReporteDetalleModal from '../../src/components/Reportedetallemodal'
import { useToast } from '../../src/components/ToastContext'
import { styles } from '../../src/components/todosReportesStyles'
import {
  cargarDatosTodosReportes,
  eliminarReporte,
  filtrarTodosReportes,
  getEstadoColor,
  getEstadoTexto,
  getPrioridadColor,
  getUsuarioInfo,
  reporte,
  usuario,
} from '../../src/services/admin/TodosReportesService'
import { Reporte } from '../../src/types/Database'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Datos necesarios para mostrar el modal de confirmación */
interface ConfirmData {
  visible: boolean
  titulo: string
  mensaje: string
  labelConfirmar?: string
  /** Color del borde, punto indicador y botón — espeja la paleta del ToastContext */
  accentColor?: string
  onConfirm: () => void
}

// ─── Subcomponente: ConfirmModal ──────────────────────────────────────────────

/**
 * Modal de confirmación con la misma estética del ToastContext:
 *   - Fondo oscuro: #1a1a2e  (igual que toastError del toast)
 *   - Borde de color dinámico según accentColor (rojo #e63946 para eliminar)
 *   - Punto indicador: mismo dot que ToastBanner
 *   - Texto principal: #f1f1f1  |  Texto secundario: #a0aec0
 *   - Botón Cancelar con borde sutil (#2d3748)
 *   - Botón Confirmar con fondo del accentColor y texto oscuro
 *
 * Reemplaza Alert.alert para la eliminación de reportes (acción destructiva
 * exclusiva de autoridades), eliminando la dependencia del diálogo nativo.
 *
 * Props:
 *  - visible       : controla si el modal está abierto
 *  - titulo        : título principal (junto al punto indicador)
 *  - mensaje       : descripción de la acción a confirmar
 *  - labelConfirmar: texto del botón de acción (por defecto "Confirmar")
 *  - accentColor   : color del borde, punto y botón
 *  - onConfirm     : callback ejecutado al confirmar
 *  - onCancel      : callback ejecutado al cancelar
 */
function ConfirmModal({
  visible,
  titulo,
  mensaje,
  labelConfirmar = 'Confirmar',
  accentColor = '#e63946',
  onConfirm,
  onCancel,
}: ConfirmData & { onCancel: () => void }) {
  // El fondo oscuro varía según la naturaleza del accentColor:
  // rojo → #1a1a2e (toastError) · azul/verde → #0f1623 (toastInfo/success)
  const bgColor = accentColor === '#e63946' ? '#1a1a2e' : '#0f1623'

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}>
        <View style={{
          backgroundColor: bgColor,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: accentColor,
          padding: 24,
          width: '100%',
          maxWidth: 360,
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 12,
        }}>
          {/* Encabezado: punto indicador + título — mismo patrón que ToastBanner */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: accentColor,
              flexShrink: 0,
            }} />
            <Text style={{
              fontSize: 15,
              fontWeight: '700',
              color: '#f1f1f1',
              flexShrink: 1,
            }}>
              {titulo}
            </Text>
          </View>

          {/* Mensaje */}
          <Text style={{
            fontSize: 14,
            color: '#a0aec0',
            lineHeight: 20,
            marginBottom: 22,
            paddingLeft: 18,
          }}>
            {mensaje}
          </Text>

          {/* Acciones */}
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#2d3748',
              }}
            >
              <Text style={{ color: '#a0aec0', fontWeight: '600', fontSize: 14 }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: accentColor,
              }}
            >
              <Text style={{ color: '#f1f1f1', fontWeight: '700', fontSize: 14 }}>
                {labelConfirmar}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Listado global de reportes para la autoridad.
 * Carga todos los usuarios y reportes del sistema al montar.
 * Los filtros se aplican en memoria sobre la lista completa.
 * La eliminación de reportes está disponible solo para este rol.
 */
export default function TodosReportes() {
  const { showToast } = useToast()

  // ── Estado de datos ──────────────────────────────────────────────────────
  const [reportes, setReportes]   = useState<reporte[]>([])
  const [usuarios, setUsuarios]   = useState<usuario[]>([])
  const [cargando, setCargando]   = useState(true)

  // ── Estado de filtros y búsqueda ─────────────────────────────────────────
  const [busqueda, setBusqueda]         = useState('')
  const [filtroRol, setFiltroRol]       = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // ── Estado del modal de detalle ──────────────────────────────────────────
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [modalVisible, setModalVisible]               = useState(false)

  // ── Estado del ConfirmModal (reemplaza Alert.alert) ───────────────────────
  const [confirm, setConfirm] = useState<ConfirmData>({
    visible: false,
    titulo: '',
    mensaje: '',
    labelConfirmar: 'Confirmar',
    accentColor: '#e63946', // rojo error por defecto — acción destructiva
    onConfirm: () => {},
  })

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Abre el ConfirmModal con estética de toast.
   * Para eliminaciones usa accentColor='#e63946' (rojo, igual que toastError).
   */
  const openConfirm = (
    titulo: string,
    mensaje: string,
    onConfirm: () => void,
    labelConfirmar = 'Confirmar',
    accentColor = '#e63946',
  ) => setConfirm({ visible: true, titulo, mensaje, labelConfirmar, accentColor, onConfirm })

  /** Cierra el ConfirmModal sin ejecutar ninguna acción */
  const closeConfirm = () => setConfirm((p) => ({ ...p, visible: false }))

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
   */
  const abrirDetalle = (rep: reporte) => {
    setReporteSeleccionado(rep as unknown as Reporte)
    setModalVisible(true)
  }

  /**
   * Solicita confirmación vía ConfirmModal con estética de error (rojo #e63946,
   * igual que showToast('...', 'error')) y elimina el reporte de la BD.
   * Reemplaza Alert.alert manteniendo coherencia visual total con ToastContext.
   *
   * @param idReporte - ID del reporte a eliminar
   */
  const confirmarEliminacion = (idReporte: string) => {
    openConfirm(
      'Eliminar reporte',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      async () => {
        closeConfirm()
        try {
          await eliminarReporte(idReporte)
          showToast('Reporte eliminado correctamente', 'success')
          // Actualizar lista local sin recargar todo desde la BD
          setReportes(prev => prev.filter(r => r.idReporte !== idReporte))
        } catch (err: any) {
          showToast(err.message || 'Error al eliminar el reporte', 'error')
        }
      },
      'Eliminar',
      '#e63946', // rojo — igual que el borde toastError
    )
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

                  {/* Acciones: ver detalle y eliminar */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <View style={[styles.readOnlyBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                      <Ionicons name="eye" size={16} color="#1DCDFE" />
                      <Text style={styles.readOnlyText}>Ver detalle completo</Text>
                    </View>

                    {/* Botón eliminar — exclusivo de autoridades */}
                    <TouchableOpacity
                      onPress={(e) => {
                        // Detiene la propagación para no abrir el modal de detalle
                        e.stopPropagation()
                        confirmarEliminacion(reporte.idReporte)
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#e63946" />
                      <Text style={{ color: '#e63946', fontSize: 13, fontWeight: '500' }}>Eliminar</Text>
                    </TouchableOpacity>
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

      {/* ConfirmModal con estética de toast — fondo #1a1a2e, borde rojo #e63946 */}
      <ConfirmModal
        visible={confirm.visible}
        titulo={confirm.titulo}
        mensaje={confirm.mensaje}
        labelConfirmar={confirm.labelConfirmar}
        accentColor={confirm.accentColor}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </View>
  )
}
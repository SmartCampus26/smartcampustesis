// app/(auth)/ReasignarEmpleado.tsx
import { useEffect, useState } from 'react'
import {
  ActivityIndicator, Alert, Modal,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Empleado, Reporte } from '../../src/types/Database'
import { styles } from '../../src/components/Reasignarempleadostyles'
import * as React from 'react'
import {
  cargarNombreAutoridad,
  cargarEmpleadosYReportes,
  reasignarReporteDB,
  filtrarEmpleados,
  getEmpleadoNombre,
} from '../../src/services/Reasignarempleadoservice'
// ── NUEVO ──
import ReporteDetalleModal from '../../src/components/Reportedetallemodal'

const formatId = (id: string): string => {
  if (!id) return ''
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

export default function ReasignarEmpleado() {

  const [empleados, setEmpleados]               = useState<Empleado[]>([])
  const [reportes, setReportes]                 = useState<Reporte[]>([])
  const [cargando, setCargando]                 = useState(true)
  const [modalVisible, setModalVisible]         = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [nombreAutoridad, setNombreAutoridad]   = useState<string>('Sistema')
  const [filtroDepto, setFiltroDepto]           = useState<string>('todos')
  const [filtroCargo, setFiltroCargo]           = useState<string>('todos')

  // ── NUEVO: estado del modal de detalle ──
  const [detalleVisible, setDetalleVisible]     = useState(false)
  const [reporteDetalle, setReporteDetalle]     = useState<Reporte | null>(null)

  useEffect(() => {
    const inicializarPantalla = async () => {
      setCargando(true)
      await Promise.all([cargarDatos(), cargarSesion()])
      setCargando(false)
    }
    inicializarPantalla()
  }, [])

  const cargarSesion = async () => {
    const nombre = await cargarNombreAutoridad()
    setNombreAutoridad(nombre)
  }

  const cargarDatos = async () => {
    try {
      const { empleados: empData, reportes: repData } = await cargarEmpleadosYReportes()
      setEmpleados(empData)
      setReportes(repData)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const abrirModalReasignacion = (reporte: Reporte) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  // ── NUEVO ──
  const abrirDetalle = (reporte: Reporte) => {
    setReporteDetalle(reporte)
    setDetalleVisible(true)
  }

  const reasignarReporte = async (empleadoId: string) => {
    if (!reporteSeleccionado) return
    try {
      await reasignarReporteDB(reporteSeleccionado.idReporte, empleadoId, nombreAutoridad)
      Alert.alert('¡Éxito!', 'Reporte reasignado correctamente')
      setModalVisible(false)
      cargarDatos()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const empleadosFiltrados = filtrarEmpleados(empleados, filtroDepto, filtroCargo)

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Header estadísticas */}
        <View style={styles.header}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={30} color="#1DCDFE" />
            <Text style={styles.statNumber}>{empleados.length}</Text>
            <Text style={styles.statLabel}>Colaboradores</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={30} color="#21D0B2" />
            <Text style={styles.statNumber}>{reportes.length}</Text>
            <Text style={styles.statLabel}>Reportes</Text>
          </View>
        </View>

        {/* Reportes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reportes Activos</Text>
          <Text style={styles.sectionSubtitle}>Selecciona un reporte para reasignar</Text>

          {reportes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={60} color="#9CA3AF" />
              <Text style={styles.emptyText}>No hay reportes disponibles</Text>
            </View>
          ) : (
            reportes.map((reporte) => (
              <View key={reporte.idReporte} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportBadge}>
                    {/* ID corto */}
                    <Text style={styles.reportBadgeText}>#{formatId(String(reporte.idReporte))}</Text>
                  </View>
                  <Ionicons name="document-text-outline" size={24} color="#2F455C" />
                </View>

                <Text style={styles.reportDesc} numberOfLines={2}>
                  {reporte.descriReporte || 'Sin descripción'}
                </Text>

                <View style={styles.statusBadges}>
                  <View style={[styles.badge, styles.badgeEstado]}>
                    <Text style={styles.badgeText}>{reporte.estReporte}</Text>
                  </View>
                  <View style={[styles.badge, styles.badgePrioridad]}>
                    <Text style={styles.badgeText}>{reporte.prioReporte}</Text>
                  </View>
                </View>

                <View style={styles.assignedContainer}>
                  <Ionicons name="person-outline" size={16} color="#6B7280" />
                  <Text style={styles.assignedText}>
                    Asignado a: {getEmpleadoNombre(empleados, reporte.idEmpl)}
                  </Text>
                </View>

                {/* ── NUEVO: botón Ver Detalle ── */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10, marginBottom: 8,
                  }}
                  onPress={() => abrirDetalle(reporte)}
                >
                  <Ionicons name="eye-outline" size={18} color="#1DCDFE" />
                  <Text style={{ marginLeft: 6, color: '#1DCDFE', fontWeight: '600', fontSize: 14 }}>
                    Ver detalle completo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reassignButton}
                  onPress={() => abrirModalReasignacion(reporte)}
                >
                  <Ionicons name="swap-horizontal" size={20} color="#FFF" />
                  <Text style={styles.reassignButtonText}>Reasignar Colaborador</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Modal reasignación (ya existía) */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Colaborador</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle" size={30} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Filtros */}
              <View style={styles.filtersContainer}>
                <Text style={styles.filterLabel}>Filtrar por:</Text>
                <View style={styles.filterRow}>
                  {(['todos', 'mantenimiento', 'sistemas'] as const).map((dep) => (
                    <TouchableOpacity
                      key={dep}
                      style={[styles.filterChip, filtroDepto === dep && styles.filterChipActive]}
                      onPress={() => setFiltroDepto(dep)}
                    >
                      {dep === 'mantenimiento' && (
                        <Ionicons name="hammer" size={16} color={filtroDepto === dep ? '#FFF' : '#21D0B2'} />
                      )}
                      {dep === 'sistemas' && (
                        <Ionicons name="desktop" size={16} color={filtroDepto === dep ? '#FFF' : '#2F455C'} />
                      )}
                      <Text style={[styles.filterChipText, filtroDepto === dep && styles.filterChipTextActive]}>
                        {dep === 'todos' ? 'Todos' : dep === 'mantenimiento' ? 'Mantenimiento' : 'Sistemas'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.filterRow}>
                  {(['todos', 'colaborador', 'jefe'] as const).map((cargo) => (
                    <TouchableOpacity
                      key={cargo}
                      style={[styles.filterChip, filtroCargo === cargo && styles.filterChipActive]}
                      onPress={() => setFiltroCargo(cargo)}
                    >
                      {cargo === 'colaborador' && (
                        <Ionicons name="person" size={16} color={filtroCargo === cargo ? '#FFF' : '#1DCDFE'} />
                      )}
                      {cargo === 'jefe' && (
                        <Ionicons name="star" size={16} color={filtroCargo === cargo ? '#FFF' : '#34F5C5'} />
                      )}
                      <Text style={[styles.filterChipText, filtroCargo === cargo && styles.filterChipTextActive]}>
                        {cargo === 'todos' ? 'Todos' : cargo === 'colaborador' ? 'Colaborador' : 'Jefe'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <ScrollView style={styles.empleadosList}>
                {empleadosFiltrados.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={50} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No hay colaboradores con estos filtros</Text>
                  </View>
                ) : (
                  empleadosFiltrados.map((empleado) => (
                    <TouchableOpacity
                      key={empleado.idEmpl}
                      style={styles.empleadoCard}
                      onPress={() => {
                        Alert.alert(
                          'Confirmar Reasignación',
                          `¿Reasignar reporte a ${empleado.nomEmpl} ${empleado.apeEmpl}?`,
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Confirmar', onPress: () => reasignarReporte(empleado.idEmpl) }
                          ]
                        )
                      }}
                    >
                      <View style={styles.empleadoAvatar}>
                        <Text style={styles.empleadoInitials}>
                          {empleado.nomEmpl?.[0] || ''}{empleado.apeEmpl?.[0] || ''}
                        </Text>
                      </View>
                      <View style={styles.empleadoInfo}>
                        <Text style={styles.empleadoNombre}>
                          {empleado.nomEmpl} {empleado.apeEmpl}
                        </Text>
                        <Text style={styles.empleadoEmail}>{empleado.correoEmpl}</Text>
                        <View style={styles.empleadoBadges}>
                          <View style={[
                            styles.badge,
                            empleado.deptEmpl === 'mantenimiento'
                              ? styles.badgeMantenimiento
                              : styles.badgeSistemas
                          ]}>
                            <Text style={styles.badgeText}>
                              {empleado.deptEmpl === 'mantenimiento' ? '🔧' : '💻'} {empleado.deptEmpl}
                            </Text>
                          </View>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {empleado.cargEmpl === 'jefe' ? '⭐' : '👤'} {empleado.cargEmpl}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* ── NUEVO: Modal detalle completo ── */}
      <ReporteDetalleModal
        visible={detalleVisible}
        reporte={reporteDetalle}
        onClose={() => setDetalleVisible(false)}
      />
    </View>
  )
}
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native'
import { obtenerReportes, actualizarReporte } from '../../src/services/ReporteService'
import { obtenerSesion } from '../../src/util/Session'
import { Reporte } from '../../src/types/Database'

export default function HomeEmpleados() {
  const [empleado, setEmpleado] = useState<any>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)

  // Modal para establecer prioridad y tiempo
  const [modalVisible, setModalVisible] = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [prioridad, setPrioridad] = useState('')
  const [tiempoEstimado, setTiempoEstimado] = useState('')

  // Estadísticas de reportes asignados al empleado
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    resueltos: 0,
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const sesion = await obtenerSesion()
      setEmpleado(sesion?.data)

      // Cargar SOLO los reportes asignados a este empleado
      const { data: reportesData, error: reportesError } = await obtenerReportes()
      if (reportesError) throw reportesError

      // Filtrar solo los reportes asignados a este empleado
      const misReportes = (reportesData || []).filter(
        (r: Reporte) => r.idEmpl === sesion?.id
      )

      setReportes(misReportes)
      calcularEstadisticas(misReportes)

    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  const calcularEstadisticas = (data: Reporte[]) => {
    setStats({
      total: data.length,
      pendientes: data.filter(r => r.estReporte === 'Pendiente').length,
      enProceso: data.filter(r => r.estReporte === 'En Proceso').length,
      resueltos: data.filter(r => r.estReporte === 'Resuelto').length,
    })
  }

  const abrirModalPrioridad = (reporte: Reporte) => {
    setReporteSeleccionado(reporte)
    setPrioridad(reporte.prioReporte || '')
    setTiempoEstimado('') // Necesitarías agregar este campo en tu BD
    setModalVisible(true)
  }

  const guardarPrioridadYTiempo = async () => {
    if (!reporteSeleccionado) return

    try {
      await actualizarReporte(reporteSeleccionado.idReporte, {
        prioReporte: prioridad,
        // comentReporte: `Tiempo estimado: ${tiempoEstimado}` // Temporal hasta agregar campo
      })

      Alert.alert('Éxito', 'Prioridad y tiempo actualizados')
      setModalVisible(false)
      cargarDatos()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const cambiarEstado = async (idReporte: number, nuevoEstado: string) => {
    try {
      await actualizarReporte(idReporte, { estReporte: nuevoEstado })
      Alert.alert('Éxito', `Estado cambiado a ${nuevoEstado}`)
      cargarDatos()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }

  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#1DCDFE']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {empleado?.nomEmpl || 'Empleado'}</Text>
          <Text style={styles.role}>Tareas Asignadas</Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#1DCDFE' }]}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Asignadas</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFA726' }]}>
            <Text style={styles.statNumber}>{stats.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#21D0B2' }]}>
            <Text style={styles.statNumber}>{stats.enProceso}</Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#34F5C5' }]}>
            <Text style={styles.statNumber}>{stats.resueltos}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
        </View>

        {/* Lista de Tareas Asignadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Tareas</Text>
          {reportes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tienes tareas asignadas</Text>
              <Text style={styles.emptySubtext}>Las nuevas tareas aparecerán aquí</Text>
            </View>
          ) : (
            reportes.map((reporte) => (
              <View key={reporte.idReporte} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportId}>#{reporte.idReporte}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(reporte.estReporte) }
                  ]}>
                    <Text style={styles.statusText}>{reporte.estReporte}</Text>
                  </View>
                </View>

                <Text style={styles.reportDesc} numberOfLines={2}>
                  {reporte.descriReporte}
                </Text>

                <View style={styles.reportFooter}>
                  <Text style={styles.reportDate}>
                    {new Date(reporte.fecReporte).toLocaleDateString()}
                  </Text>
                  <Text style={[
                    styles.reportPriority,
                    { color: getPriorityColor(reporte.prioReporte) }
                  ]}>
                    {reporte.prioReporte || 'Sin prioridad'}
                  </Text>
                </View>

                {/* Solicitante */}
                {reporte.usuario && (
                  <View style={styles.requesterInfo}>
                    <Text style={styles.requesterLabel}>
                      Solicitado por: {reporte.usuario.nomUser} {reporte.usuario.apeUser}
                    </Text>
                  </View>
                )}

                {/* Acciones del Empleado */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.priorityButton}
                    onPress={() => abrirModalPrioridad(reporte)}
                  >
                    <Text style={styles.actionText}>⚡ Prioridad & Tiempo</Text>
                  </TouchableOpacity>

                  {reporte.estReporte === 'Pendiente' && (
                    <TouchableOpacity
                      style={[styles.statusButton, { backgroundColor: '#21D0B2' }]}
                      onPress={() => cambiarEstado(reporte.idReporte, 'En Proceso')}
                    >
                      <Text style={styles.statusButtonText}>Iniciar</Text>
                    </TouchableOpacity>
                  )}

                  {reporte.estReporte === 'En Proceso' && (
                    <TouchableOpacity
                      style={[styles.statusButton, { backgroundColor: '#34F5C5' }]}
                      onPress={() => cambiarEstado(reporte.idReporte, 'Resuelto')}
                    >
                      <Text style={styles.statusButtonText}>Completar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal para Prioridad y Tiempo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Establecer Prioridad y Tiempo</Text>

            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.priorityOptions}>
              {['Baja', 'Media', 'Alta', 'Urgente'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    prioridad === p && styles.priorityOptionActive
                  ]}
                  onPress={() => setPrioridad(p)}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    prioridad === p && styles.priorityOptionTextActive
                  ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Tiempo Estimado (horas)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2.5"
              keyboardType="decimal-pad"
              value={tiempoEstimado}
              onChangeText={setTiempoEstimado}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={guardarPrioridadYTiempo}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pendiente': return '#FFA726'
    case 'En Proceso': return '#21D0B2'
    case 'Resuelto': return '#34F5C5'
    default: return '#8B9BA8'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Urgente': return '#FF5252'
    case 'Alta': return '#FFA726'
    case 'Media': return '#21D0B2'
    case 'Baja': return '#8B9BA8'
    default: return '#8B9BA8'
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2F455C',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#34F5C5',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B9BA8',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F455C',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reportDesc: {
    fontSize: 14,
    color: '#2F455C',
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reportDate: {
    fontSize: 12,
    color: '#8B9BA8',
  },
  reportPriority: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  requesterInfo: {
    backgroundColor: '#F5F7FA',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  requesterLabel: {
    fontSize: 12,
    color: '#2F455C',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#1DCDFE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 8,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  priorityOptionActive: {
    borderColor: '#1DCDFE',
    backgroundColor: '#1DCDFE',
  },
  priorityOptionText: {
    fontSize: 12,
    color: '#2F455C',
    fontWeight: '600',
  },
  priorityOptionTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2F455C',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F7FA',
  },
  cancelButtonText: {
    color: '#2F455C',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#21D0B2',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
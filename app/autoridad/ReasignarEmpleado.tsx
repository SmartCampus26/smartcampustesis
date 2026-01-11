import React, { useState, useEffect } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../src/lib/Supabase'

interface Empleado {
  id_empl: number
  nomEmpl: string
  apeEmpl: string
  correoEmpl: string
  deptEmpl: string
  cargEmpl: string
}

interface Reporte {
  id_rep: number
  titulo_rep?: string
  desc_rep?: string
  id_empl?: number
}

export default function ReasignarEmpleado() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  
  // Filtros
  const [filtroDepto, setFiltroDepto] = useState<string>('todos')
  const [filtroCargo, setFiltroCargo] = useState<string>('todos')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)
    
    // Cargar empleados
    const { data: empData, error: empError } = await supabase
      .from('empleado')
      .select('*')
      .order('nomEmpl', { ascending: true })

    if (empError) {
      Alert.alert('Error', 'No se pudieron cargar los empleados')
      setCargando(false)
      return
    }

    // Cargar reportes
    const { data: repData, error: repError } = await supabase
      .from('reporte')
      .select('*')
      .order('id_rep', { ascending: false })

    if (repError) {
      Alert.alert('Error', 'No se pudieron cargar los reportes')
    }

    setEmpleados(empData || [])
    setReportes(repData || [])
    setCargando(false)
  }

  const abrirModalReasignacion = (reporte: Reporte) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  const reasignarReporte = async (empleadoId: number) => {
    if (!reporteSeleccionado) return

    const { error } = await supabase
      .from('reporte')
      .update({ id_empl: empleadoId })
      .eq('id_rep', reporteSeleccionado.id_rep)

    if (error) {
      Alert.alert('Error', 'No se pudo reasignar el reporte')
      return
    }

    Alert.alert('¡Éxito!', 'Reporte reasignado correctamente')
    setModalVisible(false)
    cargarDatos()
  }

  const empleadosFiltrados = empleados.filter(emp => {
    const pasaDepto = filtroDepto === 'todos' || emp.deptEmpl === filtroDepto
    const pasaCargo = filtroCargo === 'todos' || emp.cargEmpl === filtroCargo
    return pasaDepto && pasaCargo
  })

  const getEmpleadoNombre = (idEmpl?: number) => {
    if (!idEmpl) return 'Sin asignar'
    const emp = empleados.find(e => e.id_empl === idEmpl)
    return emp ? `${emp.nomEmpl} ${emp.apeEmpl}` : 'Desconocido'
  }

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={30} color="#1DCDFE" />
          <Text style={styles.statNumber}>{empleados.length}</Text>
          <Text style={styles.statLabel}>Empleados</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={30} color="#21D0B2" />
          <Text style={styles.statNumber}>{reportes.length}</Text>
          <Text style={styles.statLabel}>Reportes</Text>
        </View>
      </View>

      {/* Sección de Reportes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reportes Activos</Text>
        <Text style={styles.sectionSubtitle}>
          Selecciona un reporte para reasignar
        </Text>

        {reportes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>No hay reportes disponibles</Text>
          </View>
        ) : (
          reportes.map((reporte) => (
            <View key={reporte.id_rep} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>#{reporte.id_rep}</Text>
                </View>
                <Ionicons name="document-text-outline" size={24} color="#2F455C" />
              </View>

              <Text style={styles.reportTitle}>
                {reporte.titulo_rep || 'Sin título'}
              </Text>
              <Text style={styles.reportDesc} numberOfLines={2}>
                {reporte.desc_rep || 'Sin descripción'}
              </Text>

              <View style={styles.assignedContainer}>
                <Ionicons name="person-outline" size={16} color="#6B7280" />
                <Text style={styles.assignedText}>
                  Asignado a: {getEmpleadoNombre(reporte.id_empl)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.reassignButton}
                onPress={() => abrirModalReasignacion(reporte)}
              >
                <Ionicons name="swap-horizontal" size={20} color="#FFF" />
                <Text style={styles.reassignButtonText}>Reasignar Empleado</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Modal de Selección de Empleado */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Empleado</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Filtros */}
            <View style={styles.filtersContainer}>
              <Text style={styles.filterLabel}>Filtrar por:</Text>
              
              {/* Filtro Departamento */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filtroDepto === 'todos' && styles.filterChipActive
                  ]}
                  onPress={() => setFiltroDepto('todos')}
                >
                  <Text style={[
                    styles.filterChipText,
                    filtroDepto === 'todos' && styles.filterChipTextActive
                  ]}>Todos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filtroDepto === 'mantenimiento' && styles.filterChipActive
                  ]}
                  onPress={() => setFiltroDepto('mantenimiento')}
                >
                  <Ionicons 
                    name="hammer" 
                    size={16} 
                    color={filtroDepto === 'mantenimiento' ? '#FFF' : '#21D0B2'} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    filtroDepto === 'mantenimiento' && styles.filterChipTextActive
                  ]}>Mantenimiento</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filtroDepto === 'sistemas' && styles.filterChipActive
                  ]}
                  onPress={() => setFiltroDepto('sistemas')}
                >
                  <Ionicons 
                    name="desktop" 
                    size={16} 
                    color={filtroDepto === 'sistemas' ? '#FFF' : '#2F455C'} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    filtroDepto === 'sistemas' && styles.filterChipTextActive
                  ]}>Sistemas</Text>
                </TouchableOpacity>
              </View>

              {/* Filtro Cargo */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filtroCargo === 'todos' && styles.filterChipActive
                  ]}
                  onPress={() => setFiltroCargo('todos')}
                >
                  <Text style={[
                    styles.filterChipText,
                    filtroCargo === 'todos' && styles.filterChipTextActive
                  ]}>Todos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filtroCargo === 'empleado' && styles.filterChipActive
                  ]}
                  onPress={() => setFiltroCargo('empleado')}
                >
                  <Ionicons 
                    name="person" 
                    size={16} 
                    color={filtroCargo === 'empleado' ? '#FFF' : '#1DCDFE'} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    filtroCargo === 'empleado' && styles.filterChipTextActive
                  ]}>Empleado</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filtroCargo === 'jefe' && styles.filterChipActive
                  ]}
                  onPress={() => setFiltroCargo('jefe')}
                >
                  <Ionicons 
                    name="star" 
                    size={16} 
                    color={filtroCargo === 'jefe' ? '#FFF' : '#34F5C5'} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    filtroCargo === 'jefe' && styles.filterChipTextActive
                  ]}>Jefe</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Lista de Empleados */}
            <ScrollView style={styles.empleadosList}>
              {empleadosFiltrados.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={50} color="#9CA3AF" />
                  <Text style={styles.emptyText}>
                    No hay empleados con estos filtros
                  </Text>
                </View>
              ) : (
                empleadosFiltrados.map((empleado) => (
                  <TouchableOpacity
                    key={empleado.id_empl}
                    style={styles.empleadoCard}
                    onPress={() => {
                      Alert.alert(
                        'Confirmar Reasignación',
                        `¿Reasignar reporte a ${empleado.nomEmpl} ${empleado.apeEmpl}?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { 
                            text: 'Confirmar', 
                            onPress: () => reasignarReporte(empleado.id_empl) 
                          }
                        ]
                      )
                    }}
                  >
                    <View style={styles.empleadoAvatar}>
                      <Text style={styles.empleadoInitials}>
                        {empleado.nomEmpl[0]}{empleado.apeEmpl[0]}
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2F455C',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reportBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1DCDFE',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 8,
  },
  reportDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  assignedText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  reassignButton: {
    backgroundColor: '#1DCDFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  reassignButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F455C',
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: '#F8FAFB',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#1DCDFE',
    borderColor: '#1DCDFE',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F455C',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  empleadosList: {
    maxHeight: 400,
  },
  empleadoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  empleadoAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1DCDFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  empleadoInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  empleadoInfo: {
    flex: 1,
  },
  empleadoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 4,
  },
  empleadoEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  empleadoBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  badgeMantenimiento: {
    backgroundColor: '#DCFCE7',
  },
  badgeSistemas: {
    backgroundColor: '#E0E7FF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2F455C',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
})
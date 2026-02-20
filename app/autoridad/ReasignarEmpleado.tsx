// Importa React y los hooks useState y useEffect
// useState permite manejar estados dentro del componente
// useEffect permite ejecutar código cuando el componente se monta
import React, { useState, useEffect } from 'react'

// Importa componentes nativos de React Native
import {
  Alert,              // Permite mostrar alertas emergentes
  ScrollView,         // Permite contenido con scroll vertical
  StyleSheet,         // Permite definir estilos (NO documentamos styles)
  Text,               // Muestra texto en pantalla
  TouchableOpacity,   // Botón presionable
  View,               // Contenedor visual
  ActivityIndicator,  // Indicador de carga (spinner)
  Modal,              // Ventana emergente
} from 'react-native'

// Importa iconos de Expo
import { Ionicons } from '@expo/vector-icons'

// Importa la instancia de Supabase para conexión con la base de datos
import { supabase } from '../../src/lib/Supabase'

// Importa los tipos TypeScript de la base de datos
import { Empleado, Reporte } from '../../src/types/Database'

// Importa función para obtener la sesión activa
import { obtenerSesion } from '@/src/util/Session'

// Exporta el componente principal
export default function ReasignarEmpleado() {

  // ===================== ESTADOS =====================

  // Guarda la lista de empleados
  const [empleados, setEmpleados] = useState<Empleado[]>([])

  // Guarda la lista de reportes
  const [reportes, setReportes] = useState<Reporte[]>([])

  // Controla si la pantalla está cargando información
  const [cargando, setCargando] = useState(true)

  // Controla si el modal está visible
  const [modalVisible, setModalVisible] = useState(false)

  // Guarda el reporte seleccionado para reasignar
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  
  // Guarda el nombre de la autoridad que realiza la reasignación
  const [nombreAutoridad, setNombreAutoridad] = useState<string>('Sistema')

  // ===================== FILTROS =====================

  // Filtro por departamento
  const [filtroDepto, setFiltroDepto] = useState<string>('todos')

  // Filtro por cargo
  const [filtroCargo, setFiltroCargo] = useState<string>('todos')

  // ===================== CARGA INICIAL =====================

  // useEffect se ejecuta una sola vez cuando el componente se monta
  useEffect(() => {

    // Función asincrónica para inicializar la pantalla
    const inicializarPantalla = async () => {

      // Activa el indicador de carga
      setCargando(true)

      // Ejecuta ambas funciones en paralelo para optimizar rendimiento
      await Promise.all([
        cargarDatos(),        // Carga empleados y reportes
        cargarDatosSesion()   // Carga datos de sesión
      ])

      // Desactiva el indicador de carga
      setCargando(false)
    }

    // Ejecuta la inicialización
    inicializarPantalla()

  }, []) // Array vacío = solo se ejecuta al montar el componente

  // ===================== CARGAR SESIÓN =====================

  const cargarDatosSesion = async () => {
    try {

      // Obtiene la sesión guardada
      const sesion = await obtenerSesion()

      // Si existe sesión
      if (sesion) {

        // Si es usuario
        if (sesion.tipo === 'usuario') {
          setNombreAutoridad(`${sesion.data.nomUser} ${sesion.data.apeUser}`)
        } 

        // Si es empleado
        else if (sesion.tipo === 'empleado') {
          setNombreAutoridad(`${sesion.data.nomEmpl} ${sesion.data.apeEmpl}`)
        }
      }

    } catch (error) {
      // Si ocurre error lo muestra en consola
      console.error('Error al recuperar sesión:', error)
    }
  }

  // ===================== CARGAR DATOS =====================

  const cargarDatos = async () => {

    // Consulta tabla empleado
    const { data: empData, error: empError } = await supabase
      .from('empleado')        // Selecciona tabla empleado
      .select('*')             // Selecciona todos los campos
      .order('nomEmpl', { ascending: true }) // Ordena por nombre

    // Si hay error
    if (empError) {
      Alert.alert('Error', 'No se pudieron cargar los empleados: ' + empError.message)
      return
    }

    // Consulta tabla reporte
    const { data: repData, error: repError } = await supabase
      .from('reporte')         // Tabla reporte
      .select('*')             // Todos los campos
      .order('idReporte', { ascending: false }) // Orden descendente

    // Si hay error
    if (repError) {
      Alert.alert('Error', 'No se pudieron cargar los reportes: ' + repError.message)
    }

    // Guarda empleados en el estado
    setEmpleados(empData || [])

    // Guarda reportes en el estado
    setReportes(repData || [])
  }

  // ===================== ABRIR MODAL =====================

  const abrirModalReasignacion = (reporte: Reporte) => {
    setReporteSeleccionado(reporte) // Guarda reporte seleccionado
    setModalVisible(true)           // Muestra el modal
  }

  // ===================== REASIGNAR REPORTE =====================

  const reasignarReporte = async (empleadoId: string) => {

    // Si no hay reporte seleccionado, no hace nada
    if (!reporteSeleccionado) return

    // 1️⃣ Actualiza base de datos
    const { error } = await supabase
      .from('reporte')
      .update({ idEmpl: empleadoId }) // Cambia el empleado asignado
      .eq('idReporte', reporteSeleccionado.idReporte)

    // Si hay error
    if (error) {
      Alert.alert('Error', 'No se pudo reasignar: ' + error.message)
      return
    }

    // 2️⃣ Envía notificación mediante Edge Function
    try {
      await supabase.functions.invoke('notificar-reasignacion-reporte', {
        body: {
          idReporte: reporteSeleccionado.idReporte,
          idEmpleadoNuevo: empleadoId,
          nombreAutoridad: nombreAutoridad 
        }
      })
    } catch (notifError) {
      console.error('Error al enviar notificación:', notifError)
    }

    // Muestra mensaje de éxito
    Alert.alert('¡Éxito!', 'Reporte reasignado correctamente')

    // Cierra modal
    setModalVisible(false)

    // Recarga datos
    cargarDatos()
  }

  // ===================== FILTRO DE EMPLEADOS =====================

  const empleadosFiltrados = empleados.filter(emp => {

    // Verifica departamento
    const pasaDepto = filtroDepto === 'todos' || emp.deptEmpl === filtroDepto

    // Verifica cargo
    const pasaCargo = filtroCargo === 'todos' || emp.cargEmpl === filtroCargo

    // Retorna solo si cumple ambos filtros
    return pasaDepto && pasaCargo
  })

  // ===================== OBTENER NOMBRE DE EMPLEADO =====================

  const getEmpleadoNombre = (idEmpl?: string) => {

    // Si no tiene empleado asignado
    if (!idEmpl) return 'Sin asignar'

    // Busca empleado por ID
    const emp = empleados.find(e => e.idEmpl === idEmpl)

    // Si existe lo devuelve, si no devuelve "Desconocido"
    return emp ? `${emp.nomEmpl} ${emp.apeEmpl}` : 'Desconocido'
  }

  // ===================== PANTALLA DE CARGA =====================

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    )
  }

  // ===================== RENDER PRINCIPAL =====================

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
            <View key={reporte.idReporte} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>#{reporte.idReporte}</Text>
                </View>
                <Ionicons name="document-text-outline" size={24} color="#2F455C" />
              </View>

              <Text style={styles.reportTitle}>
                Reporte #{reporte.idReporte}
              </Text>
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
                  Asignado a: {getEmpleadoNombre(reporte.idEmpl)}
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
                    key={empleado.idEmpl}
                    style={styles.empleadoCard}
                    onPress={() => {
                      Alert.alert(
                        'Confirmar Reasignación',
                        `¿Reasignar reporte a ${empleado.nomEmpl} ${empleado.apeEmpl}?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { 
                            text: 'Confirmar', 
                            onPress: () => reasignarReporte(empleado.idEmpl) 
                          }
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
  )
}

// ESTILOS (Sin cambios)
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
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badgeEstado: {
    backgroundColor: '#DCFCE7',
  },
  badgePrioridad: {
    backgroundColor: '#FEF3C7',
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
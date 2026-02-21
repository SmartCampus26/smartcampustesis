// Importa React y los hooks useState y useEffect
// useState permite manejar estados dentro del componente
// useEffect permite ejecutar código cuando el componente se monta
import React, { useEffect, useState } from 'react'

// Importa componentes nativos de React Native
import {
  ActivityIndicator,
  Alert, // Indicador de carga (spinner)
  Modal, // Permite mostrar alertas emergentes
  ScrollView, // Permite contenido con scroll vertical
  Text, // Muestra texto en pantalla
  TouchableOpacity, // Botón presionable
  View, // Contenedor visual
} from 'react-native'

// Importa iconos de Expo
import { Ionicons } from '@expo/vector-icons'

// Importa los tipos TypeScript de la base de datos
import { Empleado, Reporte } from '../../src/types/Database'

// Importa estilos separados
import { styles } from '../../src/components/Reasignarempleadostyles'

// Importa la lógica de negocio separada
import {
  cargarNombreAutoridad,
  cargarEmpleadosYReportes,
  reasignarReporteDB,
  filtrarEmpleados,
  getEmpleadoNombre,
} from '../../src/services/Reasignarempleadoservice'

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
        cargarDatos(),       // Carga empleados y reportes
        cargarSesion()       // Carga datos de sesión
      ])

      // Desactiva el indicador de carga
      setCargando(false)
    }

    // Ejecuta la inicialización
    inicializarPantalla()

  }, []) // Array vacío = solo se ejecuta al montar el componente

  // ===================== CARGAR SESIÓN =====================

  const cargarSesion = async () => {
    const nombre = await cargarNombreAutoridad()
    setNombreAutoridad(nombre)
  }

  // ===================== CARGAR DATOS =====================

  const cargarDatos = async () => {
    try {
      const { empleados: empData, reportes: repData } = await cargarEmpleadosYReportes()

      // Guarda empleados en el estado
      setEmpleados(empData)

      // Guarda reportes en el estado
      setReportes(repData)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
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

    try {
      await reasignarReporteDB(reporteSeleccionado.idReporte, empleadoId, nombreAutoridad)

      // Muestra mensaje de éxito
      Alert.alert('¡Éxito!', 'Reporte reasignado correctamente')

      // Cierra modal
      setModalVisible(false)

      // Recarga datos
      cargarDatos()
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  // ===================== FILTRO DE EMPLEADOS =====================

  // Aplica filtros de departamento y cargo sobre la lista de empleados
  const empleadosFiltrados = filtrarEmpleados(empleados, filtroDepto, filtroCargo)

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

              <Text style={styles.reportTitle}>Reporte #{reporte.idReporte}</Text>
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

              {/* Fila filtros de departamento */}
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

              {/* Fila filtros de cargo */}
              <View style={styles.filterRow}>
                {(['todos', 'empleado', 'jefe'] as const).map((cargo) => (
                  <TouchableOpacity
                    key={cargo}
                    style={[styles.filterChip, filtroCargo === cargo && styles.filterChipActive]}
                    onPress={() => setFiltroCargo(cargo)}
                  >
                    {cargo === 'empleado' && (
                      <Ionicons name="person" size={16} color={filtroCargo === cargo ? '#FFF' : '#1DCDFE'} />
                    )}
                    {cargo === 'jefe' && (
                      <Ionicons name="star" size={16} color={filtroCargo === cargo ? '#FFF' : '#34F5C5'} />
                    )}
                    <Text style={[styles.filterChipText, filtroCargo === cargo && styles.filterChipTextActive]}>
                      {cargo === 'todos' ? 'Todos' : cargo === 'empleado' ? 'Empleado' : 'Jefe'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Lista de Empleados */}
            <ScrollView style={styles.empleadosList}>
              {empleadosFiltrados.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={50} color="#9CA3AF" />
                  <Text style={styles.emptyText}>No hay empleados con estos filtros</Text>
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
  )
}
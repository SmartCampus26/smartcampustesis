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
} from 'react-native'
import { obtenerReportes } from '../../src/services/ReporteService'
import { obtenerSesion } from '../../src/util/Session'
import { Reporte } from '../../src/types/Database'

export default function HomeDocentes() {
  const [usuario, setUsuario] = useState<any>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)

  // Estadísticas SOLO de reportes del usuario
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
      setUsuario(sesion?.data)

      // Cargar SOLO los reportes del usuario actual
      const { data: reportesData, error: reportesError } = await obtenerReportes()
      if (reportesError) throw reportesError

      // Filtrar solo los reportes creados por este usuario
      const misReportes = (reportesData || []).filter(
        (r: Reporte) => r.idUser === sesion?.id
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

  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }

  const handleCrearReporte = () => {
    // Navegar a pantalla de crear reporte
    Alert.alert('Crear Reporte', 'Navegando a formulario de nuevo reporte...')
    // navigation.navigate('CrearReporte')
  }

  const handleVerTodos = () => {
    // Navegar a lista completa de reportes
    Alert.alert('Ver Reportes', 'Navegando a lista completa...')
    // navigation.navigate('ListaReportes', { idUser: usuario?.idUser })
  }

  const handleVerDetalle = (reporte: Reporte) => {
    // Navegar a detalle del reporte
    Alert.alert('Detalle', `Viendo reporte #${reporte.idReporte}`)
    // navigation.navigate('DetalleReporte', { idReporte: reporte.idReporte })
  }

  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#1DCDFE']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {usuario?.nomUser || 'Docente'}</Text>
        <Text style={styles.role}>Mis Reportes</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#1DCDFE' }]}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Mis Reportes</Text>
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
          <Text style={styles.statLabel}>Resueltos</Text>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleCrearReporte}>
          <Text style={styles.actionButtonText}>➕ Crear Nuevo Reporte</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#21D0B2' }]}
          onPress={handleVerTodos}
        >
          <Text style={styles.actionButtonText}>📋 Ver Todos Mis Reportes</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Mis Reportes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reportes Recientes</Text>
        {reportes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No tienes reportes aún</Text>
            <Text style={styles.emptySubtext}>Crea tu primer reporte para comenzar</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={handleCrearReporte}
            >
              <Text style={styles.emptyButtonText}>Crear Reporte</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reportes.slice(0, 5).map((reporte) => (
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
                  📅 {new Date(reporte.fecReporte).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
                <View style={styles.priorityContainer}>
                  <Text style={[
                    styles.reportPriority,
                    { color: getPriorityColor(reporte.prioReporte) }
                  ]}>
                    {reporte.prioReporte ? `🔥 ${reporte.prioReporte}` : '⚪ Sin prioridad'}
                  </Text>
                </View>
              </View>

              {/* Info del empleado asignado */}
              {reporte.empleado ? (
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeLabel}>
                    👤 Asignado a: {reporte.empleado.nomEmpl} {reporte.empleado.apeEmpl}
                  </Text>
                  <Text style={styles.employeeDept}>
                    {reporte.empleado.deptEmpl} - {reporte.empleado.cargEmpl}
                  </Text>
                </View>
              ) : (
                <View style={[styles.employeeInfo, styles.noEmployeeInfo]}>
                  <Text style={styles.noEmployeeText}>
                    ⏳ Pendiente de asignación
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                style={styles.detailButton}
                onPress={() => handleVerDetalle(reporte)}
              >
                <Text style={styles.detailText}>Ver Detalles →</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {reportes.length > 5 && (
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={handleVerTodos}
          >
            <Text style={styles.viewMoreText}>
              Ver todos ({reportes.length - 5} más)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tips para docentes */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Consejos</Text>
        <Text style={styles.tipsText}>
          • Crea reportes detallados para una mejor atención{'\n'}
          • Puedes hacer seguimiento del progreso de tus solicitudes{'\n'}
          • Los empleados actualizarán el estado de tus reportes{'\n'}
          • Recibirás notificaciones cuando cambien de estado
        </Text>
      </View>

      {/* Espacio inferior */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
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
  actionButton: {
    backgroundColor: '#1DCDFE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#1DCDFE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportDate: {
    fontSize: 12,
    color: '#8B9BA8',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportPriority: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  employeeInfo: {
    backgroundColor: '#F5F7FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#21D0B2',
  },
  employeeLabel: {
    fontSize: 13,
    color: '#2F455C',
    fontWeight: '600',
    marginBottom: 4,
  },
  employeeDept: {
    fontSize: 11,
    color: '#8B9BA8',
  },
  noEmployeeInfo: {
    borderLeftColor: '#FFA726',
    backgroundColor: '#FFF8F0',
  },
  noEmployeeText: {
    fontSize: 13,
    color: '#FFA726',
    fontWeight: '600',
  },
  detailButton: {
    padding: 8,
    alignItems: 'center',
  },
  detailText: {
    color: '#1DCDFE',
    fontSize: 14,
    fontWeight: '600',
  },
  viewMoreButton: {
    backgroundColor: '#F5F7FA',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1DCDFE',
  },
  viewMoreText: {
    color: '#1DCDFE',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#2F455C',
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 40,
  },
})
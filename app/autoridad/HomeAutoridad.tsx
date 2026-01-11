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
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { obtenerReportes, actualizarReporte } from '../../src/services/ReporteService'
import { obtenerEmpleados } from '../../src/services/EmpleadoService'
import { obtenerSesion } from '../../src/util/Session'
import { Reporte, Empleado } from '../../src/types/Database'

export default function HomeAutoridad() {
  const [usuario, setUsuario] = useState<any>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)

  // Estadísticas
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

      // Cargar todos los reportes (autoridades ven todo)
      const { data: reportesData, error: reportesError } = await obtenerReportes()
      if (reportesError) throw reportesError

      setReportes(reportesData || [])
      calcularEstadisticas(reportesData || [])

      // Cargar empleados para reasignación
      const { data: empData, error: empError } = await obtenerEmpleados()
      if (empError) throw empError
      setEmpleados(empData || [])

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

  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
        <Text style={styles.loadingText}>Cargando panel...</Text>
      </View>
    )
  }

  // Obtener reportes recientes (últimos 5)
  const reportesRecientes = reportes.slice(0, 5)

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#1DCDFE']} />
      }
    >
      {/* Header con gradiente */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>¡Hola, {usuario?.nomUser || 'Autoridad'}! 👋</Text>
            <Text style={styles.role}>Panel de Control de Autoridades</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="shield-checkmark" size={32} color="#34F5C5" />
          </View>
        </View>
      </View>

      {/* Estadísticas en Grid */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="document-text" size={28} color="#1DCDFE" />
          </View>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Reportes</Text>
        </View>

        <View style={[styles.statCard, styles.statCardWarning]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time" size={28} color="#FFA726" />
          </View>
          <Text style={styles.statNumber}>{stats.pendientes}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>

        <View style={[styles.statCard, styles.statCardInfo]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="hourglass" size={28} color="#21D0B2" />
          </View>
          <Text style={styles.statNumber}>{stats.enProceso}</Text>
          <Text style={styles.statLabel}>En Proceso</Text>
        </View>

        <View style={[styles.statCard, styles.statCardSuccess]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkmark-circle" size={28} color="#34F5C5" />
          </View>
          <Text style={styles.statNumber}>{stats.resueltos}</Text>
          <Text style={styles.statLabel}>Resueltos</Text>
        </View>
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/autoridad/ReporteAutoridad')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="add-circle" size={24} color="#FFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionButtonText}>Crear Nuevo Reporte</Text>
            <Text style={styles.actionButtonSubtext}>Reportar una nueva incidencia</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

       
      </View>
     
      {/* Información adicional */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#1DCDFE" />
        <Text style={styles.infoText}>
          Como autoridad, tienes acceso completo a todos los reportes del sistema y puedes gestionar empleados.
        </Text>
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  centeredContainer: {
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
    backgroundColor: '#2F455C',
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  role: {
    fontSize: 15,
    color: '#34F5C5',
    fontWeight: '600',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(52, 245, 197, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#1DCDFE',
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: '#21D0B2',
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#34F5C5',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F455C',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1DCDFE',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DCDFE',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonSecondary: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionIconSecondary: {
    backgroundColor: '#F8FAFB',
  },
  actionContent: {
    flex: 1,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  actionButtonTextSecondary: {
    color: '#2F455C',
  },
  actionButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
  },
  actionButtonSubtextSecondary: {
    color: '#6B7280',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  reportBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1DCDFE',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reportTitle: {
    fontSize: 15,
    color: '#2F455C',
    fontWeight: '600',
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F455C',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2F455C',
    lineHeight: 18,
  },
})
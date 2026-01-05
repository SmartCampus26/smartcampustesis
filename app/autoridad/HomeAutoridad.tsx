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
import { obtenerReportes, actualizarReporte } from '../../src/services/ReporteService'
import { obtenerEmpleados } from '../../src/services/EmpleadoService'
import { obtenerSesion } from '../../src/util/Session'
import { Reporte, Empleado } from '../../src/types/Database'

export default function HomeAutoridades() {
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

  const handleReasignar = (reporte: Reporte) => {
    // Aquí abrir modal para seleccionar nuevo empleado
    Alert.alert(
      'Reasignar Empleado',
      `Reporte #${reporte.idReporte}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        ...empleados.map(emp => ({
          text: `${emp.nomEmpl} ${emp.apeEmpl}`,
          onPress: () => reasignarEmpleado(reporte.idReporte, emp.idEmpl)
        }))
      ]
    )
  }

  const reasignarEmpleado = async (idReporte: number, idEmpl: number) => {
    try {
      await actualizarReporte(idReporte, { idEmpl })
      Alert.alert('Éxito', 'Empleado reasignado correctamente')
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#1DCDFE']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {usuario?.nomUser || 'Autoridad'}</Text>
        <Text style={styles.role}>Panel de Autoridades</Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#1DCDFE' }]}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Reportes</Text>
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
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>➕ Crear Nuevo Reporte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#21D0B2' }]}>
          <Text style={styles.actionButtonText}>📊 Ver Todos los Reportes</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Reportes Recientes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reportes Recientes</Text>
        {reportes.slice(0, 5).map((reporte) => (
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
              <Text style={styles.reportPriority}>
                Prioridad: {reporte.prioReporte || 'Sin definir'}
              </Text>
            </View>

            {/* Botón de Reasignación */}
            <TouchableOpacity
              style={styles.reassignButton}
              onPress={() => handleReasignar(reporte)}
            >
              <Text style={styles.reassignText}>🔄 Reasignar Empleado</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  },
  actionButtonText: {
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
    color: '#8B9BA8',
    fontWeight: '600',
  },
  reassignButton: {
    backgroundColor: '#F5F7FA',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1DCDFE',
  },
  reassignText: {
    color: '#1DCDFE',
    fontSize: 14,
    fontWeight: '600',
  },
})
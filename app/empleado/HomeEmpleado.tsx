// Importa React y hooks para manejar estado y efectos
import React, { useState, useEffect } from 'react'
// Componentes visuales de React Native
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
// Servicios para manejar reportes
import { obtenerReportes } from '../../src/services/ReporteService'
// Manejo de sesión del empleado
import { obtenerSesion } from '../../src/util/Session'
// Tipo de datos Reporte
import { Reporte } from '../../src/types/Database'
// Servicio PDF
import { generarPDF } from '../../src/services/PdfService'

// COMPONENTE PRINCIPAL
export default function HomeEmpleados() {
  // ===== ESTADOS PRINCIPALES =====

  // Información del empleado en sesión
  const [empleado, setEmpleado] = useState<any>(null)
  // Lista de reportes asignados al empleado
  const [reportes, setReportes] = useState<Reporte[]>([])
  // Estados de carga
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)

  // Se ejecuta al cargar la pantalla
  useEffect(() => {
    cargarDatos()
  }, [])

  // CARGA DE DATOS
  const cargarDatos = async () => {
    try {
      // Obtiene la sesión actual
      const sesion = await obtenerSesion()
      setEmpleado(sesion?.data)

      // Obtiene todos los reportes
      const { data: reportesData, error: reportesError } = await obtenerReportes()
      if (reportesError) throw reportesError

      // Filtra solo los reportes asignados al empleado
      const misReportes = (reportesData || []).filter(
        (r: Reporte) => r.idEmpl === sesion?.id
      )

      setReportes(misReportes)

    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  // Refrescar con gesto de deslizamiento
  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }

  // ===== Función para imprimir PDF =====
  const imprimirPDF = async () => {
    try {
      await generarPDF(reportes, {
        titulo: 'Mis Tareas Asignadas',
        incluirEmpleado: false, 
        incluirUsuario: true,
      })
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message ?? 'No se pudo generar el PDF'
      )
    }
  }

  // PANTALLA DE CARGA
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
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {empleado?.nomEmpl || 'Empleado'}</Text>
          <Text style={styles.role}>Tareas Asignadas</Text>
        </View>

        {/* ===== Botón Imprimir PDF ===== */}
        <View style={{ padding: 16, marginBottom: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#FF5252',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            onPress={imprimirPDF}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
              Imprimir PDF
            </Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE REPORTES */}
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

                {reporte.usuario && (
                  <View style={styles.requesterInfo}>
                    <Text style={styles.requesterLabel}>
                      Solicitado por: {reporte.usuario.nomUser} {reporte.usuario.apeUser}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  )
}

// FUNCIONES AUXILIARES
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
  // Mantengo estos estilos por si los necesitas después, aunque ya no se usan en el JSX
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
})
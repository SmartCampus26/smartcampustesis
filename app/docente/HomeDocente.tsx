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
// Iconos
import { Ionicons } from '@expo/vector-icons'
// Navegación entre pantallas
import { router } from 'expo-router'
// Servicios para obtener datos desde la base de datos
import { obtenerReportes } from '../../src/services/ReporteService'
import { obtenerSesion } from '../../src/util/Session'
// Tipo de dato Reporte
import { Reporte } from '../../src/types/Database'
// Manejo seguro del área superior (notch, barra de estado)
import { SafeAreaView } from 'react-native-safe-area-context'


export default function HomeDocente() {
  // ESTADOS (variables reactivas)

  // Información del usuario logueado
  const [usuario, setUsuario] = useState<any>(null)
  // Lista de reportes creados por el usuario
  const [reportes, setReportes] = useState<Reporte[]>([])
  // Controla si los datos están cargando
  const [cargando, setCargando] = useState(true)
  // Controla la animación de refrescar
  const [refrescando, setRefrescando] = useState(false)
  // Estadísticas de los reportes del usuario
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    resueltos: 0,
  })

  // EFECTO: se ejecuta al abrir la pantalla
  useEffect(() => {
    cargarDatos()
  }, [])

  // FUNCIÓN: Cargar datos del usuario y reportes
  const cargarDatos = async () => {
    try {
      // Obtener la sesión del usuario
      const sesion = await obtenerSesion()
      setUsuario(sesion?.data)

      // Obtener todos los reportes
      const { data: reportesData, error: reportesError } = await obtenerReportes()
      if (reportesError) throw reportesError

      // Filtrar solo los reportes creados por este usuario
      const misReportes = (reportesData || []).filter(
        (r: Reporte) => r.idUser === sesion?.id
      )
      
      // Guardar reportes y calcular estadísticas
      setReportes(misReportes)
      calcularEstadisticas(misReportes)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      // Finaliza estados de carga
      setCargando(false)
      setRefrescando(false)
    }
  }

   // FUNCIÓN: Calcular estadísticas de reportes
  const calcularEstadisticas = (data: Reporte[]) => {
    setStats({
      total: data.length,
      pendientes: data.filter(r => r.estReporte === 'pendiente').length,
      enProceso: data.filter(r => r.estReporte === 'en proceso').length,
      resueltos: data.filter(r => r.estReporte === 'resuelto').length,
    })
  }

  // FUNCIÓN: Refrescar datos manualmente
  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }

  // FUNCIÓN: Ir a la pantalla de crear reporte
  const handleCrearReporte = () => {
    router.push('/docente/ReporteUsuario')
  }

  // PANTALLA DE CARGA
  if (cargando) {
    return (
      <SafeAreaView style={styles.centeredContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#21D0B2" />
      </SafeAreaView>
    )
  }

  // INTERFAZ PRINCIPAL
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#21D0B2']} />
        }
      >
        {/* ===== ENCABEZADO ===== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.username}>{usuario?.nomUser || 'Usuario'}</Text>
          </View>
          {/* Botón de notificaciones */}
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => Alert.alert('Notificaciones', 'Función próximamente')}
          >
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            {/* Indicador visual que muestra la cantidad de reportes pendientes */}
            {stats.pendientes > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.pendientes}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ===== TARJETAS DE ESTADÍSTICAS ====== */}
        <View style={styles.statsContainer}>
          {/* Total */}
          <View style={[styles.statCard, { backgroundColor: '#21D0B2' }]}>
            <Ionicons name="documents-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          {/* Pendientes */}
          <View style={[styles.statCard, { backgroundColor: '#FFA726' }]}>
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          
          {/* En proceso */}
          <View style={[styles.statCard, { backgroundColor: '#42A5F5' }]}>
            <Ionicons name="sync-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.enProceso}</Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </View>
          
          {/* Resueltos */}
          <View style={[styles.statCard, { backgroundColor: '#66BB6A' }]}>
            <Ionicons name="checkmark-circle-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.resueltos}</Text>
            <Text style={styles.statLabel}>Resueltos</Text>
          </View>
        </View>

        {/* ==== BOTÓN CREAR REPORTE ===== */}
        {/* Permite al docente acceder al formulario de creación de reportes */}
        <View style={styles.createSection}>
          <TouchableOpacity style={styles.createButton} onPress={handleCrearReporte}>
            <View style={styles.createButtonContent}>
              {/* Ícono visual del botón */}
              <View style={styles.createIcon}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
              {/* Texto descriptivo del botón */}
              <View style={styles.createTextContainer}>
                <Text style={styles.createTitle}>Crear Nuevo Reporte</Text>
                <Text style={styles.createSubtitle}>Reporta un problema o solicitud</Text>
              </View>
              {/* Flecha que indica navegación */}
              <Ionicons name="chevron-forward" size={24} color="#21D0B2" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* ==== SECCIÓN: REPORTES RECIENTES ==== */}
        {/* Muestra los últimos reportes creados por el docente */}
        <View style={styles.section}>
          {/* Encabezado de la sección */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reportes Recientes</Text>
            {/* Botón para ver todos los reportes */}
            <TouchableOpacity onPress={() => router.push('/docente/MisReportes')}>
              <Text style={styles.seeAllText}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
          
          {/* Estado vacío: cuando no existen reportes */}
          {reportes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#E1E8ED" />
              <Text style={styles.emptyText}>No tienes reportes aún</Text>
              <Text style={styles.emptySubtext}>Crea tu primer reporte para comenzar</Text>
              {/* Botón alternativo para crear reporte */}
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={handleCrearReporte}
              >
                <Text style={styles.emptyButtonText}>Crear Reporte</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Lista de los últimos 3 reportes */
            reportes.slice(0, 3).map((reporte) => (
              <TouchableOpacity 
                key={reporte.idReporte} 
                style={styles.reportCard}
                onPress={() => Alert.alert('Detalle', `Reporte #${reporte.idReporte}`)}
              >
                {/* Encabezado del reporte */}
                <View style={styles.reportHeader}>
                  <Text style={styles.reportId}>#{reporte.idReporte}</Text>
                   {/* Estado del reporte */}
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(reporte.estReporte) }
                  ]}>
                    <Text style={styles.statusText}>{reporte.estReporte}</Text>
                  </View>
                </View>
                
                {/* Descripción breve del reporte */}
                <Text style={styles.reportDesc} numberOfLines={2}>
                  {reporte.descriReporte}
                </Text>
                
                {/* Fecha y prioridad */}
                <View style={styles.reportFooter}>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={14} color="#8B9BA8" />
                    <Text style={styles.reportDate}>
                      {new Date(reporte.fecReporte).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  {/* Prioridad del reporte (si existe) */}
                  {reporte.prioReporte && reporte.prioReporte !== 'no asignada' && (
                    <View style={styles.priorityContainer}>
                      <Ionicons 
                        name="flag" 
                        size={14} 
                        color={getPriorityColor(reporte.prioReporte)} 
                      />
                      <Text style={[
                        styles.reportPriority,
                        { color: getPriorityColor(reporte.prioReporte) }
                      ]}>
                        {reporte.prioReporte}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ==== SECCIÓN DE CONSEJOS ===== */}
        {/* Muestra recomendaciones al usuario */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FFA726" />
            <Text style={styles.tipsTitle}>Consejo del día</Text>
          </View>
          <Text style={styles.tipsText}>
            Proporciona la mayor cantidad de detalles posibles al crear un reporte. Esto ayudará a que tu solicitud sea atendida más rápidamente.
          </Text>
        </View>
        
        {/* Espacio inferior para evitar que el contenido quede cortado */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  )
}
// FUNCIONES AUXILIARES
// Color según estado del reporte
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pendiente': return '#FFA726'//amarillo
    case 'en proceso': return '#42A5F5'//celeste
    case 'resuelto': return '#66BB6A'//verde
    default: return '#8B9BA8'//gris
  }
}

// Color según prioridad
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgente': return '#FF5252'//rojo
    case 'alta': return '#FFA726'//amarillo
    case 'media': return '#42A5F5'//celeste
    case 'baja': return '#8B9BA8'//gris
    default: return '#8B9BA8'//gris
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
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
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createSection: {
    padding: 16,
    paddingTop: 8,
  },
  createButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#21D0B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#21D0B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createTextContainer: {
    flex: 1,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 4,
  },
  createSubtitle: {
    fontSize: 14,
    color: '#8B9BA8',
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
  seeAllText: {
    fontSize: 14,
    color: '#21D0B2',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F455C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B9BA8',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#21D0B2',
    paddingHorizontal: 32,
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
    marginBottom: 12,
  },
  reportId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F455C',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportDate: {
    fontSize: 12,
    color: '#8B9BA8',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportPriority: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tipsCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F455C',
  },
  tipsText: {
    fontSize: 14,
    color: '#2F455C',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
})
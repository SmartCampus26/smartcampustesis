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
  TextInput,
} from 'react-native'

// Íconos para mejorar la interfaz visual
import { Ionicons } from '@expo/vector-icons'
// Servicios para obtener datos desde la base de datos
import { obtenerReportes } from '../../src/services/ReporteService'
import { obtenerSesion } from '../../src/util/Session'
// Tipo de dato Reporte estructura de la base de datos
import { Reporte } from '../../src/types/Database'
// TIPO PARA FILTRO DE ESTADOS
// Define los valores válidos para filtrar reportes
type FiltroEstado = 'todos' | 'pendiente' | 'en proceso' | 'resuelto'

// COMPONENTE PRINCIPAL
export default function MisReportes() {
  // ESTADOS
  // Lista completa de reportes del usuario
  const [reportes, setReportes] = useState<Reporte[]>([])
  // Lista de reportes luego de aplicar filtros y búsqueda
  const [reportesFiltrados, setReportesFiltrados] = useState<Reporte[]>([])
  // Control de carga inicial
  const [cargando, setCargando] = useState(true)
  // Control del gesto de refrescar 
  const [refrescando, setRefrescando] = useState(false)
  // Estado del filtro seleccionado
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  // Texto ingresado en la barra de búsqueda
  const [busqueda, setBusqueda] = useState('')

  // EFECTOS
  // Carga los reportes al iniciar la pantalla
  useEffect(() => {
    cargarReportes()
  }, [])

  // Aplica filtros cada vez que cambian los datos, el estado o la búsqueda
  useEffect(() => {
    aplicarFiltros()
  }, [reportes, filtroEstado, busqueda])

  // FUNCIÓN: CARGAR REPORTES
  // Obtiene los reportes del usuario autenticado
  const cargarReportes = async () => {
    try {
      const sesion = await obtenerSesion()
      const { data: reportesData, error } = await obtenerReportes()
      
      if (error) throw error

      // Filtra solo los reportes creados por el usuario actual
      const misReportes = (reportesData || []).filter(
        (r: Reporte) => r.idUser === sesion?.id
      )

      // Ordenar por fecha las más recientes primero
      misReportes.sort((a, b) => 
        new Date(b.fecReporte).getTime() - new Date(a.fecReporte).getTime()
      )

      setReportes(misReportes)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  // FUNCIÓN: APLICAR FILTROS
  // Filtra reportes por estado y texto ingresado
  const aplicarFiltros = () => {
    let resultado = [...reportes]

    // Filtrado por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(r => r.estReporte.toLowerCase() === filtroEstado)
    }

    // Filtrado por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase()
      resultado = resultado.filter(r => 
        r.descriReporte.toLowerCase().includes(busquedaLower) ||
        r.idReporte.toString().includes(busquedaLower)
      )
    }

    setReportesFiltrados(resultado)
  }

  // FUNCIÓN: REFRESCAR LISTA
  const onRefresh = () => {
    setRefrescando(true)
    cargarReportes()
  }

  // FUNCIÓN: VER DETALLE DEL REPORTE
  const handleVerDetalle = (reporte: Reporte) => {
    Alert.alert(
      `Reporte #${reporte.idReporte}`,
      `Estado: ${reporte.estReporte}\n${reporte.descriReporte}`,
      [{ text: 'OK' }]
    )
  }

  // PANTALLA DE CARGA
  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#21D0B2" />
      </View>
    )
  }

  // INTERFAZ DE USUARIO
  return (
    <View style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Reportes</Text>
        <Text style={styles.headerSubtitle}>
          {reportes.length} {reportes.length === 1 ? 'reporte' : 'reportes'} en total
        </Text>
      </View>

      {/* BARRA DE BÚSQUEDA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8B9BA8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por descripción o ID..."
          value={busqueda}
          onChangeText={setBusqueda}
          placeholderTextColor="#8B9BA8"
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={20} color="#8B9BA8" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTROS POR ESTADO */}
      {/* Permite cambiar entre todos, pendientes, en proceso y resueltos */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroEstado === 'todos' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroEstado('todos')}
        >
          <Text style={[
            styles.filterText,
            filtroEstado === 'todos' && styles.filterTextActive
          ]}>
            Todos ({reportes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroEstado === 'pendiente' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroEstado('pendiente')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#FFA726' }]} />
          <Text style={[
            styles.filterText,
            filtroEstado === 'pendiente' && styles.filterTextActive
          ]}>
            Pendientes ({reportes.filter(r => r.estReporte === 'pendiente').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroEstado === 'en proceso' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroEstado('en proceso')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#42A5F5' }]} />
          <Text style={[
            styles.filterText,
            filtroEstado === 'en proceso' && styles.filterTextActive
          ]}>
            En Proceso ({reportes.filter(r => r.estReporte === 'en proceso').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroEstado === 'resuelto' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroEstado('resuelto')}
        >
          <View style={[styles.filterDot, { backgroundColor: '#66BB6A' }]} />
          <Text style={[
            styles.filterText,
            filtroEstado === 'resuelto' && styles.filterTextActive
          ]}>
            Resueltos ({reportes.filter(r => r.estReporte === 'resuelto').length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* LISTA DE REPORTES */}
      {/* Muestra tarjetas con información resumida de cada reporte */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refrescando} 
            onRefresh={onRefresh} 
            colors={['#21D0B2']} 
          />
        }
      >
        {reportesFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name={busqueda ? "search" : "document-text-outline"} 
              size={64} 
              color="#E1E8ED" 
            />
            <Text style={styles.emptyText}>
              {busqueda 
                ? 'No se encontraron reportes' 
                : filtroEstado === 'todos'
                  ? 'No tienes reportes aún'
                  : `No tienes reportes ${filtroEstado}`
              }
            </Text>
            <Text style={styles.emptySubtext}>
              {busqueda 
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea un nuevo reporte desde la pantalla de inicio'
              }
            </Text>
          </View>
        ) : (
          reportesFiltrados.map((reporte) => (
            <TouchableOpacity
              key={reporte.idReporte}
              style={styles.reportCard}
              onPress={() => handleVerDetalle(reporte)}
              activeOpacity={0.7}
            >
              <View style={styles.reportHeader}>
                <View style={styles.reportIdContainer}>
                  <Text style={styles.reportId}>#{reporte.idReporte}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(reporte.estReporte) }
                  ]}>
                    <Text style={styles.statusText}>{reporte.estReporte}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
              </View>

              <Text style={styles.reportDesc} numberOfLines={3}>
                {reporte.descriReporte}
              </Text>

              <View style={styles.reportMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#8B9BA8" />
                  <Text style={styles.metaText}>
                    {new Date(reporte.fecReporte).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>

                {reporte.prioReporte && reporte.prioReporte !== 'no asignada' && (
                  <View style={styles.metaItem}>
                    <Ionicons 
                      name="flag" 
                      size={14} 
                      color={getPriorityColor(reporte.prioReporte)} 
                    />
                    <Text style={[
                      styles.metaText,
                      { color: getPriorityColor(reporte.prioReporte) }
                    ]}>
                      {reporte.prioReporte}
                    </Text>
                  </View>
                )}
              </View>

              {reporte.empleado && (
                <View style={styles.assignedSection}>
                  <Ionicons name="person" size={16} color="#21D0B2" />
                  <Text style={styles.assignedText}>
                    Asignado a: {reporte.empleado.nomEmpl} {reporte.empleado.apeEmpl}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

// FUNCIONES AUXILIARES
// Color según estado del reporte
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pendiente': return '#FFA726' //amarillo
    case 'en proceso': return '#42A5F5' //celeste
    case 'resuelto': return '#66BB6A' //verde
    default: return '#8B9BA8' //gris
  }
}

// Color según prioridad
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'urgente': return '#FF5252' //rojo
    case 'alta': return '#FFA726' //amarillo
    case 'media': return '#42A5F5' //celeste
    case 'baja': return '#8B9BA8' //gris
    default: return '#8B9BA8' //gris
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2F455C',
  },
  filtersContainer: {
    maxHeight: 60,
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#21D0B2',
    borderColor: '#21D0B2',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F455C',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
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
  reportIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reportDesc: {
    fontSize: 14,
    color: '#2F455C',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#8B9BA8',
    textTransform: 'capitalize',
  },
  assignedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFFE',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  assignedText: {
    fontSize: 13,
    color: '#2F455C',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
})
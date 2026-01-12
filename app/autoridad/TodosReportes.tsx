// React y hooks para manejo de estado y ciclo de vida
import React, { useState, useEffect } from 'react'
// Componentes nativos para interfaz, scroll, alertas y carga
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
} from 'react-native'
// Librería de íconos para reforzar la experiencia visual
import { Ionicons } from '@expo/vector-icons'
// Cliente de Supabase para consultas a la base de datos
import { supabase } from '../../src/lib/Supabase'

// INTERFACES
// Estructura de datos del usuario
interface usuario {
  idUser: number
  nomUser: string
  apeUser: string
  rolUser: string
}

// Estructura de datos del reporte
interface reporte {
  idReporte: number
  descriReporte?: string
  fecReporte?: string
  estReporte?: string
  idUser?: number
  prioReporte?: string
  imgReporte?: string
  comentReporte?: string
}

// COMPONENTE
/**
 * Pantalla que muestra todos los reportes del sistema
 * Permite buscar, filtrar y visualizar reportes en modo solo lectura
 */
export default function TodosReportes() {
  // Lista de reportes obtenidos desde la base de datos
  const [reportes, setReportes] = useState<reporte[]>([])
  // Lista de usuarios para asociarlos a los reportes
  const [usuarios, setUsuarios] = useState<usuario[]>([])
  // Estado de carga general
  const [cargando, setCargando] = useState(true)
  // Texto de búsqueda
  const [busqueda, setBusqueda] = useState('')
  // Filtros por rol y estado
  const [filtroRol, setFiltroRol] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // EFECTOS
  // Carga inicial de usuarios y reportes
  useEffect(() => {
    cargarDatos()
  }, [])

  // FUNCIONES
  // Obtiene usuarios y reportes desde Supabase
  const cargarDatos = async () => {
    setCargando(true)

    // Consulta de usuarios
    const { data: usuData, error: usuError } = await supabase
      .from('usuario')
      .select('*')

    if (usuError) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios: ' + usuError.message)
      console.error(usuError)
    }

    // Consulta de reportes
    const { data: repData, error: repError } = await supabase
      .from('reporte')
      .select('*')
      .order('fecReporte', { ascending: false })

    if (repError) {
      Alert.alert('Error', 'No se pudieron cargar los reportes: ' + repError.message)
      console.error(repError)
    }

    setUsuarios(usuData || [])
    setReportes(repData || [])
    setCargando(false)
  }

  // Obtiene nombre y rol del usuario asociado a un reporte
  const getUsuarioInfo = (idUser?: number) => {
    if (!idUser) return { nombre: 'Sin asignar', rol: 'N/A' }
    const usuario = usuarios.find(u => u.idUser === idUser)
    if (!usuario) return { nombre: 'Desconocido', rol: 'N/A' }
    return {
      nombre: `${usuario.nomUser} ${usuario.apeUser}`,
      rol: usuario.rolUser
    }
  }

  // Filtrado de reportes por búsqueda, rol y estado
  const reportesFiltrados = reportes.filter(rep => {
    const usuarioInfo = getUsuarioInfo(rep.idUser)
    const pasaBusqueda = 
      (rep.descriReporte?.toLowerCase().includes(busqueda.toLowerCase())) ||
      (usuarioInfo.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    
    const pasaRol = filtroRol === 'todos' || usuarioInfo.rol === filtroRol
    const pasaEstado = filtroEstado === 'todos' || rep.estReporte === filtroEstado

    return pasaBusqueda && pasaRol && pasaEstado
  })

  // Devuelve el color según el estado del reporte
  const getEstadoColor = (estado?: string) => {
    switch(estado) {
      case 'pendiente': return '#FCD34D'
      case 'en_proceso': return '#60A5FA'
      case 'completado': return '#34D399'
      case 'cancelado': return '#F87171'
      default: return '#9CA3AF'
    }
  }

  // Devuelve el texto legible del estado
  const getEstadoTexto = (estado?: string) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente'
      case 'en_proceso': return 'En Proceso'
      case 'completado': return 'Completado'
      case 'cancelado': return 'Cancelado'
      default: return 'Sin estado'
    }
  }

  //  Devuelve el color según la prioridad del reporte
  const getPrioridadColor = (prioridad?: string) => {
    switch(prioridad) {
      case 'alta': return '#EF4444'
      case 'media': return '#F59E0B'
      case 'baja': return '#10B981'
      default: return '#6B7280'
    }
  }

  // Muestra un indicador de carga mientras se obtienen los datos
  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    )
  }

  // RENDER PRINCIPAL
  return (
    <View style={styles.container}>
      {/* Header con estadísticas */}
      {/* Muestra el total de reportes, docentes y autoridades */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={28} color="#1DCDFE" />
          <Text style={styles.statNumber}>{reportes.length}</Text>
          <Text style={styles.statLabel}>Total Reportes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="school" size={28} color="#21D0B2" />
          <Text style={styles.statNumber}>
            {usuarios.filter(u => u.rolUser === 'docente').length}
          </Text>
          <Text style={styles.statLabel}>Docentes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark" size={28} color="#34F5C5" />
          <Text style={styles.statNumber}>
            {usuarios.filter(u => u.rolUser === 'autoridad').length}
          </Text>
          <Text style={styles.statLabel}>Autoridades</Text>
        </View>
      </View>

      {/* Búsqueda */}
      {/* Permite buscar reportes por descripción o nombre del usuario */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por descripción o usuario..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {/* Botón para limpiar búsqueda */}
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      {/* Filtros por rol (docente / autoridad) y estado del reporte */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Filtro Rol */}
          <TouchableOpacity
            style={[styles.filterChip, filtroRol === 'todos' && styles.filterChipActive]}
            onPress={() => setFiltroRol('todos')}
          >
            <Text style={[styles.filterChipText, filtroRol === 'todos' && styles.filterChipTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filtroRol === 'docente' && styles.filterChipActive]}
            onPress={() => setFiltroRol('docente')}
          >
            <Ionicons name="school" size={16} color={filtroRol === 'docente' ? '#FFF' : '#21D0B2'} />
            <Text style={[styles.filterChipText, filtroRol === 'docente' && styles.filterChipTextActive]}>
              Docentes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filtroRol === 'autoridad' && styles.filterChipActive]}
            onPress={() => setFiltroRol('autoridad')}
          >
            <Ionicons name="shield-checkmark" size={16} color={filtroRol === 'autoridad' ? '#FFF' : '#34F5C5'} />
            <Text style={[styles.filterChipText, filtroRol === 'autoridad' && styles.filterChipTextActive]}>
              Autoridades
            </Text>
          </TouchableOpacity>

          {/* Filtro Estado */}
          <View style={styles.filterDivider} />

          <TouchableOpacity
            style={[styles.filterChip, filtroEstado === 'todos' && styles.filterChipActive]}
            onPress={() => setFiltroEstado('todos')}
          >
            <Text style={[styles.filterChipText, filtroEstado === 'todos' && styles.filterChipTextActive]}>
              Todos los Estados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filtroEstado === 'pendiente' && styles.filterChipActive]}
            onPress={() => setFiltroEstado('pendiente')}
          >
            <Text style={[styles.filterChipText, filtroEstado === 'pendiente' && styles.filterChipTextActive]}>
              ⏳ Pendiente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filtroEstado === 'en_proceso' && styles.filterChipActive]}
            onPress={() => setFiltroEstado('en_proceso')}
          >
            <Text style={[styles.filterChipText, filtroEstado === 'en_proceso' && styles.filterChipTextActive]}>
              🔄 En Proceso
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filtroEstado === 'completado' && styles.filterChipActive]}
            onPress={() => setFiltroEstado('completado')}
          >
            <Text style={[styles.filterChipText, filtroEstado === 'completado' && styles.filterChipTextActive]}>
              ✅ Completado
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de Reportes */}
      {/* Muestra los reportes filtrados o un mensaje si no hay resultados */}
      <ScrollView style={styles.reportesList}>
        {reportesFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No hay reportes</Text>
            <Text style={styles.emptySubtitle}>
              {busqueda ? 'No se encontraron reportes con tu búsqueda' : 'No hay reportes disponibles'}
            </Text>
          </View>
        ) : (
          <View style={styles.reportesContainer}>
            <Text style={styles.resultCount}>
              Mostrando {reportesFiltrados.length} de {reportes.length} reportes
            </Text>

            {/* Renderizado individual de cada reporte */}
            {reportesFiltrados.map((reporte) => {
              const usuarioInfo = getUsuarioInfo(reporte.idUser)
              return (
                <View key={reporte.idReporte} style={styles.reportCard}>
                  {/* Header del Reporte */}
                  <View style={styles.reportHeader}>
                    <View style={styles.reportBadge}>
                      <Text style={styles.reportBadgeText}>#{reporte.idReporte}</Text>
                    </View>
                    
                    <View style={styles.statusBadges}>
                      {reporte.prioReporte && (
                        <View style={[styles.prioridadBadge, { backgroundColor: getPrioridadColor(reporte.prioReporte) }]}>
                          <Text style={styles.prioridadText}>
                            {reporte.prioReporte === 'alta' ? '🔴 Alta' : 
                             reporte.prioReporte === 'media' ? '🟡 Media' : '🟢 Baja'}
                          </Text>
                        </View>
                      )}
                      
                      <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(reporte.estReporte) }]}>
                        <Text style={styles.estadoText}>{getEstadoTexto(reporte.estReporte)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Contenido del Reporte */}
                  <Text style={styles.reportTitle}>Reporte #{reporte.idReporte}</Text>
                  <Text style={styles.reportDesc} numberOfLines={3}>
                    {reporte.descriReporte || 'Sin descripción'}
                  </Text>

                  {/* Info del Usuario */}
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <Ionicons 
                        name={usuarioInfo.rol === 'autoridad' ? 'shield-checkmark' : 'school'} 
                        size={20} 
                        color="#FFF" 
                      />
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{usuarioInfo.nombre}</Text>
                      <View style={styles.userRolBadge}>
                        <Text style={styles.userRolText}>
                          {usuarioInfo.rol === 'autoridad' ? '👔 Autoridad' : '📚 Docente'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Metadata */}
                  <View style={styles.metadata}>
                    {reporte.fecReporte && (
                      <View style={styles.metadataItem}>
                        <Ionicons name="calendar" size={14} color="#6B7280" />
                        <Text style={styles.metadataText}>
                          {new Date(reporte.fecReporte).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    )}
                    
                    {reporte.comentReporte && (
                      <View style={styles.metadataItem}>
                        <Ionicons name="chatbox-ellipses" size={14} color="#6B7280" />
                        <Text style={styles.metadataText}>Con comentarios</Text>
                      </View>
                    )}
                  </View>

                  {/* Badge Solo Lectura */}
                  <View style={styles.readOnlyBadge}>
                    <Ionicons name="eye" size={16} color="#1DCDFE" />
                    <Text style={styles.readOnlyText}>Solo lectura</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F455C',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#2F455C',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
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
  filterDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  reportesList: {
    flex: 1,
  },
  reportesContainer: {
    padding: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  reportBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1DCDFE',
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  prioridadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prioridadText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
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
    lineHeight: 20,
    marginBottom: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DCDFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 4,
  },
  userRolBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userRolText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2F455C',
  },
  metadata: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#6B7280',
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  readOnlyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1DCDFE',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F455C',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
})
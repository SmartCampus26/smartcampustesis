// React y hooks para manejo de estado y ciclo de vida
import React, { useEffect, useState } from 'react'
// Componentes nativos para interfaz, scroll, alertas y carga
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
// Librería de íconos para reforzar la experiencia visual
import { Ionicons } from '@expo/vector-icons'
// Estilos separados
import { styles } from '../../src/components/todosReportesStyles'
// Lógica de negocio separada
import {
  usuario,
  reporte,
  cargarDatosTodosReportes,
  getUsuarioInfo,
  filtrarTodosReportes,
  getEstadoColor,
  getEstadoTexto,
  getPrioridadColor,
} from '../../src/services/TodosReportesService'

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
    try {
      const { usuarios: usuData, reportes: repData } = await cargarDatosTodosReportes()
      setUsuarios(usuData)
      setReportes(repData)
    } catch (error: any) {
      Alert.alert('Error', error.message)
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  // Filtrado de reportes por búsqueda, rol y estado
  const reportesFiltrados = filtrarTodosReportes(reportes, usuarios, busqueda, filtroRol, filtroEstado)

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
          {(['todos', 'docente', 'autoridad'] as const).map((rol) => (
            <TouchableOpacity
              key={rol}
              style={[styles.filterChip, filtroRol === rol && styles.filterChipActive]}
              onPress={() => setFiltroRol(rol)}
            >
              {rol === 'docente' && (
                <Ionicons name="school" size={16} color={filtroRol === rol ? '#FFF' : '#21D0B2'} />
              )}
              {rol === 'autoridad' && (
                <Ionicons name="shield-checkmark" size={16} color={filtroRol === rol ? '#FFF' : '#34F5C5'} />
              )}
              <Text style={[styles.filterChipText, filtroRol === rol && styles.filterChipTextActive]}>
                {rol === 'todos' ? 'Todos' : rol === 'docente' ? 'Docentes' : 'Autoridades'}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Filtro Estado */}
          <View style={styles.filterDivider} />

          {([
            { key: 'todos', label: 'Todos los Estados' },
            { key: 'pendiente', label: '⏳ Pendiente' },
            { key: 'en_proceso', label: '🔄 En Proceso' },
            { key: 'completado', label: '✅ Completado' },
          ] as const).map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, filtroEstado === key && styles.filterChipActive]}
              onPress={() => setFiltroEstado(key)}
            >
              <Text style={[styles.filterChipText, filtroEstado === key && styles.filterChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
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
              const usuarioInfo = getUsuarioInfo(usuarios, reporte.idUser)
              return (
                <View key={reporte.idReporte} style={styles.reportCard}>
                  {/* Header del Reporte */}
            {/* Header del Reporte */}
              <View style={styles.reportHeader}>
             {/* Fila 1: ID badge */}
            <View style={styles.reportBadge}>
          <Text style={styles.reportBadgeText}>#{reporte.idReporte}</Text>
        </View>

      {/* Fila 2: Prioridad y Estado */}
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
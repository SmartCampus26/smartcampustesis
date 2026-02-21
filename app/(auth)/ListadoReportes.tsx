import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { Reporte } from '../../src/types/Database'
import { styles } from '../../src/components/listadoReportesStyles'
import {
  FiltroEstado,
  cargarMisReportes,
  aplicarFiltrosReportes,
  getStatusColor,
  getPriorityColor,
} from '../../src/services/ListadoReportesService'

export default function MisReportes() {
  const { filtro } = useLocalSearchParams<{ filtro?: string }>()

  const [reportes, setReportes] = useState<Reporte[]>([])
  const [reportesFiltrados, setReportesFiltrados] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [busqueda, setBusqueda] = useState('')

  // Aplica filtro inicial recibido por ruta
  useEffect(() => {
    if (filtro && ['todos', 'pendiente', 'en proceso', 'resuelto'].includes(filtro)) {
      setFiltroEstado(filtro as FiltroEstado)
    }
  }, [filtro])

  useEffect(() => { fetchReportes() }, [])
  useEffect(() => {
    setReportesFiltrados(aplicarFiltrosReportes(reportes, filtroEstado, busqueda))
  }, [reportes, filtroEstado, busqueda])

  const fetchReportes = async () => {
    try {
      const data = await cargarMisReportes()
      setReportes(data)
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  const onRefresh = () => { setRefrescando(true); fetchReportes() }

  const handleVerDetalle = (reporte: Reporte) => {
    Alert.alert(
      `Reporte #${reporte.idReporte}`,
      `Estado: ${reporte.estReporte}\n${reporte.descriReporte}`,
      [{ text: 'OK' }]
    )
  }

  const contarPor = (estado: string) =>
    reportes.filter((r) => r.estReporte === estado).length

  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#21D0B2" />
      </View>
    )
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Reportes</Text>
        <Text style={styles.headerSubtitle}>
          {reportes.length} {reportes.length === 1 ? 'reporte' : 'reportes'} en total
        </Text>
      </View>

      {/* BÚSQUEDA */}
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

      {/* FILTROS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {([
          { key: 'todos', label: `Todos (${reportes.length})`, color: null },
          { key: 'pendiente', label: `Pendientes (${contarPor('pendiente')})`, color: '#FFA726' },
          { key: 'en proceso', label: `En Proceso (${contarPor('en proceso')})`, color: '#42A5F5' },
          { key: 'resuelto', label: `Resueltos (${contarPor('resuelto')})`, color: '#66BB6A' },
        ] as { key: FiltroEstado; label: string; color: string | null }[]).map(({ key, label, color }) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterButton, filtroEstado === key && styles.filterButtonActive]}
            onPress={() => setFiltroEstado(key)}
          >
            {color && <View style={[styles.filterDot, { backgroundColor: color }]} />}
            <Text style={[styles.filterText, filtroEstado === key && styles.filterTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LISTA */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#21D0B2']} />
        }
      >
        {reportesFiltrados.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={busqueda ? 'search' : 'document-text-outline'}
              size={64}
              color="#E1E8ED"
            />
            <Text style={styles.emptyText}>
              {busqueda
                ? 'No se encontraron reportes'
                : filtroEstado === 'todos'
                ? 'No tienes reportes aún'
                : `No tienes reportes ${filtroEstado}`}
            </Text>
            <Text style={styles.emptySubtext}>
              {busqueda
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea un nuevo reporte desde la pantalla de inicio'}
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
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reporte.estReporte) }]}>
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
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
                {reporte.prioReporte && reporte.prioReporte !== 'no asignada' && (
                  <View style={styles.metaItem}>
                    <Ionicons name="flag" size={14} color={getPriorityColor(reporte.prioReporte)} />
                    <Text style={[styles.metaText, { color: getPriorityColor(reporte.prioReporte) }]}>
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
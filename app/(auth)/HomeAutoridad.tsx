// Importa React y hooks para manejar estado y efectos
import React, { useState, useEffect } from 'react'
// Componentes visuales de React Native
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native'
// Iconos
import { Ionicons } from '@expo/vector-icons'
// Navegación entre pantallas
import { router } from 'expo-router'
// Tipo de dato Reporte
import { Reporte } from '../../src/types/Database'
// Lógica de carga de datos y funciones auxiliares
import { cargarDatosAutoridad, getStatusColor, getPriorityColor, HomeAutoridadStats } from '../../src/services/HomeAutoridadService'
// Estilos
import { homeAutoridadStyles as styles } from '../../src/components/homeAutoridadStyles'

export default function HomeAutoridad() {
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
  const [stats, setStats] = useState<HomeAutoridadStats>({
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
      const datos = await cargarDatosAutoridad()
      setUsuario(datos.usuario)
      setReportes(datos.reportes)
      setStats(datos.stats)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      // Finaliza estados de carga
      setCargando(false)
      setRefrescando(false)
    }
  }

  // FUNCIÓN: Refrescar datos manualmente
  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }

  /**
   * Navega a la pantalla de creación de reporte.
   * Pasa parámetros por router.
   */
  const handleCrearReporte = () => {
    if (!usuario?.idUser) {
      Alert.alert('Error', 'No se pudo identificar al usuario')
      return
    }

    router.push({
      pathname: '/CrearReporte',
      params: {
        idUser: usuario.idUser,
        nombreUsuario: usuario.nomUser || 'Usuario'
      }
    })
  }

  // PANTALLA DE CARGA
  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  // INTERFAZ PRINCIPAL
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#1DCDFE']} />
        }
      >
        {/* ===== ENCABEZADO ===== */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.username}>{usuario?.nomUser || 'Usuario'}</Text>
          </View>
        </View>

        {/* ===== TARJETAS DE ESTADÍSTICAS ====== */}
        <View style={styles.statsContainer}>

          {/* Total */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#13947F' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'todos' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Totales</Text>
          </TouchableOpacity>

          {/* Pendientes */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#FFA726' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'pendiente' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </TouchableOpacity>

          {/* En proceso */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#42A5F5' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'en proceso' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.enProceso}</Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </TouchableOpacity>

          {/* Resueltos */}
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#66BB6A' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'resuelto' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.resueltos}</Text>
            <Text style={styles.statLabel}>Resueltos</Text>
          </TouchableOpacity>

        </View>

        {/* ==== BOTÓN CREAR REPORTE ===== */}
        {/* Permite a la autoridad acceder al formulario de creación de reportes */}
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
              <Ionicons name="chevron-forward" size={24} color="#1DCDFE" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ==== SECCIÓN: REPORTES RECIENTES ==== */}
        {/* Muestra los últimos reportes creados por la autoridad */}
        <View style={styles.section}>
          {/* Encabezado de la sección */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reportes Recientes</Text>
            {/* Botón para ver todos los reportes */}
            <TouchableOpacity onPress={() => router.push('/ListadoReportes')}>
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
              <TouchableOpacity style={styles.emptyButton} onPress={handleCrearReporte}>
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
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reporte.estReporte) }]}>
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
                      <Ionicons name="flag" size={14} color={getPriorityColor(reporte.prioReporte)} />
                      <Text style={[styles.reportPriority, { color: getPriorityColor(reporte.prioReporte) }]}>
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
    </View>
  )
}
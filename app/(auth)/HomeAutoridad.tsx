// 🏛️ HomeAutoridad.tsx
// Pantalla principal para usuarios con rol de autoridad (coordinadores).
// Muestra estadísticas de reportes, acceso al informe resumido PDF,
// botón para crear reportes y lista de reportes recientes con modal de detalle.

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as React from 'react'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator, RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { homeAutoridadStyles as styles } from '../../src/components/homeAutoridadStyles'
import ReporteDetalleModal from '../../src/components/Reportedetallemodal'
import { useToast } from '../../src/components/ToastContext'
import { useSesion } from '../../src/context/SesionContext'
import { cargarDatosAutoridad, getPriorityColor, getStatusColor, HomeAutoridadStats } from '../../src/services/HomeAutoridadService'
import { Reporte } from '../../src/types/Database'

// ── PDF General: la autoridad siempre tiene acceso ──
// No necesita verificar puedeGenerarPdfGeneral() porque su rol garantiza acceso.

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Panel de inicio para coordinadores/autoridades.
 * Carga los datos del usuario y sus reportes al montar,
 * y soporta pull-to-refresh para actualizar.
 */
export default function HomeAutoridad() {
  const { showToast } = useToast()
  const { sesion } = useSesion()

  // ── Estado de datos ──────────────────────────────────────────────────────
  const [usuario, setUsuario]   = useState<any>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [stats, setStats] = useState<HomeAutoridadStats>({
    total: 0, pendientes: 0, enProceso: 0, resueltos: 0,
  })

  // ── Estado del modal de detalle ──────────────────────────────────────────
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => { cargarDatos() }, [])

  /**
   * Carga el usuario autenticado, sus reportes y estadísticas desde Supabase.
   * Maneja estados de carga inicial y refresco por pull-to-refresh.
   */
  const cargarDatos = async () => {
    try {
      if (!sesion) return  
      const datos = await cargarDatosAutoridad(sesion)
      console.log('REPORTE[0] completo:', JSON.stringify(datos.reportes[0], null, 2))
      setUsuario(datos.usuario)
      setReportes(datos.reportes)
      setStats(datos.stats)
    } catch (error: any) {
      showToast(error.message || 'Error al cargar datos', 'error')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  useEffect(() => {
    if (sesion) cargarDatos()  // ← solo carga si hay sesión
  }, [sesion])  // ← depende de sesion, no solo al montar

  /** Activa el refresco por pull-to-refresh y recarga los datos */
  const onRefresh = () => { setRefrescando(true); cargarDatos() }

  /**
   * Navega a la pantalla de creación de reporte.
   * Pasa el ID y nombre del usuario como parámetros de ruta.
   */
  const handleCrearReporte = () => {
    if (!usuario?.idUser) {
      showToast('No se pudo identificar al usuario', 'error')
      return
    }
    router.push({
      pathname: '/CrearReporte',
      params: { idUser: usuario.idUser, nombreUsuario: usuario.nomUser || 'Usuario' }
    })
  }

  /**
   * Abre el modal de detalle para el reporte seleccionado.
   * @param reporte - Reporte a visualizar en el modal
   */
  const abrirDetalle = (reporte: Reporte) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  /**
   * Navega a la pantalla de previsualización del PDF Resumido.
   * La autoridad ve el informe de todos los departamentos con filtro.
   */
  const abrirPdfGeneral = () => {
    router.push('/PdfResumidoPreview')
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  // ── Render principal ──────────────────────────────────────────────────────

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

        {/* ===== ESTADÍSTICAS =====
            Cada tarjeta navega al listado filtrado por estado al presionar. ===== */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#13947F' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'todos' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Totales</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#FFA726' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'pendiente' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#42A5F5' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'en proceso' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.enProceso}</Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#66BB6A' }]}
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'resuelto' } })}
          >
            <Ionicons name="time-outline" size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>{stats.resueltos}</Text>
            <Text style={styles.statLabel}>Resueltos</Text>
          </TouchableOpacity>
        </View>

        {/* ===== BOTÓN INFORME RESUMIDO =====
            La autoridad descarga el informe resumido con filtro por departamento. ===== */}
        <View style={styles.pdfButtonContainer}>
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={abrirPdfGeneral}
            activeOpacity={0.8}
          >
            <Ionicons name="bar-chart-outline" size={20} color="#ffffff" />
            <Text style={styles.pdfButtonText}>Informe Resumido por Departamento</Text>
            <Ionicons name="chevron-forward" size={18} color="#93c5fd" />
          </TouchableOpacity>
        </View>

        {/* ===== BOTÓN CREAR REPORTE ===== */}
        <View style={styles.createSection}>
          <TouchableOpacity style={styles.createButton} onPress={handleCrearReporte}>
            <View style={styles.createButtonContent}>
              <View style={styles.createIcon}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.createTextContainer}>
                <Text style={styles.createTitle}>Crear Nuevo Reporte</Text>
                <Text style={styles.createSubtitle}>Reporta un problema o solicitud</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#1DCDFE" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ===== REPORTES RECIENTES =====
            Muestra los 3 reportes más recientes. Cada uno abre el modal de detalle. ===== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reportes Recientes</Text>
            <TouchableOpacity onPress={() => router.push('/ListadoReportes')}>
              <Text style={styles.seeAllText}>Ver todos →</Text>
            </TouchableOpacity>
          </View>

          {reportes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#E1E8ED" />
              <Text style={styles.emptyText}>No tienes reportes aún</Text>
              <Text style={styles.emptySubtext}>Crea tu primer reporte para comenzar</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleCrearReporte}>
                <Text style={styles.emptyButtonText}>Crear Reporte</Text>
              </TouchableOpacity>
            </View>
          ) : (
            reportes.slice(0, 3).map((reporte) => (
              <TouchableOpacity
                key={reporte.idReporte}
                style={styles.reportCard}
                onPress={() => abrirDetalle(reporte)}
              >
                <View style={styles.reportHeader}>
                  <Text style={styles.reportId} numberOfLines={1}>#{reporte.idReporte}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reporte.estReporte) }]}>
                    <Text style={styles.statusText}>{reporte.estReporte}</Text>
                  </View>
                </View>

                <Text style={styles.reportDesc} numberOfLines={2}>
                  {reporte.descriReporte}
                </Text>

                <View style={styles.reportFooter}>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={14} color="#8B9BA8" />
                    <Text style={styles.reportDate}>
                      {new Date(reporte.fecReporte).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short',
                      })}
                    </Text>
                  </View>
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

        {/* ===== CONSEJO DEL DÍA ===== */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FFA726" />
            <Text style={styles.tipsTitle}>Consejo del día</Text>
          </View>
          <Text style={styles.tipsText}>
            Proporciona la mayor cantidad de detalles posibles al crear un reporte. Esto ayudará a que tu solicitud sea atendida más rápidamente.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de detalle de reporte */}
      <ReporteDetalleModal
        visible={modalVisible}
        reporte={reporteSeleccionado}
        onClose={() => setModalVisible(false)}
      />
    </View>
  )
}
// 🔧 HomeEmpleado.tsx
// Pantalla principal para colaboradores (personal de mantenimiento y sistemas).
// Muestra las tareas asignadas, botones de PDF personal y (para jefes) PDF general,
// y un modal de detalle para cada reporte.

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator, RefreshControl,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native'
import { homeEmpleadoStyles as styles } from '../../src/components/homeEmpleadoStyles'
import ReporteDetalleModal from '../../src/components/Reportedetallemodal'
import { cargarDatosEmpleado, getPriorityColor, getStatusColor } from '../../src/services/empleado/Homeempleadoservice'
import { Reporte } from '../../src/types/Database'
// ── PDF General: solo visible para jefes de área ──
import * as React from 'react'
import { useToast } from '../../src/components/ToastContext'
import { puedeGenerarPdfGeneral } from '../../src/services/pdf/PdfDepartamentalService'

import { useSesion } from '../../src/context/SesionContext'

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Panel de inicio para colaboradores (empleados).
 * Determina si el empleado es jefe para mostrar u ocultar el botón de PDF general.
 * Soporta pull-to-refresh y modal de detalle por reporte.
 */
export default function HomeEmpleados() {
  const { showToast } = useToast()
  const { sesion } = useSesion() 

  // ── Estado de datos ──────────────────────────────────────────────────────
  const [empleado, setEmpleado]       = useState<any>(null)
  const [reportes, setReportes]       = useState<Reporte[]>([])
  const [cargando, setCargando]       = useState(true)
  const [refrescando, setRefrescando] = useState(false)

  // ── Acceso al PDF General ────────────────────────────────────────────────
  // Solo visible para empleados con cargEmpl === 'jefe' en sistemas o mantenimiento.
  // verificandoAcceso evita que el botón aparezca brevemente antes de confirmar el rol.
  const [mostrarBtnGeneral, setMostrarBtnGeneral] = useState(false)
  const [verificandoAcceso, setVerificandoAcceso] = useState(true)

  // ── Estado del modal de detalle ──────────────────────────────────────────
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [modalVisible, setModalVisible]               = useState(false)

  useEffect(() => { cargarDatos() }, [])

  /**
   * Carga el empleado autenticado, sus reportes asignados
   * y verifica si tiene acceso al PDF general (solo jefes).
   *
   * Incluye reintentos silenciosossssssssssasss cuando el error es de sesión.
   * Ocurre al volver ede PdfPreview miennnnntras AseeeeeeeeeyncStorage todavía
   * está restaurando la sesión. Se reintentaaaaa hastaaaaaaaaaaaa 3 veces con 400ms.
   *
   * @param intento - Número de intento actual (default 1)
   */
  const cargarDatos = async (intento = 1) => {
    try {
     if (!sesion) return
      const datos = await cargarDatosEmpleado(sesion) 
      setEmpleado(datos.empleado)
      setReportes(datos.reportes)

      const acceso = await puedeGenerarPdfGeneral(sesion)
      setMostrarBtnGeneral(acceso)
      setVerificandoAcceso(false)
    } catch (error: any) {
      const msg: string = error?.message ?? ''
      const esSesion = msg.includes('válida') || msg.includes('sesión') || msg.includes('Sesión')

      // Reintentar silenciosamente si es error de sesión y quedan intentos
      if (esSesion && intento < 4) {
        await new Promise(r => setTimeout(r, 400))
        return cargarDatos(intento + 1)
      }

      // Solo mostrar toast si es un error real (no de sesión)
      if (!esSesion) {
        showToast(msg || 'Error al cargar datos', 'error')
      }
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  /** Activa el refresco por pull-to-refresh y recarga los datos */
  const onRefresh = () => { setRefrescando(true); cargarDatos() }

  /**
   * Navega a la pantalla de previsualización del PDF personal.
   * Solo navega si el empleado tiene reportes asignados.
   * Si no tiene, muestra un toast informativo.
   */
  const abrirPdfPersonal = () => {
    if (reportes.length === 0) {
      showToast('No tienes tareas asignadas para generar el PDF', 'info')
      return
    }
    router.push('/PdfPersonalPreview')
  }

  /**
   * Navega a la pantalla de previsualización del PDF General.
   * Solo disponible para jefes de área (mostrarBtnGeneral === true).
   */
  const abrirPdfGeneral = () => router.push('/PdfPreview')

  /**
   * Abre el modal de detalle para el reporte seleccionado.
   * @param reporte - Reporte a visualizar
   */
  const abrirDetalle = (reporte: Reporte) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={['#1DCDFE']} />
        }
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {empleado?.nomEmpl || 'Colaborador'}</Text>
          <Text style={styles.role}>Tareas Asignadas</Text>
        </View>

        {/* ── BOTONES DE PDF ──────────────────────────────────────────────────
            Layout en fila si hay 2 botones, columna si solo hay 1. ── */}
        <View style={pdfRowStyle(mostrarBtnGeneral)}>

          {/* PDF Individual — siempre visible para todos los colaboradores */}
          <TouchableOpacity
            style={[styles.pdfButton, mostrarBtnGeneral && { flex: 1 }]}
            onPress={abrirPdfPersonal}
          >
            <Ionicons name="document-text-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.pdfButtonText}>Mi PDF</Text>
          </TouchableOpacity>

          {/* PDF General — solo visible para jefes una vez confirmado el rol */}
          {!verificandoAcceso && mostrarBtnGeneral && (
            <TouchableOpacity
              style={[styles.pdfButton, { flex: 1, backgroundColor: '#1e40af' }]}
              onPress={abrirPdfGeneral}
            >
              <Ionicons name="people-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.pdfButtonText}>PDF General</Text>
            </TouchableOpacity>
          )}

        </View>

        {/* ── LISTA DE TAREAS ASIGNADAS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Tareas</Text>
          {reportes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tienes tareas asignadas</Text>
              <Text style={styles.emptySubtext}>Las nuevas tareas aparecerán aquí</Text>
            </View>
          ) : (
            reportes.map((reporte) => (
              <TouchableOpacity
                key={reporte.idReporte}
                style={styles.reportCard}
                onPress={() => abrirDetalle(reporte)}
                activeOpacity={0.75}
              >
                <View style={styles.reportHeader}>
                  <Text style={styles.reportId}>#{reporte.idReporte}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reporte.estReporte) }]}>
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
                  <Text style={[styles.reportPriority, { color: getPriorityColor(reporte.prioReporte) }]}>
                    {reporte.prioReporte || 'Sin prioridad'}
                  </Text>
                </View>

                {/* Usuario que solicitó el reporte */}
                {reporte.usuario && (
                  <View style={styles.requesterInfo}>
                    <Text style={styles.requesterLabel}>
                      Solicitado por: {reporte.usuario.nomUser} {reporte.usuario.apeUser}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retorna el estilo del contenedor de botones PDF.
 * Con dos botones usa fila con gap; con uno usa columna.
 *
 * @param mostrarGeneral - true si se debe mostrar el botón de PDF General
 */
function pdfRowStyle(mostrarGeneral: boolean) {
  return {
    flexDirection: mostrarGeneral ? ('row' as const) : ('column' as const),
    gap: mostrarGeneral ? 10 : 0,
    paddingHorizontal: 16,
    marginBottom: 8,
  }
}
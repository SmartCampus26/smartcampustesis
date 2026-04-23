// ─── useReportesPendientes.ts ─────────────────────────────────────────────────
// Hook de ReportesPendientes.tsx.
// Maneja toda la lógica de estado. Llama exclusivamente a ReportesPendientesService.

import { useEffect, useState } from 'react'
import {
  asignarColaboradorAReporte,
  cargarColaboradoresDepto,
  cargarReportesAsignadosDepto,
  cargarReportesEmpleado,
  cargarReportesSinAsignar,
  ESTADOS_VALIDOS,
  getColorEstado,
  getColorPrioridad,
  guardarCambiosReporte,
  obtenerSesionEmpleado,
  PRIORIDADES_VALIDAS,
  ReporteCompleto,
} from '../../services/empleado/ReportesPendientesService'
import { useSesion } from '../../context/SesionContext'
import { useToast } from '../../context/ToastContext'
import { Empleado } from '../../types/Database'

type TabJefe = 'sinAsignar' | 'asignados'

interface ConfirmState {
  visible:        boolean
  titulo:         string
  mensaje:        string
  labelConfirmar: string
  accentColor:    string | undefined
  onConfirm:      () => void
}

const CONFIRM_INICIAL: ConfirmState = {
  visible: false, titulo: '', mensaje: '',
  labelConfirmar: 'Confirmar', accentColor: undefined, onConfirm: () => {},
}

export function useReportesPendientes() {
  const { sesion }    = useSesion()
  const { showToast } = useToast()

  // ── Sesión ───────────────────────────────────────────────────────────────
  const [esJefe, setEsJefe]                 = useState(false)
  const [empleadoActual, setEmpleadoActual] = useState<string | null>(null)
  const [nombreJefe, setNombreJefe]         = useState('')
  const [depto, setDepto]                   = useState('')

  // ── Datos ────────────────────────────────────────────────────────────────
  const [reportes, setReportes]                   = useState<ReporteCompleto[]>([])
  const [reportesAsignados, setReportesAsignados] = useState<ReporteCompleto[]>([])
  const [colaboradores, setColaboradores]         = useState<Empleado[]>([])

  // ── UI ───────────────────────────────────────────────────────────────────
  const [cargando, setCargando]     = useState(true)
  const [recargando, setRecargando] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [tabActivo, setTabActivo]   = useState<TabJefe>('sinAsignar')

  // ── Edición inline ───────────────────────────────────────────────────────
  const [editando, setEditando]               = useState<string | null>(null)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [nuevaPrioridad, setNuevaPrioridad]   = useState('')
  const [nuevoEstado, setNuevoEstado]         = useState('')

  // ── Modal de asignación ──────────────────────────────────────────────────
  const [modalVisible, setModalVisible]               = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteCompleto | null>(null)

  // ── ConfirmModal ─────────────────────────────────────────────────────────
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_INICIAL)

  const openConfirm = (titulo: string, mensaje: string, onConfirm: () => void, labelConfirmar = 'Confirmar', accentColor?: string) =>
    setConfirm({ visible: true, titulo, mensaje, labelConfirmar, accentColor, onConfirm })
  const closeConfirm = () => setConfirm(p => ({ ...p, visible: false }))

  useEffect(() => { if (sesion) iniciar() }, [sesion])

  // ── Inicialización ────────────────────────────────────────────────────────

  const iniciar = async () => {
    try {
      if (!sesion) return
      const sesionData = obtenerSesionEmpleado(sesion)
      const jefe       = sesionData.cargo === 'jefe'
      setEsJefe(jefe)
      setEmpleadoActual(sesionData.id)
      setNombreJefe(sesionData.nombre)
      setDepto(sesionData.depto)

      if (jefe) {
        const [colab, sinAsignar, asignados] = await Promise.all([
          cargarColaboradoresDepto(sesionData.depto),
          cargarReportesSinAsignar(),
          cargarReportesAsignadosDepto(sesionData.depto),
        ])
        setColaboradores(colab)
        setReportes(sinAsignar)
        setReportesAsignados(asignados)
      } else {
        setReportes(await cargarReportesEmpleado(sesionData.id))
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const recargar = async () => {
    setRecargando(true)
    try {
      if (esJefe) {
        const [sinAsignar, asignados] = await Promise.all([
          cargarReportesSinAsignar(),
          cargarReportesAsignadosDepto(depto),
        ])
        setReportes(sinAsignar)
        setReportesAsignados(asignados)
      } else if (empleadoActual) {
        setReportes(await cargarReportesEmpleado(empleadoActual))
      }
    } catch (err: any) {
      showToast(err.message || 'Error al recargar', 'error')
    } finally {
      setRecargando(false)
    }
  }

  // ── Asignación ────────────────────────────────────────────────────────────

  const abrirModal = (reporte: ReporteCompleto) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  const asignar = async (colaborador: Empleado) => {
    if (!reporteSeleccionado) return
    try {
      await asignarColaboradorAReporte(reporteSeleccionado.idReporte, colaborador.idEmpl, nombreJefe)
      showToast(`Reporte ${reporteSeleccionado.idEmpl ? 'reasignado' : 'asignado'} correctamente`, 'success')
      setModalVisible(false)
      recargar()
    } catch (err: any) {
      showToast(err.message || 'Error al asignar', 'error')
    }
  }

  /** Muestra el ConfirmModal antes de asignar/reasignar.
   *  Azul info (#4895ef) para asignación nueva · accent (verde) para reasignación.
   *  Reemplaza Alert.alert manteniendo coherencia visual con ToastContext. */
  const confirmarAsignacion = (colaborador: Empleado) => {
    const yaAsignado  = !!reporteSeleccionado?.idEmpl
    const accentColor = yaAsignado ? colors.accent : '#4895ef'
    openConfirm(
      yaAsignado ? 'Confirmar reasignación' : 'Confirmar asignación',
      `¿${yaAsignado ? 'Reasignar' : 'Asignar'} este reporte a ${colaborador.nomEmpl} ${colaborador.apeEmpl}?`,
      () => { closeConfirm(); asignar(colaborador) },
      yaAsignado ? 'Reasignar' : 'Asignar',
      accentColor,
    )
  }

  // ── Edición inline ────────────────────────────────────────────────────────

  const iniciarEdicion = (reporte: ReporteCompleto) => {
    setEditando(reporte.idReporte)
    setNuevoComentario(reporte.comentReporte || '')
    setNuevaPrioridad(reporte.prioReporte)
    setNuevoEstado(reporte.estReporte)
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setNuevoComentario('')
    setNuevaPrioridad('')
    setNuevoEstado('')
  }

  const guardarCambios = async (idReporte: string) => {
    try {
      const reporteActual =
        reportes.find(r => r.idReporte === idReporte) ??
        reportesAsignados.find(r => r.idReporte === idReporte)
      if (!reporteActual) return
      await guardarCambiosReporte(idReporte, reporteActual, nuevoComentario, nuevaPrioridad, nuevoEstado)
      await recargar()
      cancelarEdicion()
    } catch (err: any) {
      showToast(err.message || 'Error al guardar', 'error')
    }
  }

  const getIniciales = (nombre?: string, apellido?: string) =>
    `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

  const reportesMostrados = esJefe
    ? (tabActivo === 'sinAsignar' ? reportes : reportesAsignados)
    : reportes

  // Necesario para el color del accent en confirmarAsignacion
  const colors = { accent: '#21D0B2' }

  return {
    // Sesión
    esJefe, nombreJefe,
    // Datos
    reportes, reportesAsignados, reportesMostrados, colaboradores,
    // UI
    cargando, recargando, error, tabActivo, setTabActivo,
    onRefresh: recargar,
    // Modal asignación
    modalVisible, setModalVisible,
    reporteSeleccionado, abrirModal,
    confirmarAsignacion,
    // ConfirmModal — estado listo para pasar a <ConfirmModal {...confirm} onCancel={closeConfirm} />
    confirm, closeConfirm,
    // Edición
    editando, nuevoComentario, nuevaPrioridad, nuevoEstado,
    setNuevoComentario, setNuevaPrioridad, setNuevoEstado,
    iniciarEdicion, cancelarEdicion, guardarCambios,
    // Reintentar
    reintentar: iniciar,
    // Helpers para la vista
    getIniciales,
    getColorEstado,
    getColorPrioridad,
    estadosValidos:     [...ESTADOS_VALIDOS],
    prioridadesValidas: [...PRIORIDADES_VALIDAS],
  }
}
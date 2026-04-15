// ─── useReportesPendientes.ts ─────────────────────────────────────────────────
// Hook de ReportesPendientes.tsx.
// Maneja toda la lógica de estado de la pantalla más compleja del proyecto.
// Llama exclusivamente a funciones de ReportesPendientesService.

import { useEffect, useState } from 'react'
import {
  asignarColaboradorAReporte,
  cargarColaboradoresDepto,
  cargarReportesAsignadosDepto,
  cargarReportesEmpleado,
  cargarReportesSinAsignar,
  guardarCambiosReporte,
  obtenerSesionEmpleado,
  ReporteCompleto,
} from '../../services/empleado/ReportesPendientesService'
import { useSesion } from '../../context/SesionContext'
import { Empleado } from '../../types/Database'

type TabJefe = 'sinAsignar' | 'asignados'

export function useReportesPendientes() {
  const { sesion } = useSesion()

  // ── Sesión ───────────────────────────────────────────────────────────────
  const [esJefe, setEsJefe]             = useState(false)
  const [empleadoActual, setEmpleadoActual] = useState<string | null>(null)
  const [nombreJefe, setNombreJefe]     = useState('')
  const [depto, setDepto]               = useState('')

  // ── Datos ────────────────────────────────────────────────────────────────
  const [reportes, setReportes]                   = useState<ReporteCompleto[]>([])
  const [reportesAsignados, setReportesAsignados] = useState<ReporteCompleto[]>([])
  const [colaboradores, setColaboradores]         = useState<Empleado[]>([])

  // ── UI ───────────────────────────────────────────────────────────────────
  const [cargando, setCargando]       = useState(true)
  const [recargando, setRecargando]   = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [tabActivo, setTabActivo]     = useState<TabJefe>('sinAsignar')

  // ── Edición inline ───────────────────────────────────────────────────────
  const [editando, setEditando]               = useState<string | null>(null)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [nuevaPrioridad, setNuevaPrioridad]   = useState('')
  const [nuevoEstado, setNuevoEstado]         = useState('')

  // ── Modal de asignación ──────────────────────────────────────────────────
  const [modalVisible, setModalVisible]               = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteCompleto | null>(null)

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
    await asignarColaboradorAReporte(
      reporteSeleccionado.idReporte,
      colaborador.idEmpl,
      nombreJefe,
    )
    setModalVisible(false)
    recargar()
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
    const reporteActual =
      reportes.find(r => r.idReporte === idReporte) ??
      reportesAsignados.find(r => r.idReporte === idReporte)
    if (!reporteActual) return
    await guardarCambiosReporte(
      idReporte, reporteActual, nuevoComentario, nuevaPrioridad, nuevoEstado
    )
    await recargar()
    cancelarEdicion()
  }

  // Lista visible según tab activo
  const reportesMostrados = esJefe
    ? (tabActivo === 'sinAsignar' ? reportes : reportesAsignados)
    : reportes

  return {
    // Sesión
    esJefe, nombreJefe,
    // Datos
    reportesMostrados, colaboradores,
    // UI
    cargando, recargando, error, tabActivo, setTabActivo,
    onRefresh: recargar,
    // Modal asignación
    modalVisible, setModalVisible,
    reporteSeleccionado,
    abrirModal, asignar,
    // Edición
    editando, nuevoComentario, nuevaPrioridad, nuevoEstado,
    setNuevoComentario, setNuevaPrioridad, setNuevoEstado,
    iniciarEdicion, cancelarEdicion, guardarCambios,
    // Reintentar
    reintentar: iniciar,
  }
}
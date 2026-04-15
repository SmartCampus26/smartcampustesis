// ─── useReasignarEmpleado.ts ──────────────────────────────────────────────────
// Hook de ReasignarEmpleado.tsx.
// Llama a cargarEmpleadosYReportes(), reasignarReporteDB(),
// filtrarEmpleados() y obtenerNombreDesdeSesion() de Reasignarempleadoservice.

import { useEffect, useState } from 'react'
import {
  cargarEmpleadosYReportes,
  filtrarEmpleados,
  obtenerNombreDesdeSesion,
  reasignarReporteDB,
} from '../../services/admin/Reasignarempleadoservice'
import { useSesion } from '../../context/SesionContext'
import { Empleado, Reporte } from '../../types/Database'

export function useReasignarEmpleado() {
  const { sesion } = useSesion()

  const [empleados, setEmpleados]                     = useState<Empleado[]>([])
  const [reportes, setReportes]                       = useState<Reporte[]>([])
  const [cargando, setCargando]                       = useState(true)
  const [error, setError]                             = useState<string | null>(null)
  const [nombreAutoridad, setNombreAutoridad]         = useState('Sistema')

  // Modal de selección de colaborador
  const [modalVisible, setModalVisible]               = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)

  // Filtros del modal
  const [filtroDepto, setFiltroDepto] = useState('todos')
  const [filtroCargo, setFiltroCargo] = useState('todos')

  const cargar = async () => {
    try {
      const { empleados: e, reportes: r } = await cargarEmpleadosYReportes()
      setEmpleados(e)
      setReportes(r)
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos')
    }
  }

  useEffect(() => {
    const init = async () => {
      setCargando(true)
      setNombreAutoridad(obtenerNombreDesdeSesion(sesion))
      await cargar()
      setCargando(false)
    }
    init()
  }, [sesion])

  const abrirModal = (reporte: Reporte) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  const reasignar = async (empleadoId: string) => {
    if (!reporteSeleccionado) return
    await reasignarReporteDB(reporteSeleccionado.idReporte, empleadoId, nombreAutoridad)
    setModalVisible(false)
    cargar()
  }

  const empleadosFiltrados = filtrarEmpleados(empleados, filtroDepto, filtroCargo)

  return {
    empleados, reportes, empleadosFiltrados,
    cargando, error, nombreAutoridad,
    modalVisible, setModalVisible,
    reporteSeleccionado, abrirModal, reasignar,
    filtroDepto, setFiltroDepto,
    filtroCargo, setFiltroCargo,
  }
}
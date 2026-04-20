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
import { useToast } from '../../context/ToastContext'
import { Empleado, Reporte } from '../../types/Database'

export function useReasignarEmpleado() {
  const { sesion }    = useSesion()
  const { showToast } = useToast()

  const [empleados, setEmpleados]             = useState<Empleado[]>([])
  const [reportes, setReportes]               = useState<Reporte[]>([])
  const [cargando, setCargando]               = useState(true)
  const [error, setError]                     = useState<string | null>(null)
  const [nombreAutoridad, setNombreAutoridad] = useState('Sistema')

  const [modalVisible, setModalVisible]               = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)

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
    try {
      await reasignarReporteDB(reporteSeleccionado.idReporte, empleadoId, nombreAutoridad)
      showToast('Reporte reasignado correctamente', 'success')
      setModalVisible(false)
      cargar()
    } catch (err: any) {
      showToast(err.message || 'Error al reasignar', 'error')
    }
  }

  const empleadosFiltrados = filtrarEmpleados(empleados, filtroDepto, filtroCargo)

  const getNombreAsignado = (idEmpl?: string): string => {
    if (!idEmpl) return 'Sin asignar'
    const emp = empleados.find(e => e.idEmpl === idEmpl)
    return emp ? `${emp.nomEmpl} ${emp.apeEmpl}` : 'Desconocido'
  }

  return {
    empleados, reportes, empleadosFiltrados,
    cargando, error, nombreAutoridad,
    modalVisible, setModalVisible,
    reporteSeleccionado, abrirModal, reasignar,
    filtroDepto, setFiltroDepto,
    filtroCargo, setFiltroCargo,
    getNombreAsignado,
  }
}
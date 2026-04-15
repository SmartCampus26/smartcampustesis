// ─── useTodosReportes.ts ──────────────────────────────────────────────────────
// Hook de TodosReportes.tsx.
// Llama a cargarDatosTodosReportes(), filtrarTodosReportes() y eliminarReporte().

import { useEffect, useState } from 'react'
import {
  cargarDatosTodosReportes,
  eliminarReporte,
  filtrarTodosReportes,
  reporte,
  usuario,
} from '../../services/admin/TodosReportesService'

export function useTodosReportes() {
  const [reportes, setReportes]   = useState<reporte[]>([])
  const [usuarios, setUsuarios]   = useState<usuario[]>([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState<string | null>(null)

  // Filtros
  const [busqueda, setBusqueda]         = useState('')
  const [filtroRol, setFiltroRol]       = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const cargar = async () => {
    setCargando(true)
    try {
      const { usuarios: u, reportes: r } = await cargarDatosTodosReportes()
      setUsuarios(u)
      setReportes(r)
    } catch (err: any) {
      setError(err.message || 'Error al cargar reportes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleEliminar = async (idReporte: string) => {
    await eliminarReporte(idReporte)
    // Actualización local sin recargar desde BD
    setReportes(prev => prev.filter(r => r.idReporte !== idReporte))
  }

  const reportesFiltrados = filtrarTodosReportes(
    reportes, usuarios, busqueda, filtroRol, filtroEstado
  )

  return {
    reportes, usuarios, reportesFiltrados,
    busqueda, setBusqueda,
    filtroRol, setFiltroRol,
    filtroEstado, setFiltroEstado,
    cargando, error,
    handleEliminar,
  }
}
// ─── useListadoReportes.ts ────────────────────────────────────────────────────
// Hook de ListadoReportes.tsx.
// Llama a cargarMisReportes() y aplicarFiltrosReportes() del servicio.

import { useEffect, useState } from 'react'
import {
  aplicarFiltrosReportes,
  cargarMisReportes,
  FiltroEstado,
} from '../../services/reportes/ListadoReportesService'
import { useSesion } from '../../context/SesionContext'
import { Reporte } from '../../types/Database'

export function useListadoReportes(filtroInicial?: string) {
  const { sesion } = useSesion()

  const [reportes, setReportes]             = useState<Reporte[]>([])
  const [filtroEstado, setFiltroEstado]     = useState<FiltroEstado>(
    (filtroInicial as FiltroEstado) ?? 'todos'
  )
  const [busqueda, setBusqueda]             = useState('')
  const [cargando, setCargando]             = useState(true)
  const [refrescando, setRefrescando]       = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  const cargar = async () => {
    if (!sesion) return
    try {
      const data = await cargarMisReportes(sesion)
      setReportes(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar reportes')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  useEffect(() => { if (sesion) cargar() }, [sesion])

  const onRefresh = () => { setRefrescando(true); cargar() }

  // Filtrado en memoria — delegado al servicio
  const reportesFiltrados = aplicarFiltrosReportes(reportes, filtroEstado, busqueda)

  const onChangeFiltro = (v: string) => setFiltroEstado(v as FiltroEstado)

  return {
    reportes, reportesFiltrados,
    filtroEstado, setFiltroEstado: onChangeFiltro,
    busqueda, setBusqueda,
    cargando, refrescando, error,
    onRefresh,
  }
}
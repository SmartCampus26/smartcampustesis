import { Reporte } from '../types/Database'

export interface FiltrosReporte {
  fechaInicio?: Date
  fechaFin?: Date
  departamento?: string
  estado?: string
  prioridad?: string
}

export function filtrarReportes(
  reportes: Reporte[],
  filtros: FiltrosReporte
): Reporte[] {
  return reportes.filter(r => {
    if (filtros.estado && r.estReporte !== filtros.estado) return false
    if (filtros.prioridad && r.prioReporte !== filtros.prioridad) return false
    if (
      filtros.fechaInicio &&
      new Date(r.fecReporte) < filtros.fechaInicio
    ) return false
    if (
      filtros.fechaFin &&
      new Date(r.fecReporte) > filtros.fechaFin
    ) return false

    return true
  })
}

import { obtenerReportes } from './ReporteService'
import { obtenerSesion } from '../util/Session'
import { Reporte } from '../types/Database'

export type FiltroEstado = 'todos' | 'pendiente' | 'en proceso' | 'resuelto'

/**
 * Carga los reportes del usuario autenticado, ordenados por fecha descendente.
 */
export const cargarMisReportes = async (): Promise<Reporte[]> => {
  const sesion = await obtenerSesion()
  const { data, error } = await obtenerReportes()

  if (error) throw error

  const misReportes = (data || []).filter(
    (r: Reporte) => r.idUser === sesion?.id
  )

  misReportes.sort(
    (a, b) => new Date(b.fecReporte).getTime() - new Date(a.fecReporte).getTime()
  )

  return misReportes
}

/**
 * Filtra reportes por estado y texto de búsqueda.
 */
export const aplicarFiltrosReportes = (
  reportes: Reporte[],
  filtroEstado: FiltroEstado,
  busqueda: string
): Reporte[] => {
  let resultado = [...reportes]

  if (filtroEstado !== 'todos') {
    resultado = resultado.filter(
      (r) => r.estReporte.toLowerCase() === filtroEstado
    )
  }

  if (busqueda.trim()) {
    const t = busqueda.toLowerCase()
    resultado = resultado.filter(
      (r) =>
        r.descriReporte.toLowerCase().includes(t) ||
        r.idReporte.toString().includes(t)
    )
  }

  return resultado
}

/**
 * Retorna el color correspondiente al estado del reporte.
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pendiente': return '#FFA726'
    case 'en proceso': return '#42A5F5'
    case 'resuelto':  return '#66BB6A'
    default:          return '#8B9BA8'
  }
}

/**
 * Retorna el color correspondiente a la prioridad del reporte.
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'urgente': return '#FF5252'
    case 'alta':    return '#FFA726'
    case 'media':   return '#42A5F5'
    case 'baja':    return '#8B9BA8'
    default:        return '#8B9BA8'
  }
}
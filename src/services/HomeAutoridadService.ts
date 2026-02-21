import { obtenerSesion } from '../util/Session'
import { obtenerReportes } from './ReporteService'
import { Reporte } from '../types/Database'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface HomeAutoridadStats {
  total: number
  pendientes: number
  enProceso: number
  resueltos: number
}

export interface HomeAutoridadData {
  usuario: any
  reportes: Reporte[]
  stats: HomeAutoridadStats
}

// ─── Carga de datos Autoridad ─────────────────────────────────────────────────

/**
 * Obtiene la sesión de la autoridad, verifica que sea de tipo 'usuario',
 * filtra sus reportes y calcula las estadísticas.
 *
 * @returns Datos del usuario, reportes y estadísticas
 */
export async function cargarDatosAutoridad(): Promise<HomeAutoridadData> {
  const sesion = await obtenerSesion()

  // Verificar que la sesión sea de tipo usuario
  if (!sesion || sesion.tipo !== 'usuario') {
    throw new Error('Sesión no válida para este módulo')
  }

  // Obtener todos los reportes
  const { data: reportesData, error: reportesError } = await obtenerReportes()
  if (reportesError) throw reportesError

  // Filtrar solo los reportes creados por este usuario
  const reportes = (reportesData || []).filter(
    (r: Reporte) => r.idUser === sesion.id
  )

  // Calcular estadísticas derivadas
  const stats: HomeAutoridadStats = {
    total:      reportes.length,
    pendientes: reportes.filter((r: Reporte) => r.estReporte.toLowerCase() === 'pendiente').length,
    enProceso:  reportes.filter((r: Reporte) => r.estReporte.toLowerCase() === 'en proceso').length,
    resueltos:  reportes.filter((r: Reporte) => r.estReporte.toLowerCase() === 'resuelto').length,
  }

  return { usuario: sesion.data, reportes, stats }
}

// ─── Funciones auxiliares de presentación ────────────────────────────────────

/**
 * Retorna el color correspondiente al estado del reporte
 *
 * @param status - Estado del reporte
 * @returns Color en formato hexadecimal
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pendiente':  return '#FFA726'
    case 'en proceso': return '#42A5F5'
    case 'resuelto':   return '#66BB6A'
    default:           return '#8B9BA8'
  }
}

/**
 * Retorna el color correspondiente a la prioridad del reporte
 *
 * @param priority - Prioridad del reporte
 * @returns Color en formato hexadecimal
 */
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'urgente': return '#FF5252'
    case 'alta':    return '#FFA726'
    case 'media':   return '#42A5F5'
    case 'baja':    return '#8B9BA8'
    default:        return '#8B9BA8'
  }
}
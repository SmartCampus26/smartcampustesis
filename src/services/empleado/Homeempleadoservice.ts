import { Reporte, Sesion } from '../../types/Database'
import { obtenerReportes } from '../reportes/ReporteService'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface HomeEmpleadoData {
  empleado: any
  reportes: Reporte[]
}

// ─── Carga de datos Empleado ──────────────────────────────────────────────────

/**
 * Obtiene la sesión del empleado, verifica que sea de tipo 'empleado'
 * y filtra los reportes que le han sido asignados.
 *
 * Incluye reintento automático si la sesión aún no está disponible
 * (puede ocurrir al volver de pantallas secundarias mientras AsyncStorage
 * todavía está cargando la sesión en memoria).
 *
 * @returns Datos del empleado y su lista de reportes asignados
 */
export async function cargarDatosEmpleado(sesion: Sesion): Promise<HomeEmpleadoData> {
  // Ya no necesita reintentos ni leer AsyncStorage — recibe la sesión del contexto
  if (!sesion || sesion.tipo !== 'empleado') {
    throw new Error('Sesión no válida para este módulo')
  }

  const { data: reportesData, error: reportesError } = await obtenerReportes()
  if (reportesError) throw reportesError

  const reportes = (reportesData || []).filter(
    (r: Reporte) => r.idEmpl === sesion.id
  )

  return { empleado: sesion.data, reportes }
}

// ─── Funciones auxiliares de presentación ────────────────────────────────────

/**
 * Retorna el color correspondiente al estado del reporte
 *
 * @param status - Estado del reporte
 * @returns Color en formato hexadecimal
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Pendiente':  return '#FFA726'
    case 'En Proceso': return '#21D0B2'
    case 'Resuelto':   return '#34F5C5'
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
  switch (priority) {
    case 'Urgente': return '#FF5252'
    case 'Alta':    return '#FFA726'
    case 'Media':   return '#21D0B2'
    case 'Baja':    return '#8B9BA8'
    default:        return '#8B9BA8'
  }
}
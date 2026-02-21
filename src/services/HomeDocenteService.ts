import { obtenerSesion } from '../util/Session'
import { obtenerReportes } from './ReporteService'
import { Reporte } from '../types/Database'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface HomeDocenteStats {
  total: number
  pendientes: number
  enProceso: number
  resueltos: number
}

export interface HomeDocenteData {
  usuario: any
  reportes: Reporte[]
  stats: HomeDocenteStats
}

// ─── Carga de datos Docente ───────────────────────────────────────────────────

/**
 * Obtiene la sesión del docente, verifica que sea de tipo 'usuario',
 * filtra sus reportes y calcula las estadísticas.
 *
 * @returns Datos del usuario, reportes y estadísticas
 */
export async function cargarDatosDocente(): Promise<HomeDocenteData> {
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

  // Guardar reportes y calcular estadísticas
  const stats: HomeDocenteStats = {
    total:      reportes.length,
    pendientes: reportes.filter((r: Reporte) => r.estReporte === 'Pendiente').length,
    enProceso:  reportes.filter((r: Reporte) => r.estReporte === 'En Proceso').length,
    resueltos:  reportes.filter((r: Reporte) => r.estReporte === 'Resuelto').length,
  }

  return { usuario: sesion.data, reportes, stats }
}
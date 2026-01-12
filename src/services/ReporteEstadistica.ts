// Se importa el tipo Reporte para asegurar tipado fuerte
// y evitar errores al acceder a las propiedades del objeto
import { Reporte } from '../types/Database'

/**
 * Genera estadísticas generales a partir de los reportes
 * Calcula el total y la cantidad de reportes por estado
 *
 * @param reportes - Arreglo de reportes obtenidos de la base de datos
 * @returns Objeto con estadísticas por estado
 */
export function generarEstadisticas(reportes: Reporte[]) {
  // Total de reportes existentes
  return {
    // Total de reportes existentes
    total: reportes.length,
    // Cantidad de reportes con estado "Pendiente"
    pendientes: reportes.filter(r => r.estReporte === 'Pendiente').length,
    // Cantidad de reportes con estado "En Proceso"
    enProceso: reportes.filter(r => r.estReporte === 'En Proceso').length,
    // Cantidad de reportes con estado "Resuelto"
    resueltos: reportes.filter(r => r.estReporte === 'Resuelto').length,
  }
}

/**
 * Genera estadísticas de los reportes según su prioridad
 * Se utiliza para gráficos estadísticos y análisis de urgencia
 *
 * @param reportes - Arreglo de reportes obtenidos de la base de datos
 * @returns Objeto con estadísticas por nivel de prioridad
 */
export function estadisticasPorPrioridad(reportes: Reporte[]) {
  return {
    // Reportes marcados como prioridad "Urgente"
    urgente: reportes.filter(r => r.prioReporte === 'Urgente').length,
    // Reportes con prioridad "Alta"
    alta: reportes.filter(r => r.prioReporte === 'Alta').length,
    // Reportes con prioridad "Media"
    media: reportes.filter(r => r.prioReporte === 'Media').length,
    // Reportes con prioridad "Baja"
    baja: reportes.filter(r => r.prioReporte === 'Baja').length,
  }
}

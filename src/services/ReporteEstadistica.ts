import { Reporte } from '../types/Database'

export function generarEstadisticas(reportes: Reporte[]) {
  return {
    total: reportes.length,
    pendientes: reportes.filter(r => r.estReporte === 'Pendiente').length,
    enProceso: reportes.filter(r => r.estReporte === 'En Proceso').length,
    resueltos: reportes.filter(r => r.estReporte === 'Resuelto').length,
  }
}

export function estadisticasPorPrioridad(reportes: Reporte[]) {
  return {
    urgente: reportes.filter(r => r.prioReporte === 'Urgente').length,
    alta: reportes.filter(r => r.prioReporte === 'Alta').length,
    media: reportes.filter(r => r.prioReporte === 'Media').length,
    baja: reportes.filter(r => r.prioReporte === 'Baja').length,
  }
}

import { Reporte, Empleado, Usuario, Lugar, Objeto } from '../types/Database'

export interface FiltrosReporte {
  // Filtros de fecha
  fechaInicio?: Date
  fechaFin?: Date
  
  // Filtros de categorización
  estado?: string
  prioridad?: string
  
  // Filtros de relaciones (IDs)
  idUser?: number
  idEmpl?: number
  
  // Filtro de búsqueda de texto
  descripcion?: string
  comentario?: string
  
  // Búsqueda general (busca en todos los campos de texto)
  busquedaGeneral?: string
}

/**
 * Filtra reportes según los criterios especificados
 * Todos los filtros son opcionales y se combinan con lógica AND
 */
export function filtrarReportes(
  reportes: Reporte[],
  filtros: FiltrosReporte
): Reporte[] {
  if (!reportes || reportes.length === 0) return []
  
  return reportes.filter(r => {
    // Filtro por estado
    if (filtros.estado && r.estReporte !== filtros.estado) {
      return false
    }
    
    // Filtro por prioridad
    if (filtros.prioridad && r.prioReporte !== filtros.prioridad) {
      return false
    }
    
    // Filtro por ID de usuario
    if (filtros.idUser !== undefined && r.idUser !== filtros.idUser) {
      return false
    }
    
    // Filtro por ID de empleado
    if (filtros.idEmpl !== undefined && r.idEmpl !== filtros.idEmpl) {
      return false
    }
    
    // Filtro por descripción (case-insensitive y búsqueda parcial)
    if (filtros.descripcion && r.descriReporte) {
      const descripcionReporte = r.descriReporte.toLowerCase()
      const descripcionFiltro = filtros.descripcion.toLowerCase()
      if (!descripcionReporte.includes(descripcionFiltro)) {
        return false
      }
    }
    
    // Filtro por comentario (case-insensitive y búsqueda parcial)
    if (filtros.comentario && r.comentReporte) {
      const comentarioReporte = r.comentReporte.toLowerCase()
      const comentarioFiltro = filtros.comentario.toLowerCase()
      if (!comentarioReporte.includes(comentarioFiltro)) {
        return false
      }
    }
    
    // Filtro por rango de fechas - fecha inicio
    if (filtros.fechaInicio) {
      const fechaReporte = new Date(r.fecReporte)
      const fechaInicio = new Date(filtros.fechaInicio)
      fechaInicio.setHours(0, 0, 0, 0)
      
      if (fechaReporte < fechaInicio) {
        return false
      }
    }
    
    // Filtro por rango de fechas - fecha fin
    if (filtros.fechaFin) {
      const fechaReporte = new Date(r.fecReporte)
      const fechaFin = new Date(filtros.fechaFin)
      fechaFin.setHours(23, 59, 59, 999)
      
      if (fechaReporte > fechaFin) {
        return false
      }
    }
    
    // Búsqueda general (busca en múltiples campos)
    if (filtros.busquedaGeneral) {
      const termino = filtros.busquedaGeneral.toLowerCase()
      const coincide = 
        r.descriReporte?.toLowerCase().includes(termino) ||
        r.comentReporte?.toLowerCase().includes(termino) ||
        r.idReporte?.toString().includes(termino) ||
        r.estReporte?.toLowerCase().includes(termino) ||
        r.prioReporte?.toLowerCase().includes(termino) ||
        // Buscar en datos relacionados si existen
        r.usuario?.nomUser?.toLowerCase().includes(termino) ||
        r.usuario?.apeUser?.toLowerCase().includes(termino) ||
        r.usuario?.correoUser?.toLowerCase().includes(termino) ||
        r.empleado?.nomEmpl?.toLowerCase().includes(termino) ||
        r.empleado?.apeEmpl?.toLowerCase().includes(termino) ||
        r.empleado?.deptEmpl?.toLowerCase().includes(termino)
      
      if (!coincide) {
        return false
      }
    }
    
    return true
  })
}

/**
 * Filtra reportes por múltiples estados
 */
export function filtrarPorEstados(
  reportes: Reporte[],
  estados: string[]
): Reporte[] {
  if (!estados || estados.length === 0) return reportes
  return reportes.filter(r => estados.includes(r.estReporte))
}

/**
 * Filtra reportes por múltiples prioridades
 */
export function filtrarPorPrioridades(
  reportes: Reporte[],
  prioridades: string[]
): Reporte[] {
  if (!prioridades || prioridades.length === 0) return reportes
  return reportes.filter(r => prioridades.includes(r.prioReporte))
}

/**
 * Filtra reportes de un usuario específico
 */
export function filtrarPorUsuario(
  reportes: Reporte[],
  idUser: number
): Reporte[] {
  return reportes.filter(r => r.idUser === idUser)
}

/**
 * Filtra reportes asignados a un empleado específico
 */
export function filtrarPorEmpleado(
  reportes: Reporte[],
  idEmpl: number
): Reporte[] {
  return reportes.filter(r => r.idEmpl === idEmpl)
}

/**
 * Filtra reportes por departamento del empleado asignado
 */
export function filtrarPorDepartamento(
  reportes: Reporte[],
  departamento: string
): Reporte[] {
  return reportes.filter(r => 
    r.empleado?.deptEmpl?.toLowerCase() === departamento.toLowerCase()
  )
}

/**
 * Filtra reportes por nombre de usuario (creador)
 */
export function filtrarPorNombreUsuario(
  reportes: Reporte[],
  nombre: string
): Reporte[] {
  const nombreBusqueda = nombre.toLowerCase()
  return reportes.filter(r => {
    const nombreCompleto = `${r.usuario?.nomUser} ${r.usuario?.apeUser}`.toLowerCase()
    return nombreCompleto.includes(nombreBusqueda)
  })
}

/**
 * Filtra reportes por nombre de empleado (asignado)
 */
export function filtrarPorNombreEmpleado(
  reportes: Reporte[],
  nombre: string
): Reporte[] {
  const nombreBusqueda = nombre.toLowerCase()
  return reportes.filter(r => {
    const nombreCompleto = `${r.empleado?.nomEmpl} ${r.empleado?.apeEmpl}`.toLowerCase()
    return nombreCompleto.includes(nombreBusqueda)
  })
}

/**
 * Filtra reportes creados en un rango de fechas
 */
export function filtrarPorRangoFechas(
  reportes: Reporte[],
  fechaInicio: Date,
  fechaFin: Date
): Reporte[] {
  const inicio = new Date(fechaInicio)
  inicio.setHours(0, 0, 0, 0)
  
  const fin = new Date(fechaFin)
  fin.setHours(23, 59, 59, 999)
  
  return reportes.filter(r => {
    const fechaReporte = new Date(r.fecReporte)
    return fechaReporte >= inicio && fechaReporte <= fin
  })
}

/**
 * Filtra reportes creados hoy
 */
export function filtrarReportesHoy(reportes: Reporte[]): Reporte[] {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)
  
  return reportes.filter(r => {
    const fechaReporte = new Date(r.fecReporte)
    return fechaReporte >= hoy && fechaReporte < manana
  })
}

/**
 * Filtra reportes de la última semana
 */
export function filtrarReportesSemana(reportes: Reporte[]): Reporte[] {
  const hace7Dias = new Date()
  hace7Dias.setDate(hace7Dias.getDate() - 7)
  hace7Dias.setHours(0, 0, 0, 0)
  
  return reportes.filter(r => {
    const fechaReporte = new Date(r.fecReporte)
    return fechaReporte >= hace7Dias
  })
}

/**
 * Filtra reportes del último mes
 */
export function filtrarReportesMes(reportes: Reporte[]): Reporte[] {
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)
  hace30Dias.setHours(0, 0, 0, 0)
  
  return reportes.filter(r => {
    const fechaReporte = new Date(r.fecReporte)
    return fechaReporte >= hace30Dias
  })
}

/**
 * Filtra reportes que tienen imagen
 */
export function filtrarConImagen(reportes: Reporte[]): Reporte[] {
  return reportes.filter(r => r.imgReporte && r.imgReporte.trim() !== '')
}

/**
 * Filtra reportes sin asignar (sin empleado)
 */
export function filtrarSinAsignar(reportes: Reporte[]): Reporte[] {
  return reportes.filter(r => !r.idEmpl || r.idEmpl === 0)
}

/**
 * Ordena reportes por fecha (más recientes primero)
 */
export function ordenarPorFecha(
  reportes: Reporte[],
  orden: 'asc' | 'desc' = 'desc'
): Reporte[] {
  return [...reportes].sort((a, b) => {
    const fechaA = new Date(a.fecReporte).getTime()
    const fechaB = new Date(b.fecReporte).getTime()
    return orden === 'desc' ? fechaB - fechaA : fechaA - fechaB
  })
}

/**
 * Ordena reportes por prioridad (alta, media, baja)
 */
export function ordenarPorPrioridad(reportes: Reporte[]): Reporte[] {
  const prioridadValor: Record<string, number> = {
    'alta': 3,
    'media': 2,
    'baja': 1
  }
  
  return [...reportes].sort((a, b) => {
    const valorA = prioridadValor[a.prioReporte.toLowerCase()] || 0
    const valorB = prioridadValor[b.prioReporte.toLowerCase()] || 0
    return valorB - valorA
  })
}

/**
 * Ordena reportes por estado (pendiente > en proceso > resuelto)
 */
export function ordenarPorEstado(reportes: Reporte[]): Reporte[] {
  const estadoValor: Record<string, number> = {
    'pendiente': 3,
    'en proceso': 2,
    'resuelto': 1
  }
  
  return [...reportes].sort((a, b) => {
    const valorA = estadoValor[a.estReporte.toLowerCase()] || 0
    const valorB = estadoValor[b.estReporte.toLowerCase()] || 0
    return valorB - valorA
  })
}

/**
 * Cuenta reportes agrupados por estado
 */
export function contarPorEstado(reportes: Reporte[]): Record<string, number> {
  return reportes.reduce((acc, r) => {
    acc[r.estReporte] = (acc[r.estReporte] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * Cuenta reportes agrupados por prioridad
 */
export function contarPorPrioridad(reportes: Reporte[]): Record<string, number> {
  return reportes.reduce((acc, r) => {
    acc[r.prioReporte] = (acc[r.prioReporte] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * Cuenta reportes agrupados por departamento
 */
export function contarPorDepartamento(reportes: Reporte[]): Record<string, number> {
  return reportes.reduce((acc, r) => {
    const dept = r.empleado?.deptEmpl || 'Sin asignar'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * Cuenta reportes agrupados por empleado
 */
export function contarPorEmpleado(reportes: Reporte[]): Record<string, number> {
  return reportes.reduce((acc, r) => {
    if (r.empleado) {
      const nombreEmpleado = `${r.empleado.nomEmpl} ${r.empleado.apeEmpl}`
      acc[nombreEmpleado] = (acc[nombreEmpleado] || 0) + 1
    } else {
      acc['Sin asignar'] = (acc['Sin asignar'] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
}

/**
 * Obtiene estadísticas generales de los reportes
 */
export function obtenerEstadisticas(reportes: Reporte[]) {
  return {
    total: reportes.length,
    pendientes: reportes.filter(r => r.estReporte.toLowerCase() === 'pendiente').length,
    enProceso: reportes.filter(r => r.estReporte.toLowerCase() === 'en proceso').length,
    resueltos: reportes.filter(r => r.estReporte.toLowerCase() === 'resuelto').length,
    prioridadAlta: reportes.filter(r => r.prioReporte.toLowerCase() === 'alta').length,
    prioridadMedia: reportes.filter(r => r.prioReporte.toLowerCase() === 'media').length,
    prioridadBaja: reportes.filter(r => r.prioReporte.toLowerCase() === 'baja').length,
    conImagen: reportes.filter(r => r.imgReporte && r.imgReporte.trim() !== '').length,
    sinAsignar: reportes.filter(r => !r.idEmpl || r.idEmpl === 0).length,
    porEstado: contarPorEstado(reportes),
    porPrioridad: contarPorPrioridad(reportes),
    porDepartamento: contarPorDepartamento(reportes),
    porEmpleado: contarPorEmpleado(reportes)
  }
}

/**
 * Limpia filtros vacíos del objeto de filtros
 */
export function limpiarFiltros(filtros: FiltrosReporte): FiltrosReporte {
  const filtrosLimpios: FiltrosReporte = {}
  
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      filtrosLimpios[key as keyof FiltrosReporte] = value as any
    }
  })
  
  return filtrosLimpios
}

/**
 * Verifica si hay filtros activos
 */
export function tieneFiltrosActivos(filtros: FiltrosReporte): boolean {
  const filtrosLimpios = limpiarFiltros(filtros)
  return Object.keys(filtrosLimpios).length > 0
}

/**
 * Obtiene el top N de empleados con más reportes asignados
 */
export function obtenerTopEmpleados(reportes: Reporte[], limite: number = 5) {
  const conteo = contarPorEmpleado(reportes)
  return Object.entries(conteo)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limite)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
}

/**
 * Obtiene el top N de usuarios con más reportes creados
 */
export function obtenerTopUsuarios(reportes: Reporte[], limite: number = 5) {
  const conteo = reportes.reduce((acc, r) => {
    if (r.usuario) {
      const nombreUsuario = `${r.usuario.nomUser} ${r.usuario.apeUser}`
      acc[nombreUsuario] = (acc[nombreUsuario] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(conteo)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limite)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
}
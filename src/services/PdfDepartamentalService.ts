/**
 * PdfDepartamentalService.ts
 *
 * Servicio responsable de obtener y organizar los reportes
 * agrupados por departamento y por empleado, para la generación
 * de dos tipos de PDF:
 *
 *  PDF GENERAL (jefe de área):
 *   - Solo su departamento (verificado por cargEmpl === 'jefe')
 *   - Sección por empleado con reportes completos y mini gráficos
 *
 *  PDF RESUMIDO (autoridad):
 *   - Tabla con todos los empleados: asignados, pendientes, en proceso, resueltos
 *   - Filtro por departamento: todos / sistemas / mantenimiento
 *   - Gráfico global al final
 *
 * Roles soportados:
 *  - Empleado con cargEmpl === 'jefe' y deptEmpl === 'sistemas'      → PDF General de Sistemas
 *  - Empleado con cargEmpl === 'jefe' y deptEmpl === 'mantenimiento' → PDF General de Mantenimiento
 *  - Empleados con otro cargo                                         → sin acceso
 *  - Usuario con rolUser === 'autoridad'                              → PDF Resumido con filtro
 *
 * Ubicación: src/services/ (capa de modelo/servicio)
 */

import { obtenerReportes } from './ReporteService'
import { supabase } from '../lib/Supabase'
import { Reporte, Empleado, esEmpleado, esUsuario, Sesion } from '../types/Database'

// ─── Constantes ───────────────────────────────────────────────────────────────

/**
 * Nombres de los departamentos tal como vienen en el campo deptEmpl
 * de la tabla empleado en la base de datos. Siempre en minúsculas.
 */
export const DEPARTAMENTOS = {
  SISTEMAS:      'sistemas',
  MANTENIMIENTO: 'mantenimiento',
} as const

export type NombreDepartamento = typeof DEPARTAMENTOS[keyof typeof DEPARTAMENTOS]

/**
 * Cargo exacto que deben tener los empleados para acceder al PDF General.
 * Valor tal como viene en el campo cargEmpl de la base de datos.
 */
export const CARGO_JEFE = 'jefe'

/**
 * Opciones de filtro de departamento disponibles para la autoridad
 * en el selector de la pantalla de previsualización.
 */
export type FiltroDepartamento = 'todos' | 'sistemas' | 'mantenimiento'

// ─── Interfaces: PDF General ─────────────────────────────────────────────────

/**
 * Agrupa los reportes de un empleado para el PDF General departamental.
 * Cada sección del PDF corresponde a un GrupoEmpleado.
 */
export interface GrupoEmpleado {
  /** ID único del empleado */
  idEmpl: string
  /** Nombre completo: nomEmpl + apeEmpl */
  nombreCompleto: string
  /** Cargo o puesto del empleado (cargEmpl) */
  cargo: string
  /** Departamento al que pertenece (deptEmpl) */
  departamento: string
  /** Lista de reportes asignados al empleado */
  reportes: Reporte[]
  /** Estadísticas calculadas a partir de los reportes del empleado */
  stats: {
    total: number
    pendientes: number
    enProceso: number
    resueltos: number
  }
}

/**
 * Resultado del PDF General (jefe de área):
 * incluye secciones detalladas por empleado con mini gráficos.
 */
export interface DatosPdfGeneral {
  /** Nombre de quien genera el PDF */
  nombreGenerador: string
  /** Puesto del generador */
  puestoGenerador: string
  /** Título del PDF */
  tituloPdf: string
  /** Departamento del informe (ej: 'sistemas') */
  departamento: string
  /** Empleados con reportes agrupados, ordenados por mayor carga */
  grupos: GrupoEmpleado[]
  /**
   * Todos los empleados del departamento incluyendo los que no tienen reportes.
   * Se usa para la tabla resumen de la página 1 del PDF.
   */
  todosLosEmpleados: GrupoEmpleado[]
  /** Estadísticas globales del departamento */
  statsGlobales: {
    total: number
    pendientes: number
    enProceso: number
    resueltos: number
    totalEmpleados: number
  }
  /** Todos los reportes del departamento en lista plana (para gráficos globales) */
  todosLosReportes: Reporte[]
}

// ─── Interfaces: PDF Resumido ─────────────────────────────────────────────────

/**
 * Fila de empleado para el PDF Resumido (autoridad).
 * Solo contiene totales por estado, sin lista de reportes individuales.
 */
export interface FilaResumenEmpleado {
  idEmpl: string
  nombreCompleto: string
  cargo: string
  departamento: string
  stats: {
    total: number
    pendientes: number
    enProceso: number
    resueltos: number
  }
}

/**
 * Resultado del PDF Resumido (autoridad):
 * tabla de empleados con totales y gráfico global al final.
 */
export interface DatosPdfResumido {
  /** Nombre de quien genera el PDF */
  nombreGenerador: string
  /** Puesto del generador */
  puestoGenerador: string
  /** Título del PDF */
  tituloPdf: string
  /** Filtro aplicado en la UI: 'todos' | 'sistemas' | 'mantenimiento' */
  filtroDepartamento: FiltroDepartamento
  /** Filas de empleados con sus totales por estado */
  filas: FilaResumenEmpleado[]
  /** Estadísticas globales del informe filtrado */
  statsGlobales: {
    total: number
    pendientes: number
    enProceso: number
    resueltos: number
    totalEmpleados: number
  }
  /** Todos los reportes del filtro aplicado (para el gráfico global) */
  todosLosReportes: Reporte[]
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Calcula las estadísticas básicas de una lista de reportes.
 *
 * @param reportes - Lista de reportes
 * @returns Objeto con total, pendientes, enProceso y resueltos
 */
function calcularStats(reportes: Reporte[]) {
  return {
    total:      reportes.length,
    pendientes: reportes.filter(r => r.estReporte?.toLowerCase() === 'pendiente').length,
    enProceso:  reportes.filter(r => r.estReporte?.toLowerCase() === 'en proceso').length,
    resueltos:  reportes.filter(r => r.estReporte?.toLowerCase() === 'resuelto').length,
  }
}

/**
 * Filtra una lista de reportes por departamento del empleado asignado.
 *
 * @param reportes - Lista completa de reportes
 * @param filtro - 'todos' para sin filtro, o nombre de departamento
 * @returns Lista filtrada de reportes
 */
function filtrarPorDept(reportes: Reporte[], filtro: FiltroDepartamento): Reporte[] {
  if (filtro === 'todos') return reportes

  // Log de diagnóstico: muestra todos los valores únicos de deptEmpl
  // Útil para detectar variaciones en la BD (ej: 'Sistemas' vs 'sistemas')
  const deptsUnicos = [...new Set(
    reportes.map(r => r.empleado?.deptEmpl ?? 'sin_empleado')
  )]
  console.log('[PdfDepartamentalService] filtro="' + filtro + '" | deptEmpl en BD:', deptsUnicos)

  // Usa trim() y toLowerCase() para tolerar espacios y mayúsculas inesperadas
  return reportes.filter(r => {
    const dept = r.empleado?.deptEmpl?.toLowerCase().trim() || ''
    return dept === filtro.toLowerCase().trim()
  })
}

// ─── PDF GENERAL (jefe de área) ───────────────────────────────────────────────

/**
 * Carga y organiza los datos para el PDF General Departamental.
 * Solo accesible para empleados con cargEmpl === 'jefe'.
 *
 * Lógica de acceso:
 * - Verifica sesión tipo 'empleado'
 * - Verifica cargEmpl === 'jefe'
 * - Verifica deptEmpl en (sistemas | mantenimiento)
 * - Filtra reportes solo del departamento del jefe
 * - Agrupa por empleado con detalle completo
 *
 * @returns DatosPdfGeneral listos para PdfGeneralService
 * @throws Error si no tiene permisos o la sesión es inválida
 */
export async function cargarDatosPdfGeneral(sesion: Sesion): Promise<DatosPdfGeneral> {
  if (!sesion) throw new Error('No hay sesión activa')

  if (!esEmpleado(sesion)) {
    throw new Error('Solo los colaboradores jefes pueden acceder al PDF General')
  }

  const e     = sesion.data as Empleado
  const cargo = e.cargEmpl?.toLowerCase() || ''
  const dept  = e.deptEmpl?.toLowerCase() || ''

  // Verificar cargo jefe
  if (cargo !== CARGO_JEFE) {
    throw new Error('Solo los jefes de área pueden generar el informe general')
  }

  // Verificar departamento válido
  if (dept !== DEPARTAMENTOS.SISTEMAS && dept !== DEPARTAMENTOS.MANTENIMIENTO) {
    throw new Error('Tu departamento no tiene acceso al informe general')
  }

  const nombreGenerador = `${e.nomEmpl} ${e.apeEmpl}`.trim()
  const puestoGenerador = e.cargEmpl || ''
  const deptCapital     = dept.charAt(0).toUpperCase() + dept.slice(1)
  const tituloPdf       = `Informe General — Departamento de ${deptCapital}`

  // Obtener todos los reportes y filtrar por departamento del jefe
  const [reportesResult, empleadosResult] = await Promise.all([
    obtenerReportes(),
    supabase.from('empleado').select('*').eq('deptEmpl', dept),
  ])

  if (reportesResult.error) throw reportesResult.error
  if (empleadosResult.error) throw empleadosResult.error

  const reportesDept = (reportesResult.data || []).filter(
    (r: Reporte) => r.empleado?.deptEmpl?.toLowerCase() === dept
  )

  // Lista completa de empleados del departamento (incluyendo los sin reportes)
  const empleadosDept: Empleado[] = empleadosResult.data || []

  // Agrupar por empleado con detalle completo de reportes
  const mapaEmpleados = new Map<string, GrupoEmpleado>()

  // Primero inicializar TODOS los empleados del depto con stats en cero
  for (const emp of empleadosDept) {
    mapaEmpleados.set(emp.idEmpl, {
      idEmpl:         emp.idEmpl,
      nombreCompleto: `${emp.nomEmpl} ${emp.apeEmpl}`.trim(),
      cargo:          emp.cargEmpl || '—',
      departamento:   emp.deptEmpl || '—',
      reportes:       [],
      stats:          { total: 0, pendientes: 0, enProceso: 0, resueltos: 0 },
    })
  }

  // Luego asignar reportes a quien los tenga
  for (const reporte of reportesDept) {
    if (!reporte.idEmpl) continue
    const grupo = mapaEmpleados.get(reporte.idEmpl)
    if (grupo) grupo.reportes.push(reporte)
  }

  // Calcular stats por empleado
  for (const grupo of mapaEmpleados.values()) {
    grupo.stats = calcularStats(grupo.reportes)
  }

  // todosLosEmpleados: todos del depto ordenados por mayor carga (para tabla resumen)
  const todosLosEmpleados: GrupoEmpleado[] = Array.from(mapaEmpleados.values())
    .sort((a, b) => b.stats.total - a.stats.total)

  // grupos: solo los que tienen al menos un reporte (para secciones individuales del PDF)
  const grupos: GrupoEmpleado[] = todosLosEmpleados.filter(g => g.stats.total > 0)

  return {
    nombreGenerador,
    puestoGenerador,
    tituloPdf,
    departamento: dept,
    grupos,
    todosLosEmpleados,
    statsGlobales: { ...calcularStats(reportesDept), totalEmpleados: todosLosEmpleados.length },
    todosLosReportes: reportesDept,
  }
}

// ─── PDF RESUMIDO (autoridad) ─────────────────────────────────────────────────

/**
 * Carga y organiza los datos para el PDF Resumido de la autoridad.
 * Solo accesible para usuarios con rolUser === 'autoridad' o 'admin'.
 *
 * Lógica de acceso:
 * - Verifica sesión tipo 'usuario'
 * - Verifica rolUser === 'autoridad' o 'admin'
 * - Aplica el filtro de departamento elegido en la UI
 * - Agrupa por empleado mostrando solo totales (sin lista de reportes)
 *
 * @param filtro - Departamento a incluir: 'todos' | 'sistemas' | 'mantenimiento'
 * @returns DatosPdfResumido listos para PdfResumidoService
 * @throws Error si no tiene permisos o la sesión es inválida
 */
export async function cargarDatosPdfResumido(
  filtro: FiltroDepartamento = 'todos',
  sesion: Sesion  
): Promise<DatosPdfResumido> {
  if (!sesion) throw new Error('No hay sesión activa')

  if (!esUsuario(sesion)) {
    throw new Error('Solo los usuarios autorizados pueden generar el informe resumido')
  }

  const u       = sesion.data
  const rolNorm = u.rolUser?.toLowerCase() || ''

  if (rolNorm !== 'autoridad' && rolNorm !== 'admin') {
    throw new Error('No tienes permisos para generar el informe resumido')
  }

  const nombreGenerador = `${u.nomUser} ${u.apeUser}`.trim()
  const puestoGenerador = u.rolUser || 'Usuario'

  const titulos: Record<FiltroDepartamento, string> = {
    todos:         'Informe Resumido — Todos los Departamentos',
    sistemas:      'Informe Resumido — Departamento de Sistemas',
    mantenimiento: 'Informe Resumido — Departamento de Mantenimiento',
  }

  // Obtener reportes y todos los empleados del filtro en paralelo
  const deptsFiltro = filtro === 'todos'
    ? [DEPARTAMENTOS.SISTEMAS, DEPARTAMENTOS.MANTENIMIENTO]
    : [filtro]

  const [reportesResult, ...empleadosResults] = await Promise.all([
    obtenerReportes(),
    ...deptsFiltro.map(d => supabase.from('empleado').select('*').eq('deptEmpl', d)),
  ])

  if (reportesResult.error) throw reportesResult.error

  const reportesFiltrados = filtrarPorDept(reportesResult.data || [], filtro)

  // Unir empleados de todos los departamentos filtrados
  const todosEmpleados: Empleado[] = empleadosResults.flatMap(r => r.data || [])

  // Inicializar mapa con TODOS los empleados en ceros
  const mapaEmpleados = new Map<string, FilaResumenEmpleado & { _rep: Reporte[] }>()

  for (const emp of todosEmpleados) {
    mapaEmpleados.set(emp.idEmpl, {
      idEmpl:         emp.idEmpl,
      nombreCompleto: `${emp.nomEmpl} ${emp.apeEmpl}`.trim(),
      cargo:          emp.cargEmpl || '—',
      departamento:   emp.deptEmpl || '—',
      stats:          { total: 0, pendientes: 0, enProceso: 0, resueltos: 0 },
      _rep:           [],
    })
  }

  // Asignar reportes a quien los tenga
  for (const reporte of reportesFiltrados) {
    if (!reporte.idEmpl) continue
    const entrada = mapaEmpleados.get(reporte.idEmpl)
    if (entrada) entrada._rep.push(reporte)
  }

  // Calcular stats y limpiar _rep
  const filas: FilaResumenEmpleado[] = Array.from(mapaEmpleados.values())
    .map(({ _rep, ...fila }) => { fila.stats = calcularStats(_rep); return fila })
    .sort((a, b) => b.stats.total - a.stats.total)

  return {
    nombreGenerador,
    puestoGenerador,
    tituloPdf:          titulos[filtro],
    filtroDepartamento: filtro,
    filas,
    statsGlobales: { ...calcularStats(reportesFiltrados), totalEmpleados: filas.length },
    todosLosReportes: reportesFiltrados,
  }
}

// ─── Utilidades de verificación de acceso ────────────────────────────────────

/**
 * Verifica si el empleado autenticado puede generar el PDF General.
 * Condición: cargEmpl === 'jefe' Y deptEmpl en (sistemas | mantenimiento).
 * Se usa en HomeEmpleado para mostrar u ocultar el botón.
 *
 * @returns true si puede generar el PDF General
 */
export function puedeGenerarPdfGeneral(sesion: Sesion): boolean {
  try {
    if (!sesion || !esEmpleado(sesion)) return false
    const e     = sesion.data as Empleado
    const cargo = e.cargEmpl?.toLowerCase() || ''
    const dept  = e.deptEmpl?.toLowerCase() || ''
    return cargo === CARGO_JEFE &&
      (dept === DEPARTAMENTOS.SISTEMAS || dept === DEPARTAMENTOS.MANTENIMIENTO)
  } catch {
    return false
  }
}

/**
 * Verifica si el usuario autenticado puede generar el PDF Resumido.
 * Condición: rolUser === 'autoridad' o 'admin'.
 * Se usa en HomeAutoridad para mostrar u ocultar el botón.
 *
 * @returns true si puede generar el PDF Resumido
 */
export function puedeGenerarPdfResumido(sesion: Sesion): boolean {
  try {
    if (!sesion || !esUsuario(sesion)) return false
    const rol = sesion.data.rolUser?.toLowerCase() || ''
    return rol === 'autoridad' || rol === 'admin'
  } catch {
    return false
  }
}
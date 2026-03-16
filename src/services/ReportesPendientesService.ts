import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/Supabase'
import { Empleado, Lugar, Objeto, Reporte, Sesion, Usuario } from '../types/Database'

export interface ReporteCompleto extends Reporte {
  empleado: Empleado | null
  usuario: Usuario
  objeto: Objeto | null
  lugar: Lugar | null
}

// ─── Constantes de validación ────────────────────────────────────────────────
export const ESTADOS_VALIDOS = ['Pendiente', 'En Proceso', 'Resuelto'] as const
export const PRIORIDADES_VALIDAS = ['Baja', 'Media', 'Alta'] as const

export type EstadoReporte = (typeof ESTADOS_VALIDOS)[number]
export type PrioridadReporte = (typeof PRIORIDADES_VALIDAS)[number]

// ─── Select base (empleado y usuario por FK directa desde reporte) ───────────
const SELECT_BASE = `
  *,
  empleado:idEmpl ( idEmpl, nomEmpl, apeEmpl, correoEmpl, deptEmpl, cargEmpl, tlfEmpl ),
  usuario:idUser  ( idUser, nomUser, apeUser, correoUser, tlfUser )
`

/**
 * Enriquece los reportes con objeto y lugar en paralelo.
 * Se mantiene como queries separadas porque objeto → reporte no tiene FK
 * declarada en Supabase, por lo que el join automático no funciona.
 * Usar Promise.all reduce el tiempo total de N×2 secuenciales a 1 ronda paralela.
 */
const enriquecerReportes = async (data: any[]): Promise<ReporteCompleto[]> => {
  return Promise.all(
    data.map(async (reporte: any) => {
      const { data: objeto } = await supabase
        .from('objeto')
        .select('*')
        .eq('idReporte', reporte.idReporte)
        .single()

      let lugar = null
      if (objeto?.idLugar) {
        const { data: lugarData } = await supabase
          .from('lugar')
          .select('*')
          .eq('idLugar', objeto.idLugar)
          .single()
        lugar = lugarData
      }

      return { ...reporte, objeto: objeto ?? null, lugar } as ReporteCompleto
    })
  )
}

// ─── Sesión ───────────────────────────────────────────────────────────────────

/**
 * Obtiene la sesión completa del empleado con cargo, departamento y nombre.
 */
export const obtenerSesionEmpleado = async (): Promise<{
  id: string
  cargo: string
  depto: string
  nombre: string
}> => {
  const sesionGuardada = await AsyncStorage.getItem('sesion')
  if (!sesionGuardada) throw new Error('No hay sesión activa')

  const sesion: Sesion = JSON.parse(sesionGuardada)
  if (sesion.tipo !== 'empleado') throw new Error('Solo empleados pueden ver esta sección')

  return {
    id: sesion.id,
    cargo: sesion.data.cargEmpl,
    depto: sesion.data.deptEmpl,
    nombre: `${sesion.data.nomEmpl} ${sesion.data.apeEmpl}`,
  }
}

// ─── Consultas de reportes ────────────────────────────────────────────────────

/**
 * Carga los reportes SIN asignar (idEmpl = null).
 */
export const cargarReportesSinAsignar = async (): Promise<ReporteCompleto[]> => {
  const { data, error } = await supabase
    .from('reporte')
    .select(SELECT_BASE)
    .is('idEmpl', null)
    .order('fecReporte', { ascending: false })

  if (error) throw error
  return enriquecerReportes(data ?? [])
}

/**
 * Carga los reportes YA ASIGNADOS a cualquier empleado del departamento,
 * con paginación opcional para evitar cargas masivas.
 */
export const cargarReportesAsignadosDepto = async (
  depto: string,
  pagina = 0,
  porPagina = 50
): Promise<ReporteCompleto[]> => {
  // 1. Obtener IDs del departamento
  const { data: empleados, error: empError } = await supabase
    .from('empleado')
    .select('idEmpl')
    .eq('deptEmpl', depto)

  if (empError) throw empError
  if (!empleados || empleados.length === 0) return []

  const idsEmpleados = empleados.map((e: any) => e.idEmpl)

  // 2. Traer reportes con paginación
  const desde = pagina * porPagina
  const hasta = desde + porPagina - 1

  const { data, error } = await supabase
    .from('reporte')
    .select(SELECT_BASE)
    .in('idEmpl', idsEmpleados)
    .order('fecReporte', { ascending: false })
    .range(desde, hasta)

  if (error) throw error
  return enriquecerReportes(data ?? [])
}

/**
 * Carga los reportes asignados al colaborador actual.
 */
export const cargarReportesEmpleado = async (
  empleadoActual: string
): Promise<ReporteCompleto[]> => {
  const { data, error } = await supabase
    .from('reporte')
    .select(SELECT_BASE)
    .eq('idEmpl', empleadoActual)
    .order('fecReporte', { ascending: false })

  if (error) throw error
  return enriquecerReportes(data ?? [])
}

/**
 * Carga TODOS los empleados del departamento (incluye al jefe).
 */
export const cargarColaboradoresDepto = async (depto: string): Promise<Empleado[]> => {
  const { data, error } = await supabase
    .from('empleado')
    .select('*')
    .eq('deptEmpl', depto)

  if (error) throw error
  return data ?? []
}

// ─── Mutaciones ───────────────────────────────────────────────────────────────

/**
 * Asigna o reasigna un colaborador a un reporte y notifica al empleado.
 */
export const asignarColaboradorAReporte = async (
  idReporte: string,
  idEmpl: string,
  nombreJefe: string
): Promise<void> => {
  const { error } = await supabase
    .from('reporte')
    .update({ idEmpl, estReporte: 'En Proceso' })
    .eq('idReporte', idReporte)

  if (error) throw error

  try {
    await supabase.functions.invoke('notificar-nuevo-reporte', {
      body: { idReporte, idEmpleado: idEmpl, nombreJefe },
    })
  } catch (e) {
    console.error('Error al enviar notificación al empleado:', e)
  }
}

/**
 * Valida y guarda cambios de estado, prioridad y comentario de un reporte.
 * Notifica al usuario reportante si hubo cambios relevantes.
 */
export const guardarCambiosReporte = async (
  idReporte: string,
  reporte: ReporteCompleto,
  nuevoComentario: string,
  nuevaPrioridad: string,
  nuevoEstado: string
): Promise<void> => {
  // ── Validación antes de llegar a la BD ──────────────────────────────────
  if (!ESTADOS_VALIDOS.includes(nuevoEstado as EstadoReporte)) {
    throw new Error(`Estado inválido: "${nuevoEstado}". Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`)
  }
  if (!PRIORIDADES_VALIDAS.includes(nuevaPrioridad as PrioridadReporte)) {
    throw new Error(`Prioridad inválida: "${nuevaPrioridad}". Valores permitidos: ${PRIORIDADES_VALIDAS.join(', ')}`)
  }

  
  // ── Persistencia ─────────────────────────────────────────────────────────
  const { error } = await supabase
    .from('reporte')
    .update({
      comentReporte: nuevoComentario.trim() || null,
      prioReporte: nuevaPrioridad,
      estReporte: nuevoEstado,
    })
    .eq('idReporte', idReporte)

  if (error) throw error

  // ── Notificación al usuario reportante ───────────────────────────────────
  try {
    const cambios = {
      prioridadAnterior: reporte.prioReporte,
      prioridadNueva: nuevaPrioridad,
      estadoAnterior: reporte.estReporte,
      estadoNuevo: nuevoEstado,
      comentarioNuevo:
        nuevoComentario.trim() !== (reporte.comentReporte ?? '').trim()
          ? nuevoComentario.trim()
          : null,
    }

    const huboCambios =
      cambios.prioridadAnterior !== cambios.prioridadNueva ||
      cambios.estadoAnterior !== cambios.estadoNuevo ||
      cambios.comentarioNuevo !== null

    if (huboCambios) {
      // Se notifica siempre que haya cambios, haya o no empleado asignado
      const nombreEmpleado = reporte.empleado
        ? `${reporte.empleado.nomEmpl} ${reporte.empleado.apeEmpl}`
        : 'Administración'

      await supabase.functions.invoke('notificar-actualizacion-reporte', {
        body: {
          idReporte,
          idUsuario: reporte.usuario.idUser,
          nombreEmpleado,
          cambios,
        },
      })
    }
  } catch (e) {
    console.error('Error al enviar notificación de actualización:', e)
  }
}

/**
 * Elimina un reporte y su objeto asociado de la base de datos.
 */
export const eliminarReporte = async (idReporte: string): Promise<void> => {
  // Primero elimina el objeto (FK hacia reporte)
  await supabase
    .from('objeto')
    .delete()
    .eq('idReporte', idReporte)

  // Luego elimina el reporte
  const { error } = await supabase
    .from('reporte')
    .delete()
    .eq('idReporte', idReporte)

  if (error) throw error
} 

// ─── Helpers de color ─────────────────────────────────────────────────────────

export const getColorEstado = (estado: string): string => {
  switch (estado) {
    case 'Pendiente':  return '#FFA500'
    case 'En Proceso': return '#1E90FF'
    case 'Resuelto':   return '#32CD32'
    default:           return '#999999'
  }
}

export const getColorPrioridad = (prioridad: string): string => {
  switch (prioridad) {
    case 'Alta':  return '#DC143C'
    case 'Media': return '#FFD700'
    case 'Baja':  return '#90EE90'
    default:      return '#999999'
  }
}
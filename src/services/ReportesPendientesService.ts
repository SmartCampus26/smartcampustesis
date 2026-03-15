import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/Supabase'
import { Empleado, Lugar, Objeto, Reporte, Sesion, Usuario } from '../types/Database'

export interface ReporteCompleto extends Reporte {
  empleado: Empleado | null
  usuario: Usuario
  objeto: Objeto | null
  lugar: Lugar | null
}

/**
 * Obtiene la sesión completa del empleado con cargo y departamento.
 */
export const obtenerSesionEmpleado = async (): Promise<{ id: string; cargo: string; depto: string; nombre: string }> => {
  const sesionGuardada = await AsyncStorage.getItem('sesion')
  if (!sesionGuardada) throw new Error('No hay sesión activa')

  const sesion: Sesion = JSON.parse(sesionGuardada)
  if (sesion.tipo !== 'empleado') throw new Error('Solo empleados pueden ver esta sección')

  return {
    id: sesion.id,
    cargo: sesion.data.cargEmpl,
    depto: sesion.data.deptEmpl,
    // Retornamos el nombre completo del jefe para usarlo en la notificación al empleado
    nombre: `${sesion.data.nomEmpl} ${sesion.data.apeEmpl}`,
  }
}

/**
 * Añade objeto y lugar a cada reporte.
 */
const enriquecerReportes = async (data: any[]): Promise<ReporteCompleto[]> => {
  return await Promise.all(
    data.map(async (reporte: any) => {
      const { data: objeto } = await supabase
        .from('objeto')
        .select('*')
        .eq('idReporte', reporte.idReporte)
        .single()

      let lugar = null
      if (objeto) {
        const { data: lugarData } = await supabase
          .from('lugar')
          .select('*')
          .eq('idLugar', objeto.idLugar)
          .single()
        lugar = lugarData
      }

      return { ...reporte, objeto: objeto || null, lugar } as ReporteCompleto
    })
  )
}

/**
 * Carga los reportes SIN asignar (idEmpl = null).
 */
export const cargarReportesSinAsignar = async (): Promise<ReporteCompleto[]> => {
  const { data, error } = await supabase
    .from('reporte')
    .select(`
      *,
      usuario:idUser ( idUser, nomUser, apeUser, correoUser, tlfUser )
    `)
    .is('idEmpl', null)
    .order('fecReporte', { ascending: false })

  if (error) throw error
  return await enriquecerReportes(data || [])
}

/**
 * Carga los reportes YA ASIGNADOS a colaboradores del departamento del jefe.
 */
export const cargarReportesAsignadosDepto = async (depto: string): Promise<ReporteCompleto[]> => {
  const { data: empleados, error: empError } = await supabase
    .from('empleado')
    .select('idEmpl')
    .eq('deptEmpl', depto)

  if (empError) throw empError
  if (!empleados || empleados.length === 0) return []

  const idsEmpleados = empleados.map((e: any) => e.idEmpl)

  const { data, error } = await supabase
    .from('reporte')
    .select(`
      *,
      empleado:idEmpl ( idEmpl, nomEmpl, apeEmpl, correoEmpl, deptEmpl, cargEmpl, tlfEmpl ),
      usuario:idUser ( idUser, nomUser, apeUser, correoUser, tlfUser )
    `)
    .in('idEmpl', idsEmpleados)
    .order('fecReporte', { ascending: false })

  if (error) throw error
  return await enriquecerReportes(data || [])
}

/**
 * Carga los reportes asignados al colaborador actual.
 */
export const cargarReportesEmpleado = async (empleadoActual: string): Promise<ReporteCompleto[]> => {
  const { data, error } = await supabase
    .from('reporte')
    .select(`
      *,
      empleado:idEmpl ( idEmpl, nomEmpl, apeEmpl, correoEmpl, deptEmpl, cargEmpl, tlfEmpl ),
      usuario:idUser ( idUser, nomUser, apeUser, correoUser, tlfUser )
    `)
    .eq('idEmpl', empleadoActual)
    .order('fecReporte', { ascending: false })

  if (error) throw error
  return await enriquecerReportes(data || [])
}

/**
 * Carga los colaboradores (no jefes) del departamento indicado.
 */
export const cargarColaboradoresDepto = async (depto: string): Promise<Empleado[]> => {
  const { data, error } = await supabase
    .from('empleado')
    .select('*')
    .eq('deptEmpl', depto)
    .eq('cargEmpl', 'empleado')

  if (error) throw error
  return data || []
}

/**
 * Asigna o reasigna un colaborador a un reporte.
 * Una vez asignado, notifica al EMPLEADO vía 'notificar-nuevo-reporte'.
 */
export const asignarColaboradorAReporte = async (
  idReporte: string,
  idEmpl: string,
  nombreJefe: string        // ← nombre completo del jefe para el correo
): Promise<void> => {
  const { error } = await supabase
    .from('reporte')
    .update({ idEmpl, estReporte: 'En Proceso' })
    .eq('idReporte', idReporte)

  if (error) throw error

  // ✅ Notificar al EMPLEADO que el jefe le asignó una tarea
  try {
    console.log('Invocando notificar-nuevo-reporte:', { idReporte, idEmpleado: idEmpl, nombreJefe })
    await supabase.functions.invoke('notificar-nuevo-reporte', {
      body: { idReporte, idEmpleado: idEmpl, nombreJefe },
    })
    console.log('Notificación al empleado enviada correctamente')
  } catch (e) {
    console.error('Error al enviar notificación al empleado:', e)
  }
}

/**
 * Guarda cambios de estado, prioridad y comentario de un reporte.
 */
export const guardarCambiosReporte = async (
  idReporte: string,
  reporte: ReporteCompleto,
  nuevoComentario: string,
  nuevaPrioridad: string,
  nuevoEstado: string
): Promise<void> => {
  const { error } = await supabase
    .from('reporte')
    .update({
      comentReporte: nuevoComentario,
      prioReporte: nuevaPrioridad,
      estReporte: nuevoEstado,
    })
    .eq('idReporte', idReporte)

  if (error) throw error

  try {
    const cambios = {
      prioridadAnterior: reporte.prioReporte,
      prioridadNueva: nuevaPrioridad,
      estadoAnterior: reporte.estReporte,
      estadoNuevo: nuevoEstado,
      comentarioNuevo: nuevoComentario !== reporte.comentReporte ? nuevoComentario : null,
    }

    const huboCambios =
      cambios.prioridadAnterior !== cambios.prioridadNueva ||
      cambios.estadoAnterior !== cambios.estadoNuevo ||
      cambios.comentarioNuevo

    if (huboCambios && reporte.empleado) {
      await supabase.functions.invoke('notificar-actualizacion-reporte', {
        body: {
          idReporte,
          idUsuario: reporte.usuario.idUser,
          nombreEmpleado: `${reporte.empleado.nomEmpl} ${reporte.empleado.apeEmpl}`,
          cambios,
        },
      })
    }
  } catch (e) {
    console.error('Error al enviar notificación de actualización:', e)
  }
}

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
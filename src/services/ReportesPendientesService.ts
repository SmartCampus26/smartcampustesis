// Almacenamiento local para recuperar la sesión guardada
import AsyncStorage from '@react-native-async-storage/async-storage'
// Cliente de Supabase configurado previamente
import { supabase } from '../lib/Supabase'
// Tipos TypeScript que representan las tablas de la base de datos
import { Empleado, Lugar, Objeto, Reporte, Sesion, Usuario } from '../types/Database'

/**
 * ================================
 * INTERFAZ EXTENDIDA
 * ================================
 * Representa un reporte con todas sus relaciones cargadas
 */
export interface ReporteCompleto extends Reporte {
  empleado: Empleado
  usuario: Usuario
  objeto: Objeto | null
  lugar: Lugar | null
}

//FUNCIONES

/**
 * Obtiene la sesión almacenada y valida que sea un empleado.
 * Retorna el ID del empleado o lanza un error si no es válido.
 */
export const obtenerEmpleadoActual = async (): Promise<string> => {
  const sesionGuardada = await AsyncStorage.getItem('sesion')
  if (!sesionGuardada) throw new Error('No hay sesión activa')

  const sesion: Sesion = JSON.parse(sesionGuardada)
  // Verificar directamente si es tipo empleado
  if (sesion.tipo !== 'empleado') throw new Error('Solo empleados pueden ver esta sección')

  return sesion.id
}

/**
 * Carga los reportes asignados al empleado desde Supabase,
 * incluyendo empleado, usuario, objeto y lugar relacionados.
 */
export const cargarReportesEmpleado = async (empleadoActual: string): Promise<ReporteCompleto[]> => {
  // Consulta principal de reportes con relaciones
  const { data, error: supabaseError } = await supabase
    .from('reporte')
    .select(`
      *,
      empleado:idEmpl (
        idEmpl,
        nomEmpl,
        apeEmpl,
        correoEmpl,
        deptEmpl,
        cargEmpl,
        tlfEmpl
      ),
      usuario:idUser (
        idUser,
        nomUser,
        apeUser,
        correoUser,
        tlfUser
      )
    `)
    .eq('idEmpl', empleadoActual)
    .order('fecReporte', { ascending: false })

  if (supabaseError) throw supabaseError

  // Cargar objeto y lugar asociados a cada reporte
  const reportesConDatos = await Promise.all(
    (data || []).map(async (reporte: any) => {
      // Obtener el objeto asociado al reporte
      const { data: objeto } = await supabase
        .from('objeto')
        .select('*')
        .eq('idReporte', reporte.idReporte)
        .single()

      // Si hay objeto, obtener su lugar
      let lugar = null
      if (objeto) {
        const { data: lugarData } = await supabase
          .from('lugar')
          .select('*')
          .eq('idLugar', objeto.idLugar)
          .single()
        lugar = lugarData
      }

      return {
        ...reporte,
        objeto: objeto || null,
        lugar: lugar || null
      } as ReporteCompleto
    })
  )

  return reportesConDatos
}

/**
 * Guarda los cambios de un reporte en la base de datos
 * y envía notificación al usuario si hubo cambios reales.
 */
export const guardarCambiosReporte = async (
  idReporte: string,
  reporte: ReporteCompleto,
  nuevoComentario: string,
  nuevaPrioridad: string,
  nuevoEstado: string
): Promise<void> => {
  // Actualizar el reporte
  const { error: updateError } = await supabase
    .from('reporte')
    .update({
      comentReporte: nuevoComentario,
      prioReporte: nuevaPrioridad,
      estReporte: nuevoEstado,
    })
    .eq('idReporte', idReporte)

  if (updateError) throw updateError

  // 🔥 Notificar al usuario del cambio
  try {
    console.log('📧 Enviando notificación de actualización...')

    const cambios = {
      prioridadAnterior: reporte.prioReporte,
      prioridadNueva: nuevaPrioridad,
      estadoAnterior: reporte.estReporte,
      estadoNuevo: nuevoEstado,
      comentarioNuevo: nuevoComentario !== reporte.comentReporte ? nuevoComentario : null,
    }

    // Solo notificar si hay cambios reales
    const huboCambios =
      cambios.prioridadAnterior !== cambios.prioridadNueva ||
      cambios.estadoAnterior !== cambios.estadoNuevo ||
      cambios.comentarioNuevo

    if (huboCambios) {
      const { error: notifError } = await supabase.functions.invoke(
        'notificar-actualizacion-reporte',
        {
          body: {
            idReporte,
            idUsuario: reporte.usuario.idUser,
            nombreEmpleado: `${reporte.empleado.nomEmpl} ${reporte.empleado.apeEmpl}`,
            cambios,
          },
        }
      )

      if (notifError) {
        console.error('Error al enviar notificación:', notifError)
      } else {
        console.log('✅ Notificación enviada al usuario')
      }
    }
  } catch (notifError) {
    console.error('Error al enviar notificación:', notifError)
  }
}

// Devuelve un color según el estado del reporte
export const getColorEstado = (estado: string): string => {
  switch (estado) {
    case 'Pendiente':  return '#FFA500'
    case 'En Proceso': return '#1E90FF'
    case 'Resuelto':   return '#32CD32'
    default:           return '#999999'
  }
}

// Devuelve un color según la prioridad del reporte
export const getColorPrioridad = (prioridad: string): string => {
  switch (prioridad) {
    case 'Alta':  return '#DC143C'
    case 'Media': return '#FFD700'
    case 'Baja':  return '#90EE90'
    default:      return '#999999'
  }
}

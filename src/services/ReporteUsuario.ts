//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos
import { supabase } from '../lib/Supabase'

/**
 * Asocia un usuario a un reporte
 * Inserta un registro en la tabla intermedia "reporte_usuario"
 * que representa la relación entre usuarios y reportes
 *
 * @param idReporte - Identificador del reporte
 * @param idUser - Identificador del usuario
 * @returns Promesa con el resultado de la inserción
 */
export const asociarUsuarioAReporte = (idReporte: number, idUser: number) =>
  supabase.from('reporte_usuario').insert({ idReporte, idUser })

/**
 * Obtiene todos los reportes asociados a un usuario específico
 * Incluye información detallada del reporte y del empleado asignado
 *
 * @param idUser - Identificador del usuario
 * @returns Lista de reportes asociados al usuario
 */

export const obtenerReportesPorUsuario = (idUser: number) =>
  supabase
    .from('reporte_usuario')
    .select(`
      reporte:idReporte (
        idReporte,
        descriReporte,
        estReporte,
        fecReporte,
        prioReporte,
        empleado (
          nomEmpl,
          apeEmpl
        )
      )
    `)
    // Filtra los reportes que pertenecen al usuario indicado
    .eq('idUser', idUser)

/**
 * Elimina la asociación entre un usuario y un reporte
 * Borra el registro correspondiente de la tabla "reporte_usuario"
 *
 * @param idReporte - Identificador del reporte
 * @param idUser - Identificador del usuario
 * @returns Resultado de la operación de eliminación
 */
export const desasociarUsuarioDeReporte = (
  idReporte: number,
  idUser: number
) =>
  supabase
    .from('reporte_usuario')
    .delete()
    .eq('idReporte', idReporte)
    .eq('idUser', idUser)
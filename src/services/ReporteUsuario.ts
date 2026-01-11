import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos

export const asociarUsuarioAReporte = (idReporte: number, idUser: number) =>
  supabase.from('reporte_usuario').insert({ idReporte, idUser })
// Crea una relación entre un reporte y un usuario.

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
    .eq('idUser', idUser)
  
export const desasociarUsuarioDeReporte = (
  idReporte: number,
  idUser: number
) =>
  supabase
    .from('reporte_usuario')
    .delete()
    .eq('idReporte', idReporte)
    .eq('idUser', idUser)
// Elimina la relación entre un reporte y un usuario
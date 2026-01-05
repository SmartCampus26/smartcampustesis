import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos

export const asociarUsuarioAReporte = (idReporte: number, idUser: number) =>
  supabase.from('reporte_usuario').insert({ idReporte, idUser })
// Crea una relación entre un reporte y un usuario.

export const obtenerUsuariosPorReporte = (idReporte: number) =>
  supabase
    .from('reporte_usuario')
    .select(`
      *,
      usuario:idUser (
        idUser,
        nomUser,
        apeUser,
        correoUser,
        rolUser
      )
    `)
    .eq('idReporte', idReporte)
// Obtiene todos los usuarios asociados a un reporte específico, primero busca en reporte_usuario y luego trae los datos completos del usuario desde la tabla usuario, todo gracias al join automático de Supabase

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
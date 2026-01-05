import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos

export const asociarUsuarioAReporte = (idReporte: number, idUser: number) =>
  supabase.from('reporte_usuario').insert({ idReporte, idUser })
//Guarda la relación entre un reporte y un usuario

export const asociarVariosUsuariosAReporte = (
  idReporte: number,
  idUsers: number[]
) =>
  supabase.from('reporte_usuario').insert(
    idUsers.map(idUser => ({ idReporte, idUser }))
  )
//Conecta varios usuarios al mismo reporte

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
// Devuelve todos los usuarios asociados a un reporte específico Incluye datos del usuario gracias al select con relacion a su id

export const obtenerReportesPorUsuario = (idUser: number) =>
  supabase
    .from('reporte_usuario')
    .select(`
      *,
      reporte:idReporte (
        *,
        usuario:idUser (nomUser, apeUser, correoUser),
        empleado:idEmpl (nomEmpl, apeEmpl, correoEmpl)
      )
    `)
    .eq('idUser', idUser)
//Devuelve todos los reportes que están asociados a un usuario específico incluye datos del reporte, datos del usuario y datos del empleado relacionado

export const desasociarUsuarioDeReporte = (
  idReporte: number,
  idUser: number
) =>
  supabase
    .from('reporte_usuario')
    .delete()
    .eq('idReporte', idReporte)
    .eq('idUser', idUser)
//Borra la relación entre un reporte y un usuario

export const eliminarTodosUsuariosDeReporte = (idReporte: number) =>
  supabase.from('reporte_usuario').delete().eq('idReporte', idReporte)
//Elimina todas las relaciones del reporte con cualquier usuario

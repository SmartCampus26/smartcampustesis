import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos
import { Reporte } from '../types/Database'
//Se importa Reporte para que TypeScript conozca la forma de un reporte: qué campos tiene, qué tipos de datos son, etc.

export const crearReporte = (reporte: Reporte) =>
  supabase.from('reporte').insert(reporte).select().single()
//Crea un nuevo reporte en la tabla reporte es decir que Guarda el reporte y devuélve sus datos

export const obtenerReportes = () =>
  supabase
    .from('reporte')
    .select(`
      *,
      usuario:idUser (
        nomUser,
        apeUser,
        correoUser
      ),
      empleado:idEmpl (
        nomEmpl,
        apeEmpl,
        correoEmpl
      )
    `)
    .order('fecReporte', { ascending: false })
// Obtiene todos los reportes y además trae los datos del usuario asociado y los datos del empleado asociado 

export const actualizarReporte = (
  idReporte: number,
  cambios: Partial<Reporte> //Esto quiere decir que se puede enviar solo los campos que se quiere actualizar
) =>
  supabase.from('reporte').update(cambios).eq('idReporte', idReporte)
// Actualiza un reporte según su id


export const eliminarReporte = (idReporte: number) =>
  supabase.from('reporte').delete().eq('idReporte', idReporte)
// Elimina un reporte de la base de datos buscando por su id
import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos
import { Objeto } from '../types/Database'
//Se importa Objeto para que TypeScript conozca la forma de un objeto: qué campos tiene, qué tipos de datos son, etc.

export const crearObjeto = (objeto: Objeto) =>
  supabase.from('objeto').insert(objeto).select().single()
//Crea un nuevo registro en la tabla objeto esto quiere decir que inserta el objeto en la base de datos y devuelve el objeto creado

export const obtenerObjetosPorReporte = (idReporte: number) =>
  supabase
    .from('objeto')
    .select(`*, lugar:idLugar (nomLugar, pisoLugar)`)
    .eq('idReporte', idReporte)
// Trae todos los objetos relacionados con un reporte específico

export const obtenerObjetoPorId = (idObj: number) =>
  supabase
    .from('objeto')
    .select(`*, lugar:idLugar (nomLugar, pisoLugar)`)
    .eq('idObj', idObj)
    .single()
//Trae un objeto específico por su id esto incluye los datos del objeto y el lugar asociado

export const actualizarObjeto = (
  idObj: number,
  cambios: Partial<Objeto>// Esto quiere decir que se puede enviar solo los campos que se quiere actualizar
) =>
  supabase.from('objeto').update(cambios).eq('idObj', idObj)
//Actualiza un objeto según su ID

export const eliminarObjeto = (idObj: number) =>
  supabase.from('objeto').delete().eq('idObj', idObj)
//Elimina un objeto por su ID 
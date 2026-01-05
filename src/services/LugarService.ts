import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos
import { Lugar } from '../types/Database'
//Se importa Lugar para que TypeScript conozca la forma de un lugar: qué campos tiene, qué tipos de datos son, etc.

export const crearLugar = (lugar: Lugar) =>
  supabase.from('lugar').insert(lugar).select().single()
// Crea un nuevo registro en la tabla lugar esto quiere decir que inserta el lugar en la base de datos y devuelve el lugar creado

export const obtenerLugares = () =>
  supabase.from('lugar').select('*').order('pisoLugar')
// Obtiene todos los lugares registrados en la base de datos devolviendo todas las filas (*) y Ordenaddolas por el número de piso de forma acendente

export const obtenerLugarPorId = (idLugar: number) =>
  supabase.from('lugar').select('*').eq('idLugar', idLugar).single()
// Trae un único lugar según su ID

export const actualizarLugar = (
  idLugar: number,
  cambios: Partial<Lugar> // Esto quiere decir que se puede enviar solo los campos que se quiere actualizar
) =>
  supabase.from('lugar').update(cambios).eq('idLugar', idLugar)
// Actualiza un lugar según su ID

export const eliminarLugar = (idLugar: number) =>
  supabase.from('lugar').delete().eq('idLugar', idLugar)
//Elimina un lugar de la base de datos usando su ID

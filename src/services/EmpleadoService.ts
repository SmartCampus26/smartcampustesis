//se encarga del CRUD de empleados usando Supabase.
import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos
import { Empleado } from '../types/Database'
//Se importa Empleado para que TypeScript conozca la forma de un empleado: qué campos tiene, qué tipos de datos son, etc.

export const crearEmpleado = (empleado: Empleado) => //Crear un nuevo empleado en la tabla empleado, devuelve el empleado recién creado
  supabase.from('empleado').insert(empleado).select().single()

export const obtenerEmpleados = () => //Obtiene todos los empleados, ordenados por idEmpl
  supabase.from('empleado').select('*').order('idEmpl')

export const obtenerEmpleadoPorId = (idEmpl: number) => //
  supabase.from('empleado').select('*').eq('idEmpl', idEmpl).single()//.eq('idEmpl', idEmpl) filtra por ID y .single() garantiza que solo devuelva uno
//Busca un empleado específico usando su ID 

export const actualizarEmpleado = (
  idEmpl: number,
  cambios: Partial<Empleado>// Esto quiere decir que se puede enviar solo los campos que se quiere actualizar
) =>
  supabase.from('empleado').update(cambios).eq('idEmpl', idEmpl)
//Actualiza al empleado según su ID 

export const eliminarEmpleado = (idEmpl: number) =>
  supabase.from('empleado').delete().eq('idEmpl', idEmpl)
//Elimina al empleado de la tabla usando su ID

import { supabase } from '../lib/Supabase'
import { Empleado, Usuario } from '../types/Database'

/**
 * Obtiene todos los usuarios ordenados alfabéticamente
 */
export const fetchUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .order('nomUser', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Obtiene todos los empleados ordenados alfabéticamente
 */
export const fetchEmpleados = async (): Promise<Empleado[]> => {
  const { data, error } = await supabase
    .from('empleado')
    .select('*')
    .order('nomEmpl', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Elimina un usuario por su ID
 */
export const eliminarUsuarioDB = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('usuario')
    .delete()
    .eq('idUser', id)

  if (error) throw error
}

/**
 * Elimina un empleado por su ID
 */
export const eliminarEmpleadoDB = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('empleado')
    .delete()
    .eq('idEmpl', id)

  if (error) throw error
}

/**
 * Filtra usuarios por término de búsqueda
 */
export const filtrarUsuarios = (usuarios: Usuario[], busqueda: string): Usuario[] => {
  const t = busqueda.toLowerCase()
  return usuarios.filter(u =>
    u.nomUser.toLowerCase().includes(t) ||
    u.apeUser.toLowerCase().includes(t) ||
    u.correoUser.toLowerCase().includes(t) ||
    u.rolUser.toLowerCase().includes(t) ||
    u.idUser.toString().includes(t)
  )
}

/**
 * Filtra empleados por término de búsqueda
 */
export const filtrarEmpleados = (empleados: Empleado[], busqueda: string): Empleado[] => {
  const t = busqueda.toLowerCase()
  return empleados.filter(e =>
    e.nomEmpl.toLowerCase().includes(t) ||
    e.apeEmpl.toLowerCase().includes(t) ||
    e.correoEmpl.toLowerCase().includes(t) ||
    e.deptEmpl.toLowerCase().includes(t) ||
    e.cargEmpl.toLowerCase().includes(t) ||
    e.idEmpl.toString().includes(t)
  )
}
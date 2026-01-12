// Importa AsyncStorage para almacenamiento local persistente
// Se utiliza para guardar la sesión del usuario en el dispositivo
import AsyncStorage from '@react-native-async-storage/async-storage'
// Importa el tipo Sesion definido en la base de datos
import { Sesion } from '../types/Database'

// Clave única bajo la cual se almacenará la sesión
const SESION_KEY = 'sesion'

/**
 * Guarda la sesión del usuario en el almacenamiento local
 * Convierte el objeto de sesión a JSON antes de almacenarlo
 *
 * @param sesion - Objeto sesión del usuario autenticado
 */
export const guardarSesion = async (sesion: Sesion): Promise<void> => {
  try {
    const sesionString = JSON.stringify(sesion)
    await AsyncStorage.setItem(SESION_KEY, sesionString)
  } catch (error) {
    console.error('Error al guardar sesión:', error)
    throw new Error('No se pudo guardar la sesión')
  }
}

/**
 * Obtiene la sesión almacenada del usuario
 * Si no existe sesión, retorna null
 *
 * @returns Objeto Sesion o null si no hay sesión activa
 */
export const obtenerSesion = async (): Promise<Sesion | null> => {
  try {
    const sesionString = await AsyncStorage.getItem(SESION_KEY)
    if (!sesionString) {
      return null
    }
    
    const sesion = JSON.parse(sesionString) as Sesion
    return sesion
  } catch (error) {
    console.error('Error al obtener sesión:', error)
    return null
  }
}

/**
 * Elimina la sesión almacenada
 * Se utiliza al cerrar sesión
 */
export const eliminarSesion = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESION_KEY)
  } catch (error) {
    console.error('Error al eliminar sesión:', error)
    throw new Error('No se pudo cerrar la sesión')
  }
}

/**
 * Verifica si existe una sesión activa en el dispositivo
 *
 * @returns true si hay sesión, false en caso contrario
 */
export const tieneSesionActiva = async (): Promise<boolean> => {
  const sesion = await obtenerSesion()
  return sesion !== null
}

/**
 * Obtiene el tipo de usuario de la sesión actual
 * Puede ser "usuario", "empleado" o null si no hay sesión
 *
 * @returns Tipo de usuario o null
 */
export const obtenerTipoUsuario = async (): Promise<'usuario' | 'empleado' | null> => {
  const sesion = await obtenerSesion()
  return sesion?.tipo || null
}

// Se importa la función de validación esUsuario
// Permite verificar si la sesión actual corresponde a un usuario
// y no a un empleado, facilitando el control de roles y permisos
import { esUsuario } from '../types/Database'

/**
 * Obtiene el rol del usuario autenticado
 * Solo aplica si la sesión pertenece a un usuario (no empleado)
 *
 * @returns Rol del usuario o null
 */
export const obtenerRolUsuario = async (): Promise<string | null> => {
  const sesion = await obtenerSesion()

  // Verifica si la sesión corresponde a un usuario
  if (!sesion) return null

  if (esUsuario(sesion)) {
    return sesion.rol
  }

  // Si es empleado, no tiene rol de usuario
  return null
}

/**
 * Actualiza completamente la sesión almacenada
 * Se utiliza cuando cambian datos del usuario
 *
 * @param nuevaSesion - Nueva información de sesión
 */
export const actualizarSesion = async (nuevaSesion: Sesion): Promise<void> => {
  try {
    await guardarSesion(nuevaSesion)
  } catch (error) {
    console.error('Error al actualizar sesión:', error)
    throw new Error('No se pudo actualizar la sesión')
  }
}

/**
 * Elimina toda la información almacenada en AsyncStorage
 * Útil para depuración y pruebas
 */
export const limpiarTodoElAlmacenamiento = async (): Promise<void> => {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    console.error('Error al limpiar almacenamiento:', error)
    throw new Error('No se pudo limpiar el almacenamiento')
  }
}
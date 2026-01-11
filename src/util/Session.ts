import AsyncStorage from '@react-native-async-storage/async-storage'
import { Sesion } from '../types/Database'

const SESION_KEY = 'sesion'

/**
 * Guarda la sesión del usuario en el dispositivo
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
 * Obtiene la sesión guardada del usuario
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
 * Elimina la sesión guardada (cerrar sesión)
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
 * Verifica si hay una sesión activa
 */
export const tieneSesionActiva = async (): Promise<boolean> => {
  const sesion = await obtenerSesion()
  return sesion !== null
}

/**
 * Obtiene el tipo de usuario de la sesión actual
 */
export const obtenerTipoUsuario = async (): Promise<'usuario' | 'empleado' | null> => {
  const sesion = await obtenerSesion()
  return sesion?.tipo || null
}

/**
 * Obtiene el rol del usuario actual
 */
export const obtenerRolUsuario = async (): Promise<string | null> => {
  const sesion = await obtenerSesion()
  return sesion?.rol || null
}

/**
 * Actualiza la sesión completa (para cuando cambia información del usuario)
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
 * Limpia toda la información de AsyncStorage (útil para debugging)
 */
export const limpiarTodoElAlmacenamiento = async (): Promise<void> => {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    console.error('Error al limpiar almacenamiento:', error)
    throw new Error('No se pudo limpiar el almacenamiento')
  }
}
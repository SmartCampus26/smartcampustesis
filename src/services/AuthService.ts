//Este archivo se encarga del manejo de la autenticación y 
//la sesión del usuario en tu app usando Supabase + almacenamiento local.

import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos
import { Sesion} from '../types/Database'
// Trae los tipos para que TypeScript sepa cómo lucen los datos de usuario, empleado y sesion
import AsyncStorage from '@react-native-async-storage/async-storage'
//se importa AsyncStorage para poder almacenar la sesión del usuario en el dispositivo de forma local



// ===============================
// LOGIN CON SUPABASE AUTH
// (solo para creación / verificación)
// ===============================
export const loginConAuth = async (
  correo: string,
  contrasena: string,
) => {
  // 1. Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
  })

  if (error) throw error
  return data
}

// ===============================
// LOGIN PERSONALIZADO
// ===============================

export const loginPersonalizado = async (
  correo: string,
  contrasena: string,
  tipo: 'usuario' | 'empleado'
): Promise<Sesion> => {
  try {
    // 1. AUTH DE SUPABASE (Validar credenciales reales)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    })

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        throw new Error('Por favor, verifica tu correo electrónico antes de entrar.')
      }
      throw new Error('Credenciales incorrectas')
    }

    // 2. CONSULTAR DATOS DE PERFIL
    const tabla = tipo === 'usuario' ? 'usuario' : 'empleado'
    const idColumna = tipo === 'usuario' ? 'idUser' : 'idEmpl'

    console.log(`Buscando perfil en tabla ${tabla} para el ID:`, authData.user.id)

    const { data: perfil, error: perfilError } = await supabase
      .from(tabla)
      .select('*')
      .eq(idColumna, authData.user.id)
      .single()

    if (perfilError || !perfil) {
      console.error('Error al traer perfil:', perfilError)
      throw new Error('Usuario autenticado, pero no se encontró su perfil en la base de datos.')
    }

    // 3. CREAR Y GUARDAR SESIÓN
    const sesion: Sesion = {
      tipo: tipo,
      id: tipo === 'usuario' ? perfil.idUser : perfil.idEmpl,
      rol: tipo === 'usuario' ? perfil.rolUser : perfil.rolEmpl, 
      data: perfil as any,
    }

    await guardarSesionLocal(sesion)
    return sesion

  } catch (error: any) {
    console.error('Error en login:', error.message)
    throw new Error(error.message || 'Error al iniciar sesión')
  }
}


// ===============================
// LOGOUT
// ===============================
export const logout = async () => {
  await supabase.auth.signOut()
  await eliminarSesionLocal()
}

// ===============================
// SESIÓN ACTUAL
// ===============================

/**
 * Obtiene la sesión activa del usuario.
 *
 * CORRECCIÓN: Ya no depende de supabase.auth.getSession() porque Supabase Auth
 * tarda en restaurarse al reiniciar la app (Fast Refresh / Expo Go), causando
 * que retornara null aunque la sesión estuviera guardada en AsyncStorage.
 *
 * Ahora lee directamente de AsyncStorage, que siempre está disponible
 * de forma inmediata sin importar el estado de Supabase Auth.
 */
export const obtenerSesion = async (): Promise<Sesion | null> => {
  try {
    const sesionString = await AsyncStorage.getItem('sesion')
    if (!sesionString) return null
    return JSON.parse(sesionString) as Sesion
  } catch (error) {
    console.error('Error al obtener sesión:', error)
    return null
  }
}

// ===============================
// HELPERS SESIÓN LOCAL
// ===============================

// Guarda la sesión en almacenamiento local del dispositivo
// Se usa AsyncStorage para que la sesión persista aunque se cierre la app
const guardarSesionLocal = async (sesion: Sesion) => {
  // Convierte el objeto sesión a string JSON y lo guarda con la clave 'sesion'
  await AsyncStorage.setItem('sesion', JSON.stringify(sesion))
}

// Obtiene la sesión almacenada localmente
// Devuelve null si no existe
const obtenerSesionLocal = async (): Promise<Sesion | null> => {
  // Recupera el valor almacenado con la clave 'sesion'
  const sesion = await AsyncStorage.getItem('sesion')
  // Si existe, lo convierte nuevamente a objeto
  // Si no existe, devuelve null
  return sesion ? JSON.parse(sesion) : null
}

// Elimina la sesión del almacenamiento local
// Se usa cuando el usuario cierra sesión
const eliminarSesionLocal = async () => {
  // Borra la clave 'sesion' del AsyncStorage
  await AsyncStorage.removeItem('sesion')
}
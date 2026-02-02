//Este archivo se encarga del manejo de la autenticación y 
//la sesión del usuario en tu app usando Supabase + almacenamiento local.

import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos
import { Empleado, Sesion, Usuario } from '../types/Database'
// Trae los tipos para que TypeScript sepa cómo lucen los datos de usuario, empleado y sesion
import AsyncStorage from '@react-native-async-storage/async-storage'
//se importa AsyncStorage para poder almacenar la sesión del usuario en el dispositivo de forma local



// Credenciales del super admin que es un usuario especial que no está en la base de datos
// pero tiene permisos totales y este se valida antes que cualquier login
const SUPER_ADMIN = {
  correo: 'emily.ojeda.est@uets.edu.ec',
  contrasena: 'lumity<319'
}

// ===============================
// LOGIN CON SUPABASE AUTH
// (solo para creación / verificación)
// ===============================
export const loginConAuth = async (
  correo: string,
  contrasena: string,
  datosExtra: any
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
// Este login no usa Supabase Auth, sino que revisa las tablas usuario o empleado
  correo: string,
  contrasena: string,
  tipo: 'usuario' | 'empleado'
): Promise<Sesion> => {
  try {
    // ===============================
    // SUPER ADMIN (PRIMERO)
    // ===============================
    if (correo === SUPER_ADMIN.correo && contrasena === SUPER_ADMIN.contrasena) {
      const sesionAdmin: Sesion = {
        tipo: 'usuario',
        id: 0,
        rol: 'super_admin',
        data: {
          idUser: 0,
          nomUser: 'Emily Ojeda',
          correoUser: correo,
          rolUser: 'super_admin',
          esSuperAdmin: true
        } as any,
      }

      await guardarSesionLocal(sesionAdmin)
      return sesionAdmin
    }

    // ===============================
    // VALIDAR CORREO REAL (USUARIO Y EMPLEADO)
    // ===============================
   

    // ===============================
    // LOGIN USUARIO
    // ===============================
    if (tipo === 'usuario') {
      console.log('Intentando login como usuario con:', correo)

      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('correoUser', correo)
        .eq('contraUser', contrasena)
        .single()

      console.log('Respuesta Supabase:', { data, error })

      if (error || !data) {
        throw new Error('Credenciales incorrectas')
      }

      const sesion: Sesion = {
        tipo: 'usuario',
        id: data.idUser,
        rol: data.rolUser,
        data: data as Usuario,
      }

      await guardarSesionLocal(sesion)
      return sesion
    }

    // ===============================
    // LOGIN EMPLEADO
    // ===============================
    console.log('Intentando login como empleado con:', correo)

    const { data, error } = await supabase
      .from('empleado')
      .select('*')
      .eq('correoEmpl', correo)
      .eq('contraEmpl', contrasena)
      .single()

    console.log('Respuesta Supabase:', { data, error })

    if (error || !data) {
      throw new Error('Credenciales incorrectas')
    }

    const sesion: Sesion = {
      tipo: 'empleado',
      id: data.idEmpl,
      data: data as Empleado,
    }

    await guardarSesionLocal(sesion)
    return sesion

  } catch (error: any) {
    console.error('Error en login:', error)
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
export const obtenerSesion = async (): Promise<Sesion | null> => {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    return obtenerSesionLocal()
  }
  return null
}

// ===============================
// HELPERS SESIÓN LOCAL
// ===============================
const guardarSesionLocal = async (sesion: Sesion) => {
  await AsyncStorage.setItem('sesion', JSON.stringify(sesion))
}

const obtenerSesionLocal = async (): Promise<Sesion | null> => {
  const sesion = await AsyncStorage.getItem('sesion')
  return sesion ? JSON.parse(sesion) : null
}

const eliminarSesionLocal = async () => {
  await AsyncStorage.removeItem('sesion')
}

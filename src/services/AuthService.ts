//Este archivo se encarga del manejo de la autenticación y 
//la sesión del usuario en tu app usando Supabase + almacenamiento local.

import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos
import { Empleado, Sesion, Usuario } from '../types/Database'
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
  try { // <--- ESTO ES LO QUE FALTABA
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

  } catch (error: any) { // <--- Este catch ahora sí tiene su try
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

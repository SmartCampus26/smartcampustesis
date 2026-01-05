//Este archivo se encarga del manejo de la autenticación y 
//la sesión del usuario en tu app usando Supabase + almacenamiento local.

import { supabase } from '../lib/Supabase'
//Se importa la conexión a Supabase ya configurada para poder usarla y hacer consultas a la base de datos
import { Empleado, Sesion, Usuario } from '../types/Database'
// Trae los tipos para que TypeScript sepa cómo lucen los datos de usuario, empleado y sesion
import AsyncStorage from '@react-native-async-storage/async-storage'
//se importa AsyncStorage para poder almacenar la sesión del usuario en el dispositivo de forma local


// Credenciales del super admin que es un usuario especial que no está en la base de datos pero tiene permisos totales y este se valida antes que cualquier login
const SUPER_ADMIN = {
  correo: 'emily.ojeda.est@uets.edu.ec',
  contrasena: '123456789'
}

// Login con Supabase Auth 
export const loginConAuth = async (correo: string, contrasena: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  })
  
  if (error) throw error
  return data
}

// Login personalizado (consulta directa)
export const loginPersonalizado = async (// Este login no usa Supabase Auth, sino que revisa las tablas usuario o empleado
  correo: string,
  contrasena: string,
  tipo: 'usuario' | 'empleado'
): Promise<Sesion> => {
  try {
    // Verificar si es el super admin PRIMERO
    if (correo === SUPER_ADMIN.correo && contrasena === SUPER_ADMIN.contrasena) {//Si coincide correo y contraseña inicia como super admin
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

    // Login normal para otros usuarios
    if (tipo === 'usuario') {// Consulta tabla usuario
      console.log('Intentando login como usuario con:', correo)
      
      // Consulta directa a la tabla usuario
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('correoUser', correo)
        .eq('contraUser', contrasena)
        .single()

      console.log('Respuesta Supabase:', { data, error })

      if (error) {
        console.error('Error de Supabase:', error)
        throw new Error('Credenciales incorrectas')
      }
      
      if (!data) {
        throw new Error('Credenciales incorrectas')
      }
      //Busca un usuario con ese correo y que tenga esa contraseña si encuentra uno es un login correcto y si no aparece el error "Credenciales incorrectas"

      const sesion: Sesion = {
        tipo: 'usuario',
        id: data.idUser,
        rol: data.rolUser,
        data: data as Usuario,
      }
      // Guarda los datos del usuario incluyendo rol (admin, normal, etc.)

      await guardarSesionLocal(sesion)
      return sesion
      //Guarda la sesion localmente

    } else {// parecido al usuario epro esta vez busca en la tabla empleado
      console.log('Intentando login como empleado con:', correo)
      
      // Consulta directa a la tabla empleado
      const { data, error } = await supabase
        .from('empleado')
        .select('*')
        .eq('correoEmpl', correo)
        .eq('contraEmpl', contrasena)
        .single()

      console.log('Respuesta Supabase:', { data, error })

      if (error) {
        console.error('Error de Supabase:', error)
        throw new Error('Credenciales incorrectas')
      }
      
      if (!data) {
        throw new Error('Credenciales incorrectas')
      }
      //Busca un empleado con ese correo y que tenga esa contraseña si encuentra uno es un login correcto y si no aparece el error "Credenciales incorrectas"

      const sesion: Sesion = {
        tipo: 'empleado',
        id: data.idEmpl,
        data: data as Empleado,
      }
      //En este caso los empleados no tienen rol por lo que solo se guarda su información

      await guardarSesionLocal(sesion)
      return sesion
      //Guarda la sesion localmente
    }
  } catch (error: any) {
    console.error('Error en login:', error)
    throw new Error(error.message || 'Error al iniciar sesión')
    //Si algo falla en el login se lanza un error
  }
}

export const logout = async () => {
  await supabase.auth.signOut()
  await eliminarSesionLocal()
}
//Cierra sesión en Supabase borrando la sesión guardada en el teléfono

export const obtenerSesion = async (): Promise<Sesion | null> => {
  const { data } = await supabase.auth.getSession()
  if (data.session) {//Si existe una sesión
    return obtenerSesionLocal()
    //Devuelve lo que esta guardado en AsyncStorage
  }
  return null
}

// Helpers para sesión local
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
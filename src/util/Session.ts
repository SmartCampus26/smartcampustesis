import AsyncStorage from '@react-native-async-storage/async-storage'
//AsyncStorage es un módulo de almacenamiento local para aplicaciones React Native, funciona como unalmacenamiento dentro del teléfono donde tu app puede guardar datos que deben mantenerse aunque el usuario cierre la app
import { Sesion } from '../types/Database'
// Se importa Sesion un tipo o interfaz TypeScript que define la estructura de los datos del objeto de sesión que será almacenado

export const guardarSesion = async (sesion: Sesion) => {
  await AsyncStorage.setItem('sesion', JSON.stringify(sesion))
}
//Guarda la sesión del usuario en el dispositiv convirtiendo el objeto sesion a un string JSON porque AsyncStorage solo guarda texto y lo guarda bajo la clave "sesion"

export const obtenerSesion = async (): Promise<Sesion | null> => {
  const sesion = await AsyncStorage.getItem('sesion')
  return sesion ? JSON.parse(sesion) : null
}
//Recupera la sesión guardada del teléfono, busca si existe algo guardado con la clave "sesion". Si existe convierte el texto a un objeto con el JSON.parse y lo devuelve. Si no existe se devuelve null que quiere decir que no hay una sesión guardada

export const eliminarSesion = async () => {
  await AsyncStorage.removeItem('sesion')
}
//Borra la sesión guardada del dispositivo por completo
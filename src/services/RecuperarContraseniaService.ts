import { supabase } from '../lib/Supabase'
import * as Linking from 'expo-linking'

/**
 * Verifica si el correo existe en la tabla 'usuario' o 'empleado'
 */
export const verificarCorreoExiste = async (
  correo: string
): Promise<{ existe: boolean; tipo: 'usuario' | 'empleado' | null }> => {
  const correoNorm = correo.trim().toLowerCase()

  const { data: usuario } = await supabase
    .from('usuario')
    .select('idUser, correoUser')
    .ilike('correoUser', correoNorm)
    .maybeSingle()

  if (usuario) return { existe: true, tipo: 'usuario' }

  const { data: empleado } = await supabase
    .from('empleado')
    .select('idEmpl, correoEmpl')
    .ilike('correoEmpl', correoNorm)
    .maybeSingle()

  if (empleado) return { existe: true, tipo: 'empleado' }

  return { existe: false, tipo: null }
}

/**
 * Envía el correo de recuperación vía Supabase Auth.
 * En desarrollo (Expo Go) usa Linking.createURL automáticamente.
 * En producción (APK) usa el scheme real de la app.
 */
export const enviarCorreoRecuperacion = async (correo: string): Promise<void> => {
  const redirectTo = __DEV__
    ? Linking.createURL('reset-password')
    : 'smartcampus-tesis://reset-password'

  console.log('📧 redirectTo usado:', redirectTo)

  const { error } = await supabase.auth.resetPasswordForEmail(
    correo.trim().toLowerCase(),
    { redirectTo }
  )

  if (error) {
    console.error('Error al enviar correo de recuperación:', error.message)
    throw new Error('No se pudo enviar el correo. Intenta nuevamente.')
  }
}

/**
 * Actualiza la contraseña del usuario autenticado.
 */
export const actualizarContrasenia = async (nuevaContrasenia: string): Promise<void> => {
  if (nuevaContrasenia.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres')
  }

  const { error } = await supabase.auth.updateUser({
    password: nuevaContrasenia,
  })

  if (error) {
    console.error('Error al actualizar contraseña:', error.message)
    throw new Error('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
  }
}

/**
 * Valida que la contraseña cumpla requisitos mínimos.
 */
export const validarContrasenia = (
  contrasenia: string,
  confirmacion: string
): string | null => {
  if (!contrasenia.trim()) return 'Ingresa una contraseña'
  if (contrasenia.length < 6) return 'Mínimo 6 caracteres'
  if (contrasenia !== confirmacion) return 'Las contraseñas no coinciden'
  return null
}

/**
 * Valida formato básico de correo electrónico.
 */
export const validarCorreo = (correo: string): string | null => {
  if (!correo.trim()) return 'Ingresa tu correo electrónico'
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!regex.test(correo.trim())) return 'Correo electrónico inválido'
  return null
}
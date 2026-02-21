// Importa la función createClient para inicializar la conexión con Supabase
import { createClient } from '@supabase/supabase-js';

// CONFIGURACIÓN DE CONEXIÓN A SUPABASE

// Obtiene la URL del proyecto Supabase desde variables de entorno 
// estas credenciales deben definirse en el archivo .env                     
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL //Credenciales, verificar información
// Obtiene la clave anónima del proyecto Supabase
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY //Credenciales, verificar información

// Verifica que las variables de entorno existan antes de crear el cliente
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Verifica tu archivo .env')
}

/**
 * Inicializa el cliente de Supabase
 *
 * @param supabaseUrl - URL del proyecto Supabase
 * @param supabaseAnonKey - Clave anónima del proyecto Supabase
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true, // Renueva automáticamente el token de sesión cuando expira
    persistSession: true, // Mantiene la sesión activa incluso al cerrar la aplicación
    detectSessionInUrl: false, // Se desactiva porque no es una aplicación web
    // Puede configurarse en el futuro para soporte web
  },
})
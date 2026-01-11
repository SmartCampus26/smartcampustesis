import { createClient } from '@supabase/supabase-js';


// Verificar que las variables de entorno existan
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL //Credenciales, verificar información
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY //Credenciales, verificar información

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Verifica tu archivo .env')
}
/**
  @params
  - supabaseUrl: URL de tu proyecto en Supabase
  - supabaseAnonKey: Clave anónima de tu proyecto en Supabase
**/
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
     //storage:Platform.OS === "web" ? localStorage : AsyncStorage, - por si acaso en un futuro
    autoRefreshToken: true, //Renueva sesión automáticamente
    persistSession: true, //Mantiene sesión al cerrar la app
    detectSessionInUrl: false, //NO es una app web
  },
})
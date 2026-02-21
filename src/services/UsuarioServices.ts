import { supabase } from '../lib/Supabase'
import { obtenerSesion } from '../util/Session'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface NuevoUsuarioData {
  nomUser: string
  apeUser: string
  correoUser: string
  contraUser: string
  tlfUser: string
  rolUser: string
}

export const USUARIO_INICIAL: NuevoUsuarioData = {
  nomUser: '',
  apeUser: '',
  correoUser: '',
  contraUser: '',
  tlfUser: '',
  rolUser: 'docente',
}

// ─── Validación ───────────────────────────────────────────────────────────────

export function validarUsuario(data: NuevoUsuarioData): string | null {
  if (!data.nomUser || !data.apeUser || !data.correoUser || !data.contraUser) {
    return 'Completa todos los campos obligatorios'
  }
  return null
}

/**
 * Verifica si el empleado autenticado pertenece al departamento de Sistemas.
 * Solo el departamento de Sistemas tiene acceso a crear usuarios.
 *
 * @returns true si el empleado es de Sistemas, false en caso contrario
 */
export async function esDepartamentoSistemas(): Promise<boolean> {
  const sesion = await obtenerSesion()
  if (!sesion || sesion.tipo !== 'empleado') return false
  return sesion.data.deptEmpl?.toLowerCase() === 'sistemas'
}

// ─── Creación ─────────────────────────────────────────────────────────────────

export async function crearUsuario(data: NuevoUsuarioData): Promise<void> {
  // LLAMADA A LA EDGE FUNCTION
  const { data: result, error } = await supabase.functions.invoke('quick-handler', {
    body: data,
  })

  if (error) throw error
  if (result?.error) throw new Error(result.error) // Error que viene de nuestra lógica
}
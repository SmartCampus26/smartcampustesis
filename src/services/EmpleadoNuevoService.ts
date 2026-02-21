import { supabase } from '../lib/Supabase'

export interface NuevoEmpleadoForm {
  nomEmpl: string
  apeEmpl: string
  correoEmpl: string
  contraEmpl: string
  tlfEmpl: string
  deptEmpl: string
  cargEmpl: string
}

/**
 * Valida los campos del formulario de empleado.
 * Retorna un mensaje de error o null si todo es válido.
 */
export const validarEmpleado = (form: NuevoEmpleadoForm): string | null => {
  if (!form.nomEmpl || !form.apeEmpl || !form.correoEmpl || !form.contraEmpl) {
    return 'Completa todos los campos obligatorios'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.correoEmpl)) {
    return 'Ingresa un correo válido'
  }
  return null
}

/**
 * Crea un nuevo empleado invocando la Edge Function de Supabase.
 */
export const crearEmpleadoDB = async (form: NuevoEmpleadoForm): Promise<void> => {
  const { data, error } = await supabase.functions.invoke('crear-empleado', {
    body: {
      nomEmpl: form.nomEmpl,
      apeEmpl: form.apeEmpl,
      correoEmpl: form.correoEmpl,
      contraEmpl: form.contraEmpl,
      tlfEmpl: form.tlfEmpl,
      deptEmpl: form.deptEmpl,
      cargEmpl: form.cargEmpl,
    },
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)
}
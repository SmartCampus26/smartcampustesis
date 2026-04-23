// ─── useEmpleadoNuevo.ts ──────────────────────────────────────────────────────
// Hook de EmpleadoNuevo.tsx.
// Llama a crearEmpleadoDB() y validarEmpleado() de EmpleadoNuevoService.

import { useState } from 'react'
import { crearEmpleadoDB, NuevoEmpleadoForm, validarEmpleado } from '../../services/empleado/EmpleadoNuevoService'
import { useSesion } from '../../context/SesionContext'

export function useEmpleadoNuevo() {
  const { refrescarSesion } = useSesion()
  const [form, setForm] = useState<NuevoEmpleadoForm>({
    nomEmpl: '', apeEmpl: '', correoEmpl: '',
    contraEmpl: '', tlfEmpl: '', deptEmpl: 'mantenimiento', cargEmpl: 'colaborador',
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [exito, setExito]       = useState(false)

  const set = (campo: keyof NuevoEmpleadoForm, valor: string) =>
    setForm(prev => ({ ...prev, [campo]: valor }))

  const crear = async (): Promise<boolean> => {
    const errVal = validarEmpleado(form)
    if (errVal) { setError(errVal); return false }
    setCargando(true)
    setError(null)
    try {
      await crearEmpleadoDB(form)
      await refrescarSesion()
      setExito(true)
      return true
    } catch (err: any) {
      setError(err.message || 'No se pudo crear el colaborador')
      return false
    } finally {
      setCargando(false)
    }
  }

  return { form, set, cargando, error, exito, crear }
}
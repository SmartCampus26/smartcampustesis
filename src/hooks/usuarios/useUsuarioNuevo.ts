// ─── useUsuarioNuevo.ts ───────────────────────────────────────────────────────
// Hook de UsuarioNuevo.tsx.
// Llama a crearUsuario() y validarUsuario() de UsuarioServices.

import { useState } from 'react'
import { crearUsuario, NuevoUsuarioData, USUARIO_INICIAL, validarUsuario } from '../../services/usuario/UsuarioServices'
import { useSesion } from '../../context/SesionContext'

export function useUsuarioNuevo() {
  const { refrescarSesion } = useSesion()
  const [form, setForm]         = useState<NuevoUsuarioData>(USUARIO_INICIAL)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [exito, setExito]       = useState(false)

  const set = (campo: keyof NuevoUsuarioData, valor: string) =>
    setForm(prev => ({ ...prev, [campo]: valor }))

  const crear = async (): Promise<boolean> => {
    const errVal = validarUsuario(form)
    if (errVal) { setError(errVal); return false }
    setCargando(true)
    setError(null)
    try {
      await crearUsuario(form)
      await refrescarSesion()
      setExito(true)
      return true
    } catch (err: any) {
      setError(err.message || 'No se pudo crear el usuario')
      return false
    } finally {
      setCargando(false)
    }
  }

  return { form, set, cargando, error, exito, crear }
}
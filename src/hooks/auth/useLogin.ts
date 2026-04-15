// ─── useLogin.ts ──────────────────────────────────────────────────────────────
// Hook de app/index.tsx (pantalla de login).
// Solo maneja estado del formulario y llama a loginPersonalizado() de AuthService.
// Toda la lógica de autenticación y sesión vive en el servicio.
//
// USO:
//   const { correo, setCorreo, contrasena, setContrasena,
//           tipoUsuario, setTipoUsuario, cargando, error, login } = useLogin()

import { useState } from 'react'
import { loginPersonalizado } from '../../services/auth/AuthService'
import { Sesion } from '../../types/Database'

export function useLogin() {
  const [correo, setCorreo]           = useState('')
  const [contrasena, setContrasena]   = useState('')
  const [tipoUsuario, setTipoUsuario] = useState<'usuario' | 'empleado'>('usuario')
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState<string | null>(null)

  /**
   * Valida campos, llama al servicio y devuelve la sesión.
   * La navegación post-login queda en la vista.
   * @returns Sesion si fue exitoso, null si hubo error
   */
  const login = async (): Promise<Sesion | null> => {
    if (!correo.trim() || !contrasena.trim()) {
      setError('Por favor completa todos los campos')
      return null
    }

    setCargando(true)
    setError(null)

    try {
      const sesion = await loginPersonalizado(correo, contrasena, tipoUsuario)
      return sesion
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas')
      return null
    } finally {
      setCargando(false)
    }
  }

  return {
    correo, setCorreo,
    contrasena, setContrasena,
    tipoUsuario, setTipoUsuario,
    cargando,
    error,
    login,
  }
}
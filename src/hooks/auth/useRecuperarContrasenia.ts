// ─── useRecuperarContrasenia.ts ───────────────────────────────────────────────
// Hook de app/ContraseniaOlvidada.tsx.
// Maneja los tres pasos del flujo: correo → enviado → nueva contraseña.
// Toda la lógica de validación y comunicación con Supabase Auth
// vive en RecuperarContraseniaService.
//
// Pasos:
//   'correo'          → el usuario ingresa su correo
//   'enviado'         → esperando que el usuario abra el link del correo
//   'nuevaContrasenia'→ el deep link llegó, el usuario ingresa su nueva clave

import { useState } from 'react'
import {
  actualizarContrasenia,
  enviarCorreoRecuperacion,
  validarContrasenia,
  validarCorreo,
  verificarCorreoExiste,
} from '../../services/auth/RecuperarContraseniaService'

type Paso = 'correo' | 'enviado' | 'nuevaContrasenia'

export function useRecuperarContrasenia() {
  // ── Paso activo ────────────────────────────────────────────────────────
  const [paso, setPaso] = useState<Paso>('correo')

  // ── Paso 1: correo ─────────────────────────────────────────────────────
  const [correo, setCorreo]               = useState('')
  const [errorCorreo, setErrorCorreo]     = useState<string | null>(null)
  const [cargandoCorreo, setCargandoCorreo] = useState(false)

  // ── Paso 3: nueva contraseña ───────────────────────────────────────────
  const [nuevaContrasenia, setNuevaContrasenia]       = useState('')
  const [confirmaContrasenia, setConfirmaContrasenia] = useState('')
  const [ocultarNueva, setOcultarNueva]               = useState(true)
  const [ocultarConfirma, setOcultarConfirma]         = useState(true)
  const [errorNueva, setErrorNueva]                   = useState<string | null>(null)
  const [errorConfirma, setErrorConfirma]             = useState<string | null>(null)
  const [cargandoNueva, setCargandoNueva]             = useState(false)

  // ── Feedback global ────────────────────────────────────────────────────
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  // ── Paso 1: enviar correo ──────────────────────────────────────────────

  /**
   * Valida el formato del correo, verifica que exista en BD
   * y llama al servicio para enviar el link de recuperación.
   */
  const enviarCorreo = async () => {
    setMensajeError(null)

    // Validación de formato — delegada al servicio
    const errFmt = validarCorreo(correo)
    if (errFmt) { setErrorCorreo(errFmt); return }
    setErrorCorreo(null)

    setCargandoCorreo(true)
    try {
      const { existe } = await verificarCorreoExiste(correo)
      if (!existe) {
        setErrorCorreo('No encontramos una cuenta con ese correo.')
        return
      }
      await enviarCorreoRecuperacion(correo)
      setPaso('enviado')
    } catch (err: any) {
      setMensajeError(err.message || 'Ocurrió un error. Intenta nuevamente.')
    } finally {
      setCargandoCorreo(false)
    }
  }

  // ── Paso 3: guardar nueva contraseña ──────────────────────────────────

  /**
   * Valida que las contraseñas coincidan y cumplan requisitos mínimos,
   * luego llama al servicio para actualizarla en Supabase Auth.
   */
  const guardarContrasenia = async () => {
    setMensajeError(null)
    setMensajeExito(null)
    setErrorNueva(null)
    setErrorConfirma(null)

    // Validación — delegada al servicio
    const errVal = validarContrasenia(nuevaContrasenia, confirmaContrasenia)
    if (errVal) {
      if (errVal.includes('coinciden')) setErrorConfirma(errVal)
      else setErrorNueva(errVal)
      return
    }

    setCargandoNueva(true)
    try {
      await actualizarContrasenia(nuevaContrasenia)
      setMensajeExito('¡Contraseña actualizada! Ya puedes iniciar sesión.')
    } catch (err: any) {
      setMensajeError(err.message || 'No se pudo actualizar la contraseña.')
    } finally {
      setCargandoNueva(false)
    }
  }

  /** Vuelve al paso inicial limpiando el correo y los mensajes */
  const reiniciar = () => {
    setCorreo('')
    setMensajeError(null)
    setPaso('correo')
  }

  return {
    // Paso activo
    paso, setPaso,
    // Paso 1
    correo, setCorreo,
    errorCorreo, cargandoCorreo,
    enviarCorreo,
    // Paso 3
    nuevaContrasenia, setNuevaContrasenia,
    confirmaContrasenia, setConfirmaContrasenia,
    ocultarNueva, setOcultarNueva,
    ocultarConfirma, setOcultarConfirma,
    errorNueva, errorConfirma,
    cargandoNueva, guardarContrasenia,
    // Feedback global
    mensajeExito, mensajeError,
    // Utilidades
    reiniciar,
  }
}
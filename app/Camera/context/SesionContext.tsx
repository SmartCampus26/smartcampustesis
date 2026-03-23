import React, { createContext, useContext, useEffect, useState } from 'react'
import { obtenerSesion, guardarSesion, eliminarSesion } from '../../../src/util/Session'
import { Sesion } from '../../../src/types/Database'

interface SesionContextType {
  sesion: Sesion | null
  cargando: boolean
  iniciarSesion: (s: Sesion) => Promise<void>
  cerrarSesion: () => Promise<void>
  refrescarSesion: () => Promise<void>
}

const SesionContext = createContext<SesionContextType | null>(null)

export function SesionProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [cargando, setCargando] = useState(true)

  const refrescarSesion = async () => {
    const s = await obtenerSesion()
    setSesion(s)
  }

  useEffect(() => {
    refrescarSesion().finally(() => setCargando(false))
  }, [])

  const iniciarSesion = async (s: Sesion) => {
    await guardarSesion(s)
    setSesion(s)
  }

  const cerrarSesion = async () => {
    await eliminarSesion()
    setSesion(null)
  }

  return (
    <SesionContext.Provider value={{ sesion, cargando, iniciarSesion, cerrarSesion, refrescarSesion }}>
      {children}
    </SesionContext.Provider>
  )
}

export function useSesion() {
  const ctx = useContext(SesionContext)
  if (!ctx) throw new Error('useSesion debe usarse dentro de SesionProvider')
  return ctx
}
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/Supabase'
import { Sesion } from '../types/Database'
import { eliminarSesion, guardarSesion, obtenerSesion } from '../util/Session'


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
    const cargar = async () => {
      // Verifica si Supabase tiene sesión activa
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        // Supabase no tiene sesión → limpiar AsyncStorage también
        await eliminarSesion()
        setSesion(null)
      } else {
        // Supabase sí tiene sesión → cargar del AsyncStorage
        await refrescarSesion()
      }
      
      setCargando(false)
    }
    
    cargar()
  }, [])

  const iniciarSesion = async (s: Sesion) => {
    await guardarSesion(s)
    setSesion(s)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut() // ← limpia la sesión de Supabase también
    await eliminarSesion()        // ← limpia tu AsyncStorage
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
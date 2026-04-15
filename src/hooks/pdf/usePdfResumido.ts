// ─── usePdfResumido.ts ────────────────────────────────────────────────────────
// Hook de PdfResumidoPreview.tsx (PDF Resumido para autoridad).
// Llama a cargarDatosPdfResumido() y generarYDescargarPdfResumido() del servicio.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  cargarDatosPdfResumido,
  DatosPdfResumido,
  FiltroDepartamento,
} from '../../services/pdf/PdfDepartamentalService'
import { generarYDescargarPdfResumido } from '../../services/pdf/PdfResumidoService'
import { useSesion } from '../../context/SesionContext'

export function usePdfResumido() {
  const { sesion } = useSesion()
  const [filtro, setFiltro]       = useState<FiltroDepartamento>('todos')
  const [datos, setDatos]         = useState<DatosPdfResumido | null>(null)
  const [cargando, setCargando]   = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const timeoutRef                = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cargar = useCallback(async (f: FiltroDepartamento) => {
    if (!sesion) return
    setCargando(true)
    setError(null)
    try {
      const resultado = await cargarDatosPdfResumido(f, sesion)
      setDatos(resultado)
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar los datos')
    } finally {
      setCargando(false)
    }
  }, [sesion])

  // Recarga cada vez que cambia el filtro o la sesión
  useEffect(() => { if (sesion) cargar(filtro) }, [sesion, filtro])

  const cambiarFiltro = (f: FiltroDepartamento) => setFiltro(f)

  const descargar = async () => {
    if (!datos) return
    setGenerando(true)
    try {
      await generarYDescargarPdfResumido(datos)
      return true
    } catch (err: any) {
      throw err
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setGenerando(false)
    }
  }

  const cancelar = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setGenerando(false)
  }

  return { datos, filtro, cambiarFiltro, cargando, generando, error, cargar, descargar, cancelar }
}
// ─── usePdfGeneral.ts ─────────────────────────────────────────────────────────
// Hook de PdfPreview.tsx (PDF General para jefes de área).
// Llama a cargarDatosPdfGeneral() y generarYDescargarPdfGeneral() del servicio.

import { useCallback, useEffect, useRef, useState } from 'react'
import { cargarDatosPdfGeneral, DatosPdfGeneral } from '../../services/pdf/PdfDepartamentalService'
import { generarYDescargarPdfGeneral } from '../../services/pdf/PdfGeneralService'
import { useSesion } from '../../context/SesionContext'

export function usePdfGeneral() {
  const { sesion } = useSesion()
  const [datos, setDatos]         = useState<DatosPdfGeneral | null>(null)
  const [cargando, setCargando]   = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const timeoutRef                = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cargar = useCallback(async () => {
    if (!sesion) return
    setCargando(true)
    setError(null)
    try {
      const resultado = await cargarDatosPdfGeneral(sesion)
      setDatos(resultado)
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar los datos del informe')
    } finally {
      setCargando(false)
    }
  }, [sesion])

  useEffect(() => { cargar() }, [cargar])

  const descargar = async () => {
    if (!datos) return
    setGenerando(true)
    try {
      await generarYDescargarPdfGeneral(datos)
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

  return { datos, cargando, generando, error, cargar, descargar, cancelar }
}
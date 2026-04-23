// ─── useHomeEmpleado.ts ───────────────────────────────────────────────────────
// Hook de HomeEmpleado.tsx.
// Llama a cargarDatosEmpleado() y puedeGenerarPdfGeneral() del servicio.
// Incluye reintentos silenciosos cuando la sesión tarda en restaurarse
// (comportamiento documentado en el servicio original).

import { useCallback, useEffect, useState } from 'react'
import { cargarDatosEmpleado } from '../../services/empleado/Homeempleadoservice'
import { puedeGenerarPdfGeneral } from '../../services/pdf/PdfDepartamentalService'
import { useSesion } from '../../context/SesionContext'
import { Reporte } from '../../types/Database'

export function useHomeEmpleado() {
  const { sesion } = useSesion()

  const [empleado, setEmpleado]             = useState<any>(null)
  const [reportes, setReportes]             = useState<Reporte[]>([])
  const [mostrarBtnGeneral, setMostrarBtnGeneral] = useState(false)
  const [verificandoAcceso, setVerificandoAcceso] = useState(true)
  const [cargando, setCargando]             = useState(true)
  const [refrescando, setRefrescando]       = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  const cargar = useCallback(async (intento = 1) => {
    if (!sesion) return
    try {
      const datos  = await cargarDatosEmpleado(sesion)
      const acceso = puedeGenerarPdfGeneral(sesion)
      setEmpleado(datos.empleado)
      setReportes(datos.reportes)
      setMostrarBtnGeneral(acceso)
      setVerificandoAcceso(false)
      setError(null)
    } catch (err: any) {
      const msg: string = err?.message ?? ''
      const esSesion = msg.includes('válida') || msg.includes('sesión') || msg.includes('Sesión')
      // Reintento silencioso si es error de sesión (AsyncStorage todavía cargando)
      if (esSesion && intento < 4) {
        await new Promise(r => setTimeout(r, 400))
        return cargar(intento + 1)
      }
      if (!esSesion) setError(msg || 'Error al cargar datos')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }, [sesion])

  useEffect(() => { cargar() }, [cargar])

  const onRefresh = () => { setRefrescando(true); cargar() }

  return {
    empleado, reportes,
    mostrarBtnGeneral, verificandoAcceso,
    cargando, refrescando, error,
    onRefresh,
  }
}
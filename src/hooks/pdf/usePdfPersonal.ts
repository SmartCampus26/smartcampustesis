// ─── usePdfPersonal.ts ────────────────────────────────────────────────────────
// Hook de PdfPersonalPreview.tsx (PDF Personal para empleados).
// Exporta `cargar` para que la pantalla la registre con useFocusEffect,
// garantizando que los datos se actualicen cada vez que la pantalla recibe foco.
// Esto cubre el caso donde se asigna un reporte nuevo desde ReportesPendientes.

import { useCallback, useRef, useState } from 'react'
import { cargarDatosEmpleado } from '../../services/empleado/Homeempleadoservice'
import { generarPDF } from '../../services/pdf/PdfService'
import { useSesion } from '../../context/SesionContext'
import { Reporte } from '../../types/Database'

export function usePdfPersonal() {
  const { sesion } = useSesion()
  const [empleado, setEmpleado]   = useState<any>(null)
  const [reportes, setReportes]   = useState<Reporte[]>([])
  const [cargando, setCargando]   = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const timeoutRef                = useRef<ReturnType<typeof setTimeout> | null>(null)

  // cargar es estable con useCallback para usarse en useFocusEffect sin loops.
  // La pantalla llama useFocusEffect(useCallback(() => { cargar() }, [cargar]))
  // y los datos se recargan cada vez que la pantalla recibe foco.
  const cargar = useCallback(async () => {
    if (!sesion) return
    setCargando(true)
    setError(null)
    try {
      const datos = await cargarDatosEmpleado(sesion)
      setEmpleado(datos.empleado)
      setReportes(datos.reportes)
    } catch (err: any) {
      setError(err?.message || 'Error al cargar datos')
    } finally {
      setCargando(false)
    }
  }, [sesion])

  const descargar = async () => {
    if (!empleado) return
    setGenerando(true)
    try {
      const nombreCompleto = `${empleado.nomEmpl} ${empleado.apeEmpl}`.trim()
      await generarPDF(reportes, {
        titulo: `Mis Tareas — ${nombreCompleto}`,
        incluirEmpleado: false,
        incluirUsuario: true,
        mostrarGraficos: true,
        nombreGenerador: nombreCompleto,
      })
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

  // Estadísticas calculadas en memoria — no requieren llamada adicional al servicio
  const stats = {
    total:      reportes.length,
    pendientes: reportes.filter(r => r.estReporte?.toLowerCase() === 'pendiente').length,
    enProceso:  reportes.filter(r => r.estReporte?.toLowerCase() === 'en proceso').length,
    resueltos:  reportes.filter(r => r.estReporte?.toLowerCase() === 'resuelto').length,
  }

  return { empleado, reportes, stats, cargando, generando, error, cargar, descargar, cancelar }
}
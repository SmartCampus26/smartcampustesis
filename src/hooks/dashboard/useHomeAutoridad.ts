// ─── useHomeAutoridad.ts ──────────────────────────────────────────────────────
// Hook de HomeAutoridad.tsx.
// Exporta `cargar` para que la vista lo registre con useFocusEffect,
// garantizando que stats y reportes se actualicen al volver a la pantalla.

import { useCallback, useState } from 'react'
import { useSesion } from '../../context/SesionContext'
import { cargarDatosAutoridad, HomeAutoridadStats } from '../../services/usuario/HomeAutoridadService'
import { Reporte } from '../../types/Database'

export function useHomeAutoridad() {
  const { sesion } = useSesion()

  const [usuario, setUsuario]         = useState<any>(null)
  const [reportes, setReportes]       = useState<Reporte[]>([])
  const [stats, setStats]             = useState<HomeAutoridadStats>({
    total: 0, pendientes: 0, enProceso: 0, resueltos: 0,
  })
  const [cargando, setCargando]       = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // cargar es estable con useCallback — seguro para useFocusEffect sin loops.
  // La vista llama: useFocusEffect(useCallback(() => { cargar() }, [cargar]))
  const cargar = useCallback(async () => {
    if (!sesion) return
    try {
      const datos = await cargarDatosAutoridad(sesion)
      setUsuario(datos.usuario)
      setReportes(datos.reportes)
      setStats(datos.stats)
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }, [sesion])

  const onRefresh = () => { setRefrescando(true); cargar() }

  return { usuario, reportes, stats, cargando, refrescando, error, cargar, onRefresh }
}
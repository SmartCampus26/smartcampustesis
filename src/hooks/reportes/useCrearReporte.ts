// ─── useCrearReporte.ts ───────────────────────────────────────────────────────
// Hook de CrearReporte.tsx.
// Expone todo el estado del formulario + las acciones handleCrear y handleCancelar.
// La vista no contiene ninguna lógica de negocio — solo llama estas funciones.

import { useState } from 'react'
import { router } from 'expo-router'
import {
  insertarObjeto,
  insertarReporte,
  notificarJefeNuevoReporte,
  obtenerOCrearLugar,
  validarFormularioReporte,
  vincularReporteUsuario,
} from '../../services/reportes/CrearReporteServices'
import { useSaved }  from '../../context/SavedContext'
import { useSesion } from '../../context/SesionContext'
import { useToast }  from '../../context/ToastContext'

export function useCrearReporte() {
  const { savedPhotos, uploadPhotosToSupabase, clearSavedPhotos } = useSaved()
  const { showToast } = useToast()
  const { sesion }    = useSesion()

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [titulo,            setTitulo]            = useState('')
  const [descripcion,       setDescripcion]        = useState('')
  const [departamento,      setDepartamento]       = useState<'mantenimiento' | 'sistemas'>('mantenimiento')
  const [lugarSeleccionado, setLugarSeleccionado]  = useState('')
  const [pisoLugar,         setPisoLugar]          = useState('')
  const [nombreObjeto,      setNombreObjeto]       = useState('')
  const [categoriaObjeto,   setCategoriaObjeto]    = useState('')
  const [aulaLugar,         setAulaLugar]          = useState('')
  const [aulaExpanded,      setAulaExpanded]       = useState(false)
  const [numAula,           setNumAula]            = useState('')
  const [cargando,          setCargando]           = useState(false)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const limpiar = () => {
    setTitulo(''); setDescripcion(''); setDepartamento('mantenimiento')
    setLugarSeleccionado(''); setPisoLugar(''); setNombreObjeto('')
    setCategoriaObjeto(''); setAulaLugar(''); setNumAula('')
    clearSavedPhotos()
  }

  const volverAtras = () => {
    if (!sesion) { router.replace('/'); return }
    const rol = sesion.tipo === 'empleado' ? sesion.data.deptEmpl : (sesion as any).rol
    if (rol === 'autoridad') router.replace('/(auth)/HomeAutoridad')
    else router.replace('/(auth)/HomeDocente')
  }

  // ── Acciones públicas ──────────────────────────────────────────────────────

  const handleCancelar = () => { limpiar(); volverAtras() }

  const handleCrear = async (idUser: string, nombreUsuario: string) => {
    console.log('📦 Departamento al crear:', departamento) 
    const error = validarFormularioReporte({ titulo, descripcion, nombreObjeto, categoriaObjeto, lugarSeleccionado, pisoLugar, aulaLugar })
    if (error) { showToast(error, 'error'); return }

    setCargando(true)
    try {
      const pisoNumero = parseInt(pisoLugar)
      const idLugarDB  = await obtenerOCrearLugar(lugarSeleccionado, pisoNumero, aulaLugar, numAula || undefined)
      const idReporte  = await insertarReporte(descripcion, null, idUser)

      if (savedPhotos.length > 0) {
        try { await uploadPhotosToSupabase(idReporte) }
        catch { showToast('El reporte se creó pero hubo un problema al subir las fotos', 'info') }
      }

      await vincularReporteUsuario(idReporte, idUser)
      await insertarObjeto(nombreObjeto, categoriaObjeto, idLugarDB, idReporte)

      try {
        await notificarJefeNuevoReporte({
          idReporte, nombreUsuario, descripcion, nombreObjeto, categoriaObjeto, lugar: lugarSeleccionado, piso: pisoNumero, aulaLugar, numAula: numAula || undefined,
          departamento: departamento
        })
      } catch {}

      clearSavedPhotos()
      showToast(`Reporte creado${savedPhotos.length > 0 ? ` con ${savedPhotos.length} foto(s)` : ''}. El jefe asignará un colaborador.`, 'success', 3000)
      setTimeout(() => { limpiar(); volverAtras() }, 3000)
    } catch (err: any) {
      showToast(err.message || 'No se pudo crear el reporte', 'error')
    } finally {
      setCargando(false)
    }
  }

  return {
    // Campos
    titulo, setTitulo,
    descripcion, setDescripcion,
    departamento, setDepartamento,
    lugarSeleccionado, setLugarSeleccionado,
    pisoLugar, setPisoLugar,
    nombreObjeto, setNombreObjeto,
    categoriaObjeto, setCategoriaObjeto,
    aulaLugar, setAulaLugar,
    aulaExpanded, setAulaExpanded,
    numAula, setNumAula,
    // Estado
    cargando,
    // Fotos
    savedPhotos,
    // Acciones
    handleCrear, handleCancelar,
  }
}
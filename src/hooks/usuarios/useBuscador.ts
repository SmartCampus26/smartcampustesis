// ─── useBuscador.ts ───────────────────────────────────────────────────────────
// Hook de Buscador.tsx.
// Llama a fetchUsuarios(), fetchEmpleados(), eliminarUsuarioDB(),
// eliminarEmpleadoDB(), filtrarUsuarios() y filtrarEmpleados() de Buscadorservice.

import { useEffect, useState } from 'react'
import {
  eliminarEmpleadoDB,
  eliminarUsuarioDB,
  fetchEmpleados,
  fetchUsuarios,
  filtrarEmpleados,
  filtrarUsuarios,
} from '../../services/admin/Buscadorservice'
import { useSesion } from '../../context/SesionContext'
import { Empleado, Usuario } from '../../types/Database'

type TipoPersonal = 'todos' | 'usuarios' | 'empleados'

export function useBuscador() {
  const { sesion } = useSesion()

  // Solo usuarios con rolUser === 'autoridad' pueden eliminar
  const esAutoridad = sesion?.tipo === 'usuario' && sesion?.data?.rolUser === 'autoridad'
  const [usuarios, setUsuarios]     = useState<Usuario[]>([])
  const [empleados, setEmpleados]   = useState<Empleado[]>([])
  const [busqueda, setBusqueda]     = useState('')
  const [filtroActivo, setFiltroActivo] = useState<TipoPersonal>('todos')
  const [cargando, setCargando]     = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const cargar = async () => {
    try {
      setUsuarios(await fetchUsuarios())
      setEmpleados(await fetchEmpleados())
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los datos')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const onRefresh = () => { setRefrescando(true); cargar() }

  const eliminarUsuario = async (id: string) => {
    await eliminarUsuarioDB(id)
    setUsuarios(prev => prev.filter(u => u.idUser !== id))
  }

  const eliminarEmpleado = async (id: string) => {
    await eliminarEmpleadoDB(id)
    setEmpleados(prev => prev.filter(e => e.idEmpl !== id))
  }

  // Filtrado en memoria — delegado al servicio
  const usuariosFiltrados  = filtrarUsuarios(usuarios, busqueda)
  const empleadosFiltrados = filtrarEmpleados(empleados, busqueda)

  return {
    usuariosFiltrados, empleadosFiltrados,
    busqueda, setBusqueda,
    filtroActivo, setFiltroActivo,
    cargando, refrescando, error,
    onRefresh, eliminarUsuario, eliminarEmpleado,
    esAutoridad,
  }
}
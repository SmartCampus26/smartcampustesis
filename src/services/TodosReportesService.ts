// src/services/TodosReportesService.ts
import { supabase } from '../lib/Supabase'

export interface usuario {
  idUser: string
  nomUser: string
  apeUser: string
  rolUser: string
  correoUser?: string
}

export interface reporte {
  idReporte: string
  descriReporte?: string
  fecReporte?: string
  estReporte?: string
  idUser?: string
  prioReporte?: string
  imgReporte?: string | string[]
  comentReporte?: string
  usuario?: usuario | null
  empleado?: any | null
  objeto?: any | null
  lugar?: any | null
}

export const cargarDatosTodosReportes = async (): Promise<{
  usuarios: usuario[]
  reportes: reporte[]
}> => {
  const { data: usuData, error: usuError } = await supabase
    .from('usuario')
    .select('*')

  if (usuError) throw new Error('No se pudieron cargar los usuarios: ' + usuError.message)

  const { data: repData, error: repError } = await supabase
    .from('reporte')
    .select(`
      *,
      usuario:idUser (
        idUser,
        nomUser,
        apeUser,
        correoUser,
        rolUser
      ),
      empleado:idEmpl (
        idEmpl,
        nomEmpl,
        apeEmpl,
        correoEmpl,
        deptEmpl,
        cargEmpl
      ),
      objeto (
        idObj,
        nomObj,
        ctgobj,
        idLugar
      )
    `)
    .order('fecReporte', { ascending: false })

  if (repError) throw new Error('No se pudieron cargar los reportes: ' + repError.message)

  // objeto viene como ARRAY — normalizar y buscar lugar
  const reportesConLugar = await Promise.all(
    (repData || []).map(async (rep: any) => {
      const objetoArr = Array.isArray(rep.objeto) ? rep.objeto : (rep.objeto ? [rep.objeto] : [])
      const objeto = objetoArr[0] ?? null
      const idLugar = objeto?.idLugar ?? null

      if (!idLugar) return { ...rep, objeto, lugar: null }

      const { data: lugarData } = await supabase
        .from('lugar')
        .select('*')
        .eq('idLugar', idLugar)
        .single()

      return { ...rep, objeto, lugar: lugarData ?? null }
    })
  )

  return {
    usuarios: usuData || [],
    reportes: reportesConLugar,
  }
}

export const getUsuarioInfo = (
  usuarios: usuario[],
  idUser?: string
): { nombre: string; rol: string } => {
  if (!idUser) return { nombre: 'Sin asignar', rol: 'N/A' }
  const u = usuarios.find(u => u.idUser === idUser)
  if (!u) return { nombre: 'Desconocido', rol: 'N/A' }
  return { nombre: `${u.nomUser} ${u.apeUser}`, rol: u.rolUser }
}

export const filtrarTodosReportes = (
  reportes: reporte[],
  usuarios: usuario[],
  busqueda: string,
  filtroRol: string,
  filtroEstado: string
): reporte[] => {
  return reportes.filter(rep => {
    const usuarioInfo = getUsuarioInfo(usuarios, rep.idUser)
    const pasaBusqueda =
      (rep.descriReporte?.toLowerCase().includes(busqueda.toLowerCase())) ||
      (usuarioInfo.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    const pasaRol    = filtroRol    === 'todos' || usuarioInfo.rol === filtroRol
    const pasaEstado = filtroEstado === 'todos' || rep.estReporte  === filtroEstado
    return pasaBusqueda && pasaRol && pasaEstado
  })
}

export const getEstadoColor = (estado?: string): string => {
  switch (estado) {
    case 'pendiente':  return '#FCD34D'
    case 'en_proceso': return '#60A5FA'
    case 'completado': return '#34D399'
    case 'cancelado':  return '#F87171'
    default:           return '#9CA3AF'
  }
}

export const getEstadoTexto = (estado?: string): string => {
  switch (estado) {
    case 'pendiente':  return 'Pendiente'
    case 'en_proceso': return 'En Proceso'
    case 'completado': return 'Completado'
    case 'cancelado':  return 'Cancelado'
    default:           return 'Sin estado'
  }
}

export const getPrioridadColor = (prioridad?: string): string => {
  switch (prioridad) {
    case 'alta':  return '#EF4444'
    case 'media': return '#F59E0B'
    case 'baja':  return '#10B981'
    default:      return '#6B7280'
  }
}
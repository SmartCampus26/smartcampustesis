// Cliente de Supabase para consultas a la base de datos
import { supabase } from '../lib/Supabase'

// INTERFACES
// Estructura de datos del usuario
export interface usuario {
  idUser: number
  nomUser: string
  apeUser: string
  rolUser: string
}

// Estructura de datos del reporte
export interface reporte {
  idReporte: number
  descriReporte?: string
  fecReporte?: string
  estReporte?: string
  idUser?: number
  prioReporte?: string
  imgReporte?: string
  comentReporte?: string
}

// FUNCIONES

// Obtiene usuarios y reportes desde Supabase
export const cargarDatosTodosReportes = async (): Promise<{
  usuarios: usuario[]
  reportes: reporte[]
}> => {
  // Consulta de usuarios
  const { data: usuData, error: usuError } = await supabase
    .from('usuario')
    .select('*')

  if (usuError) throw new Error('No se pudieron cargar los usuarios: ' + usuError.message)

  // Consulta de reportes
  const { data: repData, error: repError } = await supabase
    .from('reporte')
    .select('*')
    .order('fecReporte', { ascending: false })

  if (repError) throw new Error('No se pudieron cargar los reportes: ' + repError.message)

  return {
    usuarios: usuData || [],
    reportes: repData || [],
  }
}

// Obtiene nombre y rol del usuario asociado a un reporte
export const getUsuarioInfo = (
  usuarios: usuario[],
  idUser?: number
): { nombre: string; rol: string } => {
  if (!idUser) return { nombre: 'Sin asignar', rol: 'N/A' }
  const usuario = usuarios.find(u => u.idUser === idUser)
  if (!usuario) return { nombre: 'Desconocido', rol: 'N/A' }
  return {
    nombre: `${usuario.nomUser} ${usuario.apeUser}`,
    rol: usuario.rolUser,
  }
}

// Filtrado de reportes por búsqueda, rol y estado
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
    const pasaRol = filtroRol === 'todos' || usuarioInfo.rol === filtroRol
    const pasaEstado = filtroEstado === 'todos' || rep.estReporte === filtroEstado
    return pasaBusqueda && pasaRol && pasaEstado
  })
}

// Devuelve el color según el estado del reporte
export const getEstadoColor = (estado?: string): string => {
  switch (estado) {
    case 'pendiente':  return '#FCD34D'
    case 'en_proceso': return '#60A5FA'
    case 'completado': return '#34D399'
    case 'cancelado':  return '#F87171'
    default:           return '#9CA3AF'
  }
}

// Devuelve el texto legible del estado
export const getEstadoTexto = (estado?: string): string => {
  switch (estado) {
    case 'pendiente':  return 'Pendiente'
    case 'en_proceso': return 'En Proceso'
    case 'completado': return 'Completado'
    case 'cancelado':  return 'Cancelado'
    default:           return 'Sin estado'
  }
}

// Devuelve el color según la prioridad del reporte
export const getPrioridadColor = (prioridad?: string): string => {
  switch (prioridad) {
    case 'alta':  return '#EF4444'
    case 'media': return '#F59E0B'
    case 'baja':  return '#10B981'
    default:      return '#6B7280'
  }
}
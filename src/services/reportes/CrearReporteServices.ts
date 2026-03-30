import { supabase } from '../../lib/Supabase'

export const LUGARES_PREDEFINIDOS = [
  'Edificio Miguel Rua',
  'Edificio Carlos Crespi',
  'Secretaria',
  'DPEI',
  'Cancha Cubierta',
  'Coliseo',
  'Patio Central',
  'Polideportivo',
  'Piscina',
  'Música',
  'Aula de Danza',
  'Tecniclub',
]

export const CATEGORIAS_OBJETOS = [
  { id: 'electricidad', nombre: 'Electricidad', icono: 'flash-outline' },
  { id: 'plomeria', nombre: 'Plomería', icono: 'water-outline' },
  { id: 'equipo_computo', nombre: 'Equipo de Cómputo', icono: 'desktop-outline' },
  { id: 'proyectores', nombre: 'Proyectores/Pantallas', icono: 'tv-outline' },
  { id: 'herramientas', nombre: 'Herramientas', icono: 'hammer-outline' },
  { id: 'laboratorio', nombre: 'Equipo de Laboratorio', icono: 'flask-outline' },
  { id: 'puertas_ventanas', nombre: 'Puertas/Ventanas', icono: 'resize-outline' },
  { id: 'otros', nombre: 'Otros', icono: 'ellipsis-horizontal-outline' },
]

/**
 * Obtiene un empleado aleatorio del departamento indicado
 */
export const fetchEmpleadoAleatorio = async (
  departamento: 'mantenimiento' | 'sistemas'
): Promise<string | null> => {
  const { data: empleados, error } = await supabase
    .from('empleado')
    .select('idEmpl')
    .eq('deptEmpl', departamento)

  if (error) throw error
  if (!empleados || empleados.length === 0) return null

  const indice = Math.floor(Math.random() * empleados.length)
  return empleados[indice].idEmpl
}

/**
 * Obtiene o crea un lugar y retorna su ID
 */
export const obtenerOCrearLugar = async (
  nomLugar: string,
  pisoLugar: number,
  aulaLugar: string,
  numAula?: string
): Promise<number> => {
  const { data: lugarExistente, error } = await supabase
    .from('lugar')
    .select('idLugar')
    .eq('nomLugar', nomLugar)
    .eq('pisoLugar', pisoLugar)
    .eq('aulaLugar', aulaLugar)
    .maybeSingle()

  if (!error && lugarExistente) return lugarExistente.idLugar

  const { data: nuevoLugar, error: errorCrear } = await supabase
    .from('lugar')
    .insert([{ nomLugar, pisoLugar, aulaLugar, numAula: numAula || null }])
    .select()
    .single()

  if (errorCrear) throw errorCrear
  return nuevoLugar.idLugar
}

export const TIPOS_AULA = [
  'Ambiente Educativo',
  'Laboratorio',
  'Otro',
] as const

export type TipoAula = typeof TIPOS_AULA[number]

/**
 * Crea el reporte en la base de datos y retorna su ID
 */
export const insertarReporte = async (
  descripcion: string,
  idEmpl: string | null,
  idUser: string
): Promise<number> => {
  const { data, error } = await supabase
    .from('reporte')
    .insert([{
      fecReporte: new Date().toISOString(),
      descriReporte: descripcion,
      estReporte: 'pendiente',
      prioReporte: 'no asignada',
      comentReporte: '',
      imgReporte: [],
      idEmpl,
      idUser,
    }])
    .select('idReporte')

  if (error) throw error
  if (!data || data.length === 0) throw new Error('No se devolvió el reporte')
  return data[0].idReporte
}

/**
 * Vincula el reporte con el usuario en reporte_usuario
 */
export const vincularReporteUsuario = async (
  idReporte: number,
  idUser: string
): Promise<void> => {
  const { error } = await supabase
    .from('reporte_usuario')
    .insert([{ idReporte, idUser }])

  if (error) throw error
}

/**
 * Crea el objeto asociado al reporte
 */
export const insertarObjeto = async (
  nomObj: string,
  ctgobj: string,
  idLugar: number,
  idReporte: number
): Promise<void> => {
  const { error } = await supabase
    .from('objeto')
    .insert([{ nomObj, ctgobj, idLugar, idReporte }])

  if (error) throw error
}

/**
 * Notifica al JEFE cuando se crea un nuevo reporte pendiente de asignación.
 * Invoca la Edge Function 'notificar-asignacion-jefe'.
 */
export const notificarJefeNuevoReporte = async (params: {
  idReporte: number
  nombreUsuario: string
  descripcion: string
  nombreObjeto: string
  categoriaObjeto: string
  lugar: string
  piso: number
  aulaLugar: string
  numAula?: string
}): Promise<void> => {
  const { error } = await supabase.functions.invoke('notificar-asignacion-jefe', {
    body: {
      idReporte: params.idReporte,
      nombreUsuario: params.nombreUsuario,
      descripcion: params.descripcion,
      nombreObjeto: params.nombreObjeto,
      categoriaObjeto: params.categoriaObjeto,
      lugar: params.lugar,
      piso: params.piso,
      aulaLugar: params.aulaLugar,
      numAula: params.numAula,
    },
  })

  if (error) throw error
}

/**
 * Valida los campos del formulario antes de enviar
 */
export const validarFormularioReporte = (campos: {
  titulo: string
  descripcion: string
  nombreObjeto: string
  categoriaObjeto: string
  lugarSeleccionado: string
  pisoLugar: string
  aulaLugar: string
}): string | null => {
  const { titulo, descripcion, nombreObjeto, categoriaObjeto, lugarSeleccionado, pisoLugar, aulaLugar } = campos

  if (!titulo.trim()) return 'Por favor ingresa un título'
  if (!descripcion.trim()) return 'Por favor ingresa una descripción'
  if (!nombreObjeto.trim()) return 'Por favor ingresa el nombre del objeto'
  if (!categoriaObjeto) return 'Por favor selecciona una categoría de objeto'
  if (!lugarSeleccionado) return 'Por favor selecciona un lugar'
  if (!pisoLugar.trim()) return 'Por favor ingresa el piso'
  if (!aulaLugar) return 'Por favor selecciona el tipo de aula'

  const pisoNumero = parseInt(pisoLugar)
  if (isNaN(pisoNumero) || pisoNumero < 1) return 'El piso debe ser un número válido mayor a 0'

  return null
}
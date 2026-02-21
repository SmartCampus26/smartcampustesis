import { supabase } from '../lib/Supabase'

export const LUGARES_PREDEFINIDOS = [
  'Polideportivo',
  'Piscina',
  'Música',
  'Cancha Cubierta',
  'Patio Central',
  'Aula de Danza',
  'Edificio Miguel Rua',
  'Edificio Carlos Crespi',
  'Secretaria',
  'Tecniclub',
  'Coliseo',
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
  pisoLugar: number
): Promise<number> => {
  const { data: lugarExistente, error } = await supabase
    .from('lugar')
    .select('idLugar')
    .eq('nomLugar', nomLugar)
    .eq('pisoLugar', pisoLugar)
    .single()

  if (!error && lugarExistente) return lugarExistente.idLugar

  const { data: nuevoLugar, error: errorCrear } = await supabase
    .from('lugar')
    .insert([{ nomLugar, pisoLugar }])
    .select()
    .single()

  if (errorCrear) throw errorCrear
  return nuevoLugar.idLugar
}

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
 * Envía notificación al empleado asignado vía Edge Function
 */
export const notificarEmpleado = async (params: {
  idReporte: number
  idEmpleado: string
  nombreUsuario: string
  descripcion: string
  nombreObjeto: string
  categoriaObjeto: string
  lugar: string
  piso: number
  fotosUris: string[]
}): Promise<void> => {
  const { error } = await supabase.functions.invoke('notificar-nuevo-reporte', {
    body: {
      idReporte: params.idReporte,
      idEmpleado: params.idEmpleado,
      nombreUsuario: params.nombreUsuario,
      descripcion: params.descripcion,
      nombreObjeto: params.nombreObjeto,
      categoriaObjeto: params.categoriaObjeto,
      lugar: params.lugar,
      piso: params.piso,
      fotos: params.fotosUris,
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
}): string | null => {
  const { titulo, descripcion, nombreObjeto, categoriaObjeto, lugarSeleccionado, pisoLugar } = campos

  if (!titulo.trim()) return 'Por favor ingresa un título'
  if (!descripcion.trim()) return 'Por favor ingresa una descripción'
  if (!nombreObjeto.trim()) return 'Por favor ingresa el nombre del objeto'
  if (!categoriaObjeto) return 'Por favor selecciona una categoría de objeto'
  if (!lugarSeleccionado) return 'Por favor selecciona un lugar'
  if (!pisoLugar.trim()) return 'Por favor ingresa el piso'

  const pisoNumero = parseInt(pisoLugar)
  if (isNaN(pisoNumero) || pisoNumero < 1) return 'El piso debe ser un número válido mayor a 0'

  return null
}
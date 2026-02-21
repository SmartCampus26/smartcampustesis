// Importa la instancia de Supabase para conexión con la base de datos
import { supabase } from '../lib/Supabase'

// Importa los tipos TypeScript de la base de datos
import { Empleado, Reporte } from '../types/Database'

// Importa función para obtener la sesión activa
import { obtenerSesion } from '../util/Session'

// ===================== CARGAR SESIÓN =====================

/**
 * Obtiene el nombre completo de la autoridad autenticada.
 * Retorna 'Sistema' si no hay sesión activa.
 */
export const cargarNombreAutoridad = async (): Promise<string> => {
  try {
    // Obtiene la sesión guardada
    const sesion = await obtenerSesion()

    // Si existe sesión
    if (sesion) {
      // Si es usuario
      if (sesion.tipo === 'usuario') {
        return `${sesion.data.nomUser} ${sesion.data.apeUser}`
      }
      // Si es empleado
      else if (sesion.tipo === 'empleado') {
        return `${sesion.data.nomEmpl} ${sesion.data.apeEmpl}`
      }
    }
  } catch (error) {
    // Si ocurre error lo muestra en consola
    console.error('Error al recuperar sesión:', error)
  }
  return 'Sistema'
}

// ===================== CARGAR DATOS =====================

/**
 * Carga empleados y reportes desde Supabase en paralelo.
 * Retorna ambas listas o lanza un error si alguna falla.
 */
export const cargarEmpleadosYReportes = async (): Promise<{
  empleados: Empleado[]
  reportes: Reporte[]
}> => {
  // Consulta tabla empleado
  const { data: empData, error: empError } = await supabase
    .from('empleado')        // Selecciona tabla empleado
    .select('*')             // Selecciona todos los campos
    .order('nomEmpl', { ascending: true }) // Ordena por nombre

  // Si hay error
  if (empError) throw new Error('No se pudieron cargar los empleados: ' + empError.message)

  // Consulta tabla reporte
  const { data: repData, error: repError } = await supabase
    .from('reporte')         // Tabla reporte
    .select('*')             // Todos los campos
    .order('idReporte', { ascending: false }) // Orden descendente

  // Si hay error
  if (repError) throw new Error('No se pudieron cargar los reportes: ' + repError.message)

  return {
    empleados: empData || [],
    reportes: repData || [],
  }
}

// ===================== REASIGNAR REPORTE =====================

/**
 * Actualiza el empleado asignado a un reporte y envía notificación.
 */
export const reasignarReporteDB = async (
  idReporte: string,
  empleadoId: string,
  nombreAutoridad: string
): Promise<void> => {
  // 1️⃣ Actualiza base de datos
  const { error } = await supabase
    .from('reporte')
    .update({ idEmpl: empleadoId }) // Cambia el empleado asignado
    .eq('idReporte', idReporte)

  // Si hay error
  if (error) throw new Error('No se pudo reasignar: ' + error.message)

  // 2️⃣ Envía notificación mediante Edge Function
  try {
    await supabase.functions.invoke('notificar-reasignacion-reporte', {
      body: {
        idReporte,
        idEmpleadoNuevo: empleadoId,
        nombreAutoridad,
      },
    })
  } catch (notifError) {
    console.error('Error al enviar notificación:', notifError)
  }
}

// ===================== FILTRO DE EMPLEADOS =====================

/**
 * Filtra empleados por departamento y cargo.
 */
export const filtrarEmpleados = (
  empleados: Empleado[],
  filtroDepto: string,
  filtroCargo: string
): Empleado[] => {
  return empleados.filter((emp) => {
    // Verifica departamento
    const pasaDepto = filtroDepto === 'todos' || emp.deptEmpl === filtroDepto
    // Verifica cargo
    const pasaCargo = filtroCargo === 'todos' || emp.cargEmpl === filtroCargo
    // Retorna solo si cumple ambos filtros
    return pasaDepto && pasaCargo
  })
}

// ===================== OBTENER NOMBRE DE EMPLEADO =====================

/**
 * Busca el nombre completo de un empleado por su ID.
 * Retorna 'Sin asignar' o 'Desconocido' si no se encuentra.
 */
export const getEmpleadoNombre = (empleados: Empleado[], idEmpl?: string): string => {
  // Si no tiene empleado asignado
  if (!idEmpl) return 'Sin asignar'

  // Busca empleado por ID
  const emp = empleados.find((e) => e.idEmpl === idEmpl)

  // Si existe lo devuelve, si no devuelve "Desconocido"
  return emp ? `${emp.nomEmpl} ${emp.apeEmpl}` : 'Desconocido'
}
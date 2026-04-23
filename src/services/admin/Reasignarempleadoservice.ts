// src/services/Reasignarempleadoservice.ts
import { supabase } from '../../lib/Supabase'
import { Empleado, Reporte, Sesion } from '../../types/Database'

export const obtenerNombreDesdeSesion = (sesion: Sesion | null): string => {
  try {
    if (sesion) {
      if (sesion.tipo === 'usuario')  return `${sesion.data.nomUser} ${sesion.data.apeUser}`
      if (sesion.tipo === 'empleado') return `${sesion.data.nomEmpl} ${sesion.data.apeEmpl}`
    }
  } catch (error) {
    console.error('Error al recuperar sesión:', error)
  }
  return 'Sistema'
}

export const cargarEmpleadosYReportes = async (): Promise<{
  empleados: Empleado[]
  reportes: Reporte[]
}> => {
  const { data: empData, error: empError } = await supabase
    .from('empleado')
    .select('*')
    .order('nomEmpl', { ascending: true })

  if (empError) throw new Error('No se pudieron cargar los empleados: ' + empError.message)

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

  // objeto viene como ARRAY desde Supabase — tomar el primer elemento
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
    empleados: empData || [],
    reportes: reportesConLugar,
  }
}

export const reasignarReporteDB = async (
  idReporte: string,
  empleadoId: string,
  nombreAutoridad: string
): Promise<void> => {
  const { error } = await supabase
    .from('reporte')
    .update({ idEmpl: empleadoId })
    .eq('idReporte', idReporte)

  if (error) throw new Error('No se pudo reasignar: ' + error.message)

  try {
    await supabase.functions.invoke('notificar-reasignacion-reporte', {
      body: { idReporte, idEmpleadoNuevo: empleadoId, nombreAutoridad },
    })
  } catch (notifError) {
    console.error('Error al enviar notificación:', notifError)
  }
}

export const filtrarEmpleados = (
  empleados: Empleado[],
  filtroDepto: string,
  filtroCargo: string
): Empleado[] => {
  return empleados.filter((emp) => {
    const pasaDepto = filtroDepto === 'todos' || emp.deptEmpl === filtroDepto
    const pasaCargo = filtroCargo === 'todos' || emp.cargEmpl === filtroCargo
    return pasaDepto && pasaCargo
  })
}

export const getEmpleadoNombre = (empleados: Empleado[], idEmpl?: string): string => {
  if (!idEmpl) return 'Sin asignar'
  const emp = empleados.find((e) => e.idEmpl === idEmpl)
  return emp ? `${emp.nomEmpl} ${emp.apeEmpl}` : 'Desconocido'
}
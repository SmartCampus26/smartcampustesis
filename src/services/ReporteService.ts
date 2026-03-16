// src/services/ReporteService.ts
import { supabase } from '../lib/Supabase'
import { Reporte } from '../types/Database'

export const crearReporte = (reporte: Reporte) =>
  supabase.from('reporte').insert(reporte).select().single()

export const obtenerReportes = async () => {
  const { data, error } = await supabase
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

  if (error) return { data: null, error }

  // objeto viene como ARRAY desde Supabase — tomar el primer elemento
  const reportesConLugar = await Promise.all(
    (data || []).map(async (rep: any) => {
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

  return { data: reportesConLugar, error: null }
}

export const actualizarReporte = (
  idReporte: number,
  cambios: Partial<Reporte>
) =>
  supabase.from('reporte').update(cambios).eq('idReporte', idReporte)

export const eliminarReporte = (idReporte: number) =>
  supabase.from('reporte').delete().eq('idReporte', idReporte)
/**
 * PdfPersonalPreview.tsx
 *
 * Pantalla de previsualización del PDF personal del empleado.
 * Muestra estadísticas y gráficos de sus reportes asignados,
 * y permite descargar el PDF directamente.
 *
 * Accesible para todos los empleados desde HomeEmpleado.
 * Se navega con router.push('/PdfPersonalPreview').
 * Ubicación: app/(auth)/ (capa de vista)
 */

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg'
import { pdfPersonalPreviewStyles as styles } from '../../src/components/pdfPersonalPreviewStyles'
import { useToast } from '../../src/components/ToastContext'
import { useSesion } from '../../src/context/SesionContext'; // ← agrega
import { cargarDatosEmpleado } from '../../src/services/Homeempleadoservice'
import { generarPDF } from '../../src/services/PdfService'
import { Reporte } from '../../src/types/Database'



// ─── Colores ──────────────────────────────────────────────────────────────────

const C = {
  pendiente: '#FFA726',
  enProceso: '#42A5F5',
  resuelto:  '#66BB6A',
  alta:      '#EF4444',
  media:     '#F59E0B',
  baja:      '#6366F1',
}

// ─── Gráfico de pastel SVG ────────────────────────────────────────────────────

/**
 * Gráfico de pastel para distribución por estado.
 * Usa react-native-svg para renderizado nativo en la previsualización.
 */
function GraficoPie({ pendientes, enProceso, resueltos }: {
  pendientes: number; enProceso: number; resueltos: number
}) {
  const total = pendientes + enProceso + resueltos
  const S = 150, cx = S / 2, cy = S / 2, r = S * 0.38

  if (total === 0) {
    return (
      <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        <Circle cx={cx} cy={cy} r={r} fill="#e5e7eb" />
        <SvgText x={cx} y={cy + 5} textAnchor="middle" fontSize={11} fill="#9ca3af">Sin datos</SvgText>
      </Svg>
    )
  }

  const datos = [
    { valor: pendientes, color: C.pendiente },
    { valor: enProceso,  color: C.enProceso },
    { valor: resueltos,  color: C.resuelto  },
  ].filter(d => d.valor > 0)

  let paths: React.ReactElement[] = []
  if (datos.length === 1) {
    paths = [<Circle key="0" cx={cx} cy={cy} r={r} fill={datos[0].color} />]
  } else {
    let ang = -Math.PI / 2
    paths = datos.map((d, i) => {
      const prop = d.valor / total
      const arco = prop * 2 * Math.PI
      const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang)
      ang += arco
      const x2 = cx + r * Math.cos(ang), y2 = cy + r * Math.sin(ang)
      return (
        <Path key={i}
          d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${arco > Math.PI ? 1 : 0} 1 ${x2} ${y2}Z`}
          fill={d.color} stroke="white" strokeWidth={1.5}
        />
      )
    })
  }

  return (
    <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      {paths}
      <Circle cx={cx} cy={cy} r={r * 0.33} fill="white" />
      <SvgText x={cx} y={cy - 4} textAnchor="middle" fontSize={9} fill="#6b7280">Total</SvgText>
      <SvgText x={cx} y={cy + 11} textAnchor="middle" fontSize={15} fontWeight="bold" fill="#1f2937">{total}</SvgText>
    </Svg>
  )
}

// ─── Gráfico de barras SVG ────────────────────────────────────────────────────

/**
 * Gráfico de barras para distribución por prioridad.
 */
function GraficoBarras({ reportes }: { reportes: Reporte[] }) {
  const alta  = reportes.filter(r => r.prioReporte?.toLowerCase() === 'alta').length
  const media = reportes.filter(r => r.prioReporte?.toLowerCase() === 'media').length
  const baja  = reportes.filter(r => r.prioReporte?.toLowerCase() === 'baja').length
  const maxV  = Math.max(alta, media, baja, 1)
  const hMax  = 80

  const barra = (x: number, valor: number, color: string, label: string) => {
    const h = Math.max((valor / maxV) * hMax, valor > 0 ? 4 : 0)
    const y = 95 - h
    return (
      <React.Fragment key={label}>
        <Rect x={x} y={y} width={32} height={h} fill={color} rx={3} />
        <SvgText x={x + 16} y={y - 5} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#1f2937">{valor}</SvgText>
        <SvgText x={x + 16} y={110} textAnchor="middle" fontSize={10} fill="#374151">{label}</SvgText>
      </React.Fragment>
    )
  }

  return (
    <Svg width={150} height={120} viewBox="0 0 150 120">
      {barra(15,  alta,  C.alta,  'Alta')}
      {barra(59,  media, C.media, 'Media')}
      {barra(103, baja,  C.baja,  'Baja')}
    </Svg>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function PdfPersonalPreview() {
  const { showToast } = useToast()
   const { sesion } = useSesion() 
  const [cargando, setCargando]           = useState(true)
  const [generando, setGenerando]         = useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [empleado, setEmpleado]           = useState<any>(null)
  const [reportes, setReportes]           = useState<Reporte[]>([])

  useEffect(() => {
    if (sesion) cargarDatos()  // ← solo si hay sesión
  }, [sesion])  // ← depende de sesion 

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true)
     if (!sesion) return  // ← guarda por si acaso
      const datos = await cargarDatosEmpleado(sesion)  // ← pasa sesion
      setEmpleado(datos.empleado)
      setReportes(datos.reportes)
    } catch (err: any) {
      console.error('Error cargando datos PDF personal:', err)
    } finally {
      setCargando(false)
    }
   }, [sesion])

  const handleDescargar = async () => {
    try {
      setGenerando(true)
      const nombreCompleto = empleado
        ? `${empleado.nomEmpl} ${empleado.apeEmpl}`.trim()
        : 'Colaborador'
      await generarPDF(reportes, {
        titulo: `Mis Tareas — ${nombreCompleto}`,
        incluirEmpleado: false,
        incluirUsuario: true,
        mostrarGraficos: true,
        nombreGenerador: nombreCompleto,
      })
      showToast('PDF listo en el dispositivo', 'success')
    } catch (err: any) {
      const msg = err?.message ?? 'No se pudo generar el PDF'
      if (!msg.includes('proceso')) showToast(msg, 'error')
      else showToast(msg, 'info')
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setGenerando(false)
    }
  }

  /** Cancela la generación si se queda cargando */
  const cancelarGeneracion = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setGenerando(false)
    showToast('Generación cancelada', 'info')
  }

  // ── Cargando ──────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.cargandoText}>Preparando informe…</Text>
      </View>
    )
  }

  const stats = {
    total:      reportes.length,
    pendientes: reportes.filter(r => r.estReporte?.toLowerCase() === 'pendiente').length,
    enProceso:  reportes.filter(r => r.estReporte?.toLowerCase() === 'en proceso').length,
    resueltos:  reportes.filter(r => r.estReporte?.toLowerCase() === 'resuelto').length,
  }

  const nombreCompleto = empleado
    ? `${empleado.nomEmpl} ${empleado.apeEmpl}`.trim()
    : 'Colaborador'

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Encabezado */}
        <View style={styles.header}>
          <Ionicons name="document-text" size={40} color="#1e40af" />
          <Text style={styles.headerTitulo}>Mi Informe Personal</Text>
          <Text style={styles.headerSub}>{nombreCompleto}</Text>
          <Text style={styles.headerFecha}>
            {new Date().toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>
          {empleado?.deptEmpl && (
            <View style={styles.deptBadge}>
              <Ionicons
                name={empleado.deptEmpl?.toLowerCase() === 'sistemas' ? 'desktop-outline' : 'construct-outline'}
                size={14} color="#1e40af"
              />
              <Text style={styles.deptText} numberOfLines={1}>
                {empleado.cargEmpl} · {empleado.deptEmpl}
              </Text>
            </View>
          )}
        </View>

        {/* Estadísticas */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Resumen de tareas</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#1e40af' }]}>
              <Text style={[styles.statNum, { color: '#1e40af' }]}>{stats.total}</Text>
              <Text style={styles.statLbl}>Total</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: C.pendiente }]}>
              <Text style={[styles.statNum, { color: C.pendiente }]}>{stats.pendientes}</Text>
              <Text style={styles.statLbl}>Pendientes</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: C.enProceso }]}>
              <Text style={[styles.statNum, { color: C.enProceso }]}>{stats.enProceso}</Text>
              <Text style={styles.statLbl}>En Proceso</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: C.resuelto }]}>
              <Text style={[styles.statNum, { color: C.resuelto }]}>{stats.resueltos}</Text>
              <Text style={styles.statLbl}>Resueltos</Text>
            </View>
          </View>
        </View>

        {/* Gráficos */}
        {stats.total > 0 ? (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Análisis estadístico</Text>
            <View style={styles.graficosRow}>
              <View style={styles.graficoWrap}>
                <Text style={styles.graficoTitulo}>Por Estado</Text>
                <GraficoPie
                  pendientes={stats.pendientes}
                  enProceso={stats.enProceso}
                  resueltos={stats.resueltos}
                />
              </View>
              <View style={styles.graficoWrap}>
                <Text style={styles.graficoTitulo}>Por Prioridad</Text>
                <GraficoBarras reportes={reportes} />
              </View>
            </View>
            <View style={styles.leyendaRow}>
              {[
                { color: C.pendiente, label: `Pendientes (${stats.pendientes})` },
                { color: C.enProceso, label: `En Proceso (${stats.enProceso})` },
                { color: C.resuelto,  label: `Resueltos (${stats.resueltos})` },
              ].map(item => (
                <View key={item.label} style={styles.leyendaItem}>
                  <View style={[styles.leyendaDot, { backgroundColor: item.color }]} />
                  <Text style={styles.leyendaTexto}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.seccion}>
            <View style={styles.sinDatos}>
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text style={styles.sinDatosText}>No tienes reportes asignados aún</Text>
            </View>
          </View>
        )}

        {/* Mensaje cuando no hay reportes */}
        {stats.total === 0 && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fcd34d',
            borderRadius: 10, padding: 14, marginBottom: 12,
          }}>
            <Ionicons name="information-circle-outline" size={20} color="#92400e" />
            <Text style={{ fontSize: 13, color: '#92400e', flex: 1, lineHeight: 18 }}>
              No tienes reportes asignados. El PDF estará disponible cuando se te asignen tareas.
            </Text>
          </View>
        )}

        {/* Botón descargar — deshabilitado si no hay reportes */}
        <TouchableOpacity
          style={[styles.btnDescargar, (generando || stats.total === 0) && styles.btnDescargarDisabled]}
          onPress={handleDescargar}
          disabled={generando || stats.total === 0}
          activeOpacity={0.8}
        >
          {generando ? (
            <TouchableOpacity
              onPress={cancelarGeneracion}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.btnDescargarText}>Generando…</Text>
              <Text style={{ color: '#fca5a5', fontSize: 12 }}>  Cancelar ✕</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Ionicons name="download-outline" size={22} color="#fff" />
              <Text style={styles.btnDescargarText}>Descargar mi PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnVolver} onPress={() => router.replace('/HomeEmpleado')}>
          <Ionicons name="arrow-back-outline" size={18} color="#6b7280" />
          <Text style={styles.btnVolverText}>Volver</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}
// ===============================
// IMPORTACIONES NECESARIAS
// ===============================

import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system/legacy'
import { Alert } from 'react-native'
import { obtenerSesion } from '../util/Session'
import { obtenerEstadisticas } from './filtrosReportes'
import { Reporte, esEmpleado, esUsuario } from '../types/Database'

// ============================================
// INTERFACES Y TIPOS
// ============================================

interface Stats {
  total: number
  pendientes: number
  enProceso: number
  resueltos: number
}

interface OpcionesPDF {
  titulo?: string
  incluirImagen?: boolean
  incluirEmpleado?: boolean
  incluirUsuario?: boolean
  incluirDescripcion?: boolean
  mostrarGraficos?: boolean
  nombreGenerador?: string
}

// ============================================
// CONSTANTES DE COLORES
// ============================================

const ESTADO_COLORES = {
  pendiente:    { bg: '#FEF3C7', text: '#92400e' },
  'en proceso': { bg: '#DBEAFE', text: '#1e40af' },
  resuelto:     { bg: '#D1FAE5', text: '#065f46' },
  default:      { bg: '#F3F4F6', text: '#1f2937' }
}

const PRIORIDAD_COLORES = {
  alta:    { bg: '#FEE2E2', text: '#991b1b' },
  media:   { bg: '#FED7AA', text: '#9a3412' },
  baja:    { bg: '#E0E7FF', text: '#3730a3' },
  default: { bg: '#F3F4F6', text: '#1f2937' }
}

// ============================================
// FUNCIÓN: GENERAR GRÁFICO PIE como SVG
// ============================================
function generarGraficoPieSVG(stats: {
  pendientes: number
  enProceso: number
  resueltos: number
}): string {
  const datos = [
    { label: 'Pendientes', valor: stats.pendientes, color: '#FFA726' },
    { label: 'En Proceso', valor: stats.enProceso,  color: '#42A5F5' },
    { label: 'Resueltos',  valor: stats.resueltos,  color: '#66BB6A' }
  ]

  const total = datos.reduce((sum, d) => sum + d.valor, 0)
  const cx = 150
  const cy = 150
  const radio = 120

  if (total === 0) {
    return `
      <svg width="300" height="430" viewBox="0 0 300 430" xmlns="http://www.w3.org/2000/svg">
        <text x="150" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">Distribución por Estado</text>
        <circle cx="${cx}" cy="${cy}" r="${radio}" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
        <text x="150" y="155" text-anchor="middle" fill="#6b7280" font-size="16" font-family="sans-serif">Sin datos</text>
      </svg>
    `
  }

  const datosConValor = datos.filter(d => d.valor > 0)
  let segmentosHTML = ''
  let porcentajesHTML = ''

  if (datosConValor.length === 1) {
    segmentosHTML = `<circle cx="${cx}" cy="${cy}" r="${radio}" fill="${datosConValor[0].color}" stroke="white" stroke-width="2"/>`
    porcentajesHTML = `<text x="${cx}" y="${cy - 50}" text-anchor="middle" font-size="18" font-weight="bold" font-family="sans-serif" fill="white">100%</text>`
  } else {
    let anguloActual = -Math.PI / 2
    segmentosHTML = datosConValor.map((dato) => {
      const proporcion = dato.valor / total
      const anguloSegmento = proporcion * 2 * Math.PI
      const x1 = cx + radio * Math.cos(anguloActual)
      const y1 = cy + radio * Math.sin(anguloActual)
      anguloActual += anguloSegmento
      const x2 = cx + radio * Math.cos(anguloActual)
      const y2 = cy + radio * Math.sin(anguloActual)
      const largeArc = anguloSegmento > Math.PI ? 1 : 0
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radio} ${radio} 0 ${largeArc} 1 ${x2} ${y2} Z`
      return `<path d="${path}" fill="${dato.color}" stroke="white" stroke-width="2"/>`
    }).join('')

    let anguloActual2 = -Math.PI / 2
    porcentajesHTML = datosConValor.map((dato) => {
      const proporcion = dato.valor / total
      const anguloSegmento = proporcion * 2 * Math.PI
      anguloActual2 += anguloSegmento
      const anguloMedio = anguloActual2 - anguloSegmento / 2
      const radioEtiqueta = radio * 0.6
      const labelX = cx + radioEtiqueta * Math.cos(anguloMedio)
      const labelY = cy + radioEtiqueta * Math.sin(anguloMedio)
      const porcentaje = Math.round(proporcion * 100)
      if (porcentaje <= 5) return ''
      return `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="bold" font-family="sans-serif" fill="white">${porcentaje}%</text>`
    }).join('')
  }

  const leyenda = datos.map((dato, i) => {
    const porcentaje = total > 0 ? Math.round((dato.valor / total) * 100) : 0
    const yPos = 340 + i * 28
    return `<rect x="30" y="${yPos}" width="16" height="16" rx="3" fill="${dato.color}" opacity="${dato.valor > 0 ? 1 : 0.3}"/><text x="52" y="${yPos + 13}" font-size="14" font-family="sans-serif" fill="${dato.valor > 0 ? '#374151' : '#9ca3af'}">${dato.label}: ${dato.valor} (${porcentaje}%)</text>`
  }).join('')

  return `<svg width="300" height="430" viewBox="0 0 300 430" xmlns="http://www.w3.org/2000/svg"><text x="150" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">Distribución por Estado</text>${segmentosHTML}${porcentajesHTML}<circle cx="${cx}" cy="${cy}" r="35" fill="white"/><text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="11" font-family="sans-serif" fill="#6b7280">Total</text><text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1f2937">${total}</text>${leyenda}</svg>`
}

// ============================================
// FUNCIÓN: GENERAR GRÁFICO DE BARRAS POR PRIORIDAD
// ============================================
function generarGraficoBarrasPrioridad(reportes: Reporte[]): string {
  // ← FIX: comparar con toLowerCase() para cubrir "Alta", "ALTA", "alta"
  const conteo = {
    alta:  reportes.filter(r => r.prioReporte?.toLowerCase() === 'alta').length,
    media: reportes.filter(r => r.prioReporte?.toLowerCase() === 'media').length,
    baja:  reportes.filter(r => r.prioReporte?.toLowerCase() === 'baja').length,
  }

  const maxValor = Math.max(conteo.alta, conteo.media, conteo.baja, 1)
  const alturaMaxBarra = 200

  return `
    <svg width="400" height="350" viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
      <text x="200" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">
        Distribución por Prioridad
      </text>
      <rect x="40"  y="${280 - (conteo.alta  / maxValor * alturaMaxBarra)}" width="80" height="${conteo.alta  / maxValor * alturaMaxBarra}" fill="#EF4444" rx="4"/>
      <text x="80"  y="${270 - (conteo.alta  / maxValor * alturaMaxBarra)}" text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">${conteo.alta}</text>
      <text x="80"  y="305" text-anchor="middle" font-size="14" fill="#374151">Alta</text>

      <rect x="160" y="${280 - (conteo.media / maxValor * alturaMaxBarra)}" width="80" height="${conteo.media / maxValor * alturaMaxBarra}" fill="#F59E0B" rx="4"/>
      <text x="200" y="${270 - (conteo.media / maxValor * alturaMaxBarra)}" text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">${conteo.media}</text>
      <text x="200" y="305" text-anchor="middle" font-size="14" fill="#374151">Media</text>

      <rect x="280" y="${280 - (conteo.baja  / maxValor * alturaMaxBarra)}" width="80" height="${conteo.baja  / maxValor * alturaMaxBarra}" fill="#6366F1" rx="4"/>
      <text x="320" y="${270 - (conteo.baja  / maxValor * alturaMaxBarra)}" text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">${conteo.baja}</text>
      <text x="320" y="305" text-anchor="middle" font-size="14" fill="#374151">Baja</text>
    </svg>
  `
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function construirNombreArchivo(nombreGenerador?: string): string {
  const fechaArchivo = new Date().toISOString().split('T')[0]
  const nombreLimpio = (nombreGenerador || 'Sistema')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
  return `informe_${fechaArchivo}_${nombreLimpio}.pdf`
}

async function renombrarArchivoPDF(uriOriginal: string, nombreArchivo: string): Promise<string> {
  const ultimaBarraPos: number = uriOriginal.lastIndexOf('/') + 1
  const directorioBase = uriOriginal.substring(0, ultimaBarraPos)
  const nuevaUri = `${directorioBase}${nombreArchivo}`
  await FileSystem.moveAsync({ from: uriOriginal, to: nuevaUri })
  return nuevaUri
}

// ============================================
// FUNCIÓN PRINCIPAL: GENERAR PDF
// ============================================

export async function generarPDF(
  reportes: Reporte[],
  opciones: OpcionesPDF = { mostrarGraficos: true }
) {
  try {
    if (!reportes || reportes.length === 0) {
      Alert.alert('Advertencia', 'No hay reportes para generar el PDF')
      return
    }

    const stats = obtenerEstadisticas(reportes)

    let nombreGenerador = opciones.nombreGenerador
    let puestoGenerador = ''

    if (!nombreGenerador) {
      try {
        const sesion = await obtenerSesion()
        if (sesion) {
          if (esEmpleado(sesion)) {
            const e = sesion.data
            nombreGenerador = `${e.nomEmpl} ${e.apeEmpl}`.trim()
            puestoGenerador = e.cargEmpl || ''
          } else if (esUsuario(sesion)) {
            const u = sesion.data
            nombreGenerador = `${u.nomUser} ${u.apeUser}`.trim()
            puestoGenerador = u.rolUser || 'Usuario'
          }
        }
        if (!nombreGenerador) nombreGenerador = 'Sistema'
      } catch (error) {
        console.error('Error obteniendo datos de sesión para PDF:', error)
        nombreGenerador = 'Sistema'
      }
    }

    const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

    const tituloPDF = opciones.titulo || 'Informe de Reportes'
    const graficoSVG     = generarGraficoPieSVG(stats)
    const graficoBarras  = generarGraficoBarrasPrioridad(reportes)

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tituloPDF}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 40px;
            color: #1f2937;
            background: #ffffff;
          }

          .page-break { page-break-after: always; break-after: page; }

          /* HEADER */
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          h1 { color: #1e40af; font-size: 32px; margin-bottom: 10px; }
          .fecha-generacion { color: #6b7280; font-size: 14px; margin-top: 8px; }
          .generado-por { color: #059669; font-size: 16px; font-weight: 600; margin-top: 12px; }

          /* ← FIX FINAL: texto oscuro sobre blanco — expo-print siempre renderiza esto */
          .resumen {
            border: 2px solid #1e40af;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
          }
          .resumen h2 {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
            color: #1e40af;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .stat-card {
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            border: 1px solid #e5e7eb;
          }
          .stat-card-total    { border-left: 4px solid #1e40af; }
          .stat-card-pend     { border-left: 4px solid #FFA726; }
          .stat-card-proceso  { border-left: 4px solid #42A5F5; }
          .stat-card-resuelto { border-left: 4px solid #66BB6A; }

          .stat-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .stat-value         { font-size: 36px; font-weight: bold; color: #1f2937; }
          .stat-value-total   { color: #1e40af; }
          .stat-value-pend    { color: #F59E0B; }
          .stat-value-proceso { color: #3B82F6; }
          .stat-value-resuelto{ color: #22C55E; }

          /* GRÁFICOS */
          .pagina-graficos {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
          }
          .pagina-graficos h2 {
            color: #1e40af;
            font-size: 28px;
            margin-bottom: 60px;
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 15px;
            width: 100%;
          }
          .graficos-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
            align-items: center;
            width: 100%;
          }
          .grafico-wrapper { display: flex; justify-content: center; align-items: center; }

          /* DETALLE */
          .detalle { margin-top: 40px; }
          .detalle h2 {
            color: #1e40af;
            font-size: 24px;
            margin-bottom: 20px;
            border-left: 4px solid #3b82f6;
            padding-left: 12px;
          }

          /* TABLA */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          thead { background: #1e40af; color: white; }
          th { padding: 16px 12px; text-align: left; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          tr:last-child td { border-bottom: none; }
          tbody tr:nth-child(even) { background-color: #f9fafb; }

          /* BADGES */
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
          }
          .estado-pendiente   { background: #FEF3C7; color: #92400e; }
          .estado-en-proceso  { background: #DBEAFE; color: #1e40af; }
          .estado-resuelto    { background: #D1FAE5; color: #065f46; }
          .prioridad-alta     { background: #FEE2E2; color: #991b1b; }
          .prioridad-media    { background: #FED7AA; color: #9a3412; }
          .prioridad-baja     { background: #E0E7FF; color: #3730a3; }
          /* ← FIX: badge para "no asignada" */
          .prioridad-no-asignada { background: #F3F4F6; color: #6b7280; }

          .descripcion { max-width: 400px; font-size: 12px; color: #4b5563; line-height: 1.4; }

          /* FOOTER */
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .no-data { text-align: center; padding: 40px; color: #6b7280; font-style: italic; }

          @media print {
            body { padding: 20px; }
            .stat-card { break-inside: avoid; }
            tr { break-inside: avoid; }
            .page-break { page-break-after: always; }
          }
        </style>
      </head>
      <body>

        <!-- ENCABEZADO -->
        <div class="header">
          <h1>📊 ${tituloPDF}</h1>
          <p class="fecha-generacion">Generado el ${fechaGeneracion}</p>
          ${nombreGenerador ? `
            <p class="generado-por">
              👤 Generado por: ${nombreGenerador} ${puestoGenerador ? `(${puestoGenerador})` : ''}
            </p>
          ` : ''}
        </div>

        <!-- RESUMEN EJECUTIVO — 100% inline styles, sin CSS externo -->
        <div style="border:2px solid #1e40af; border-radius:12px; padding:24px; margin-bottom:32px;">
          <h2 style="font-size:22px; font-weight:bold; color:#1e40af; text-align:center; margin-bottom:20px; margin-top:0;">
            Resumen Ejecutivo
          </h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="width:25%; text-align:center; padding:16px 8px; border:1px solid #e5e7eb; border-left:4px solid #1e40af;">
                <p style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 8px 0;">Total</p>
                <p style="font-size:32px; font-weight:bold; color:#1e40af; margin:0;">${stats.total}</p>
              </td>
              <td style="width:25%; text-align:center; padding:16px 8px; border:1px solid #e5e7eb; border-left:4px solid #F59E0B;">
                <p style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 8px 0;">Pendientes</p>
                <p style="font-size:32px; font-weight:bold; color:#F59E0B; margin:0;">${stats.pendientes}</p>
              </td>
              <td style="width:25%; text-align:center; padding:16px 8px; border:1px solid #e5e7eb; border-left:4px solid #3B82F6;">
                <p style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 8px 0;">En Proceso</p>
                <p style="font-size:32px; font-weight:bold; color:#3B82F6; margin:0;">${stats.enProceso}</p>
              </td>
              <td style="width:25%; text-align:center; padding:16px 8px; border:1px solid #e5e7eb; border-left:4px solid #22C55E;">
                <p style="font-size:11px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 8px 0;">Resueltos</p>
                <p style="font-size:32px; font-weight:bold; color:#22C55E; margin:0;">${stats.resueltos}</p>
              </td>
            </tr>
          </table>
        </div>

        <!-- DETALLE DE REPORTES -->
        <div class="detalle">
          <h2>Detalle de Reportes</h2>
          ${reportes.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Fecha</th>
                  ${opciones.incluirUsuario !== false ? '<th>Usuario</th>' : ''}
                  ${opciones.incluirEmpleado !== false ? '<th>Asignado a</th>' : ''}
                  ${opciones.incluirDescripcion ? '<th>Descripción</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${reportes.map(r => {
                  const fecha = new Date(r.fecReporte)
                  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })
                  const estadoNormalizado = r.estReporte?.toLowerCase().replace(/\s+/g, '-') || 'default'
                  // ← FIX: normalizar prioridad incluyendo "no asignada"
                  const prioridadNormalizada = r.prioReporte?.toLowerCase().replace(/\s+/g, '-') || 'no-asignada'
                  const nombreUsuario  = r.usuario  ? `${r.usuario.nomUser} ${r.usuario.apeUser}`   : 'N/A'
                  const nombreEmpleado = r.empleado ? `${r.empleado.nomEmpl} ${r.empleado.apeEmpl}` : 'Sin asignar'
                  const descripcion = r.descriReporte
                    ? (r.descriReporte.length > 100 ? r.descriReporte.substring(0, 100) + '...' : r.descriReporte)
                    : 'Sin descripción'

                  return `
                    <tr>
                      <td><strong>#${r.idReporte}</strong></td>
                      <td><span class="badge estado-${estadoNormalizado}">${r.estReporte}</span></td>
                      <td><span class="badge prioridad-${prioridadNormalizada}">${r.prioReporte || 'No asignada'}</span></td>
                      <td>${fechaFormateada}</td>
                      ${opciones.incluirUsuario   !== false ? `<td>${nombreUsuario}</td>`   : ''}
                      ${opciones.incluirEmpleado  !== false ? `<td>${nombreEmpleado}</td>`  : ''}
                      ${opciones.incluirDescripcion ? `<td class="descripcion">${descripcion}</td>` : ''}
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          ` : `<div class="no-data">No hay reportes disponibles para mostrar</div>`}
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <p>Informe generado automáticamente | Total de reportes: ${stats.total}</p>
          ${nombreGenerador ? `<p>Generado por: ${nombreGenerador} ${puestoGenerador ? `(${puestoGenerador})` : ''}</p>` : ''}
          <p>© ${new Date().getFullYear()} - Sistema de Gestión de Reportes</p>
        </div>

        <div class="page-break"></div>

        <!-- PÁGINA 2: GRÁFICOS -->
        ${opciones.mostrarGraficos !== false ? `
          <div class="pagina-graficos">
            <h2>📈 Análisis Estadístico</h2>
            <div class="graficos-container">
              <div class="grafico-wrapper">${graficoSVG}</div>
              <div class="grafico-wrapper">${graficoBarras}</div>
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `

    const { uri } = await Print.printToFileAsync({ html, base64: false })
    const nombreArchivo  = construirNombreArchivo(nombreGenerador)
    const uriConNombre   = await renombrarArchivoPDF(uri, nombreArchivo)
    const canShare       = await Sharing.isAvailableAsync()

    if (canShare) {
      await Sharing.shareAsync(uriConNombre, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir Informe de Reportes',
        UTI: 'com.adobe.pdf'
      })
    } else {
      Alert.alert('Compartir no disponible', 'No se puede compartir el archivo en este dispositivo')
    }

    return uriConNombre

  } catch (error) {
    console.error('Error al generar PDF:', error)
    Alert.alert('Error', 'No se pudo generar el PDF. Por favor, intenta nuevamente.')
    throw error
  }
}

// ============================================
// FUNCIONES AUXILIARES PRE-CONFIGURADAS
// ============================================

export async function generarPDFPorEstado(reportes: Reporte[], estado: string, nombreGenerador?: string) {
  const reportesFiltrados = reportes.filter(r => r.estReporte.toLowerCase() === estado.toLowerCase())
  return generarPDF(reportesFiltrados, {
    titulo: `Reportes ${estado.charAt(0).toUpperCase() + estado.slice(1)}`,
    mostrarGraficos: true,
    nombreGenerador
  })
}

export async function generarPDFPorFechas(reportes: Reporte[], fechaInicio: Date, fechaFin: Date, nombreGenerador?: string) {
  const inicio = new Date(fechaInicio); inicio.setHours(0, 0, 0, 0)
  const fin    = new Date(fechaFin);    fin.setHours(23, 59, 59, 999)
  const reportesFiltrados = reportes.filter(r => {
    const fecha = new Date(r.fecReporte)
    return fecha >= inicio && fecha <= fin
  })
  const rangoTexto = `${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}`
  return generarPDF(reportesFiltrados, { titulo: `Reportes del ${rangoTexto}`, mostrarGraficos: true, nombreGenerador })
}

export async function generarPDFPorEmpleado(reportes: Reporte[], idEmpl: string, nombreGenerador?: string) {
  const reportesFiltrados = reportes.filter(r => r.idEmpl === idEmpl)
  const nombreEmpleado = reportesFiltrados[0]?.empleado
    ? `${reportesFiltrados[0].empleado.nomEmpl} ${reportesFiltrados[0].empleado.apeEmpl}`
    : 'Empleado Desconocido'
  return generarPDF(reportesFiltrados, { titulo: `Reportes de ${nombreEmpleado}`, incluirEmpleado: false, mostrarGraficos: true, nombreGenerador })
}

export async function generarPDFPorUsuario(reportes: Reporte[], idUser: string, nombreGenerador?: string) {
  const reportesFiltrados = reportes.filter(r => r.idUser === idUser)
  const nombreUsuario = reportesFiltrados[0]?.usuario
    ? `${reportesFiltrados[0].usuario.nomUser} ${reportesFiltrados[0].usuario.apeUser}`
    : 'Usuario Desconocido'
  return generarPDF(reportesFiltrados, { titulo: `Reportes de ${nombreUsuario}`, incluirUsuario: false, mostrarGraficos: true, nombreGenerador })
}

export async function generarPDFDetallado(reportes: Reporte[], nombreGenerador?: string) {
  return generarPDF(reportes, {
    titulo: 'Informe Detallado de Reportes',
    incluirDescripcion: true,
    incluirUsuario: true,
    incluirEmpleado: true,
    mostrarGraficos: true,
    nombreGenerador
  })
}
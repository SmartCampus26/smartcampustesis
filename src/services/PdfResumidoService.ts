/**
 * PdfResumidoService.ts
 *
 * Genera el HTML del PDF Resumido para la autoridad y lo descarga al dispositivo.
 *
 * Contenido del PDF:
 *  - Encabezado con título, fecha y generador
 *  - Resumen ejecutivo global (5 stats: total, pendientes, en proceso, resueltos, empleados)
 *  - Tabla de empleados con columnas: nombre, cargo, departamento, total, pendientes,
 *    en proceso, resueltos
 *  - Página final con gráfico de pastel global por estado y gráfico de barras por prioridad
 *
 * NO usa expo-sharing. El PDF se guarda directamente en documentDirectory.
 *
 * Ubicación: src/components/ (capa de componente/presentación)
 */

import * as Print from 'expo-print'
import * as FileSystem from 'expo-file-system/legacy'
import { guardarEnDescargas } from './DescargaPdfUtil'
import { Reporte } from '../types/Database'
import { DatosPdfResumido } from './PdfDepartamentalService'

// ─── Gráfico SVG: Pastel global por estado ────────────────────────────────────

/**
 * Genera el gráfico de pastel SVG para la distribución global por estado.
 * Mismo estilo que PdfService.ts para consistencia visual.
 */
function generarPieSVG(stats: {
  pendientes: number
  enProceso: number
  resueltos: number
}): string {
  const datos = [
    { label: 'Pendientes', valor: stats.pendientes, color: '#FFA726' },
    { label: 'En Proceso', valor: stats.enProceso,  color: '#42A5F5' },
    { label: 'Resueltos',  valor: stats.resueltos,  color: '#66BB6A' },
  ]
  const total = datos.reduce((s, d) => s + d.valor, 0)
  const cx = 150, cy = 150, r = 120

  if (total === 0) {
    return `<svg width="300" height="420" viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg">
      <text x="150" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">Distribución por Estado</text>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#e5e7eb"/>
      <text x="150" y="155" text-anchor="middle" fill="#6b7280" font-size="16" font-family="sans-serif">Sin datos</text>
    </svg>`
  }

  const conValor = datos.filter(d => d.valor > 0)
  let segs = '', pcts = ''

  if (conValor.length === 1) {
    segs = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${conValor[0].color}" stroke="white" stroke-width="2"/>`
  } else {
    let ang = -Math.PI / 2
    segs = conValor.map(d => {
      const prop = d.valor / total
      const arco = prop * 2 * Math.PI
      const x1 = cx + r * Math.cos(ang); const y1 = cy + r * Math.sin(ang)
      ang += arco
      const x2 = cx + r * Math.cos(ang); const y2 = cy + r * Math.sin(ang)
      return `<path d="M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${arco > Math.PI ? 1 : 0} 1 ${x2} ${y2}Z" fill="${d.color}" stroke="white" stroke-width="2"/>`
    }).join('')

    let ang2 = -Math.PI / 2
    pcts = conValor.map(d => {
      const prop = d.valor / total; const arco = prop * 2 * Math.PI
      ang2 += arco
      const m = ang2 - arco / 2; const pct = Math.round(prop * 100)
      if (pct <= 5) return ''
      return `<text x="${cx + r * 0.6 * Math.cos(m)}" y="${cy + r * 0.6 * Math.sin(m)}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="bold" font-family="sans-serif" fill="white">${pct}%</text>`
    }).join('')
  }

  const leyenda = datos.map((d, i) => {
    const pct = total > 0 ? Math.round((d.valor / total) * 100) : 0
    const y = 330 + i * 28
    return `<rect x="30" y="${y}" width="16" height="16" rx="3" fill="${d.color}" opacity="${d.valor > 0 ? 1 : 0.3}"/>
      <text x="52" y="${y + 13}" font-size="14" font-family="sans-serif" fill="${d.valor > 0 ? '#374151' : '#9ca3af'}">${d.label}: ${d.valor} (${pct}%)</text>`
  }).join('')

  return `<svg width="300" height="420" viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg">
    <text x="150" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">Distribución por Estado</text>
    ${segs}${pcts}
    <circle cx="${cx}" cy="${cy}" r="35" fill="white"/>
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="11" font-family="sans-serif" fill="#6b7280">Total</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1f2937">${total}</text>
    ${leyenda}
  </svg>`
}

// ─── Gráfico SVG: Barras por prioridad ───────────────────────────────────────

/**
 * Genera el gráfico de barras SVG por prioridad.
 * Mismo estilo que PdfService.ts para consistencia visual.
 */
function generarBarrasSVG(reportes: Reporte[]): string {
  const c = {
    alta:  reportes.filter(r => r.prioReporte?.toLowerCase() === 'alta').length,
    media: reportes.filter(r => r.prioReporte?.toLowerCase() === 'media').length,
    baja:  reportes.filter(r => r.prioReporte?.toLowerCase() === 'baja').length,
  }
  const maxV = Math.max(c.alta, c.media, c.baja, 1)
  const hMax = 200

  return `<svg width="400" height="350" viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">Distribución por Prioridad</text>
    <rect x="40"  y="${280 - c.alta  / maxV * hMax}" width="80" height="${c.alta  / maxV * hMax}" fill="#EF4444" rx="4"/>
    <text x="80"  y="${270 - c.alta  / maxV * hMax}" text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">${c.alta}</text>
    <text x="80"  y="305" text-anchor="middle" font-size="14" fill="#374151">Alta</text>
    <rect x="160" y="${280 - c.media / maxV * hMax}" width="80" height="${c.media / maxV * hMax}" fill="#F59E0B" rx="4"/>
    <text x="200" y="${270 - c.media / maxV * hMax}" text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">${c.media}</text>
    <text x="200" y="305" text-anchor="middle" font-size="14" fill="#374151">Media</text>
    <rect x="280" y="${280 - c.baja  / maxV * hMax}" width="80" height="${c.baja  / maxV * hMax}" fill="#6366F1" rx="4"/>
    <text x="320" y="${270 - c.baja  / maxV * hMax}" text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">${c.baja}</text>
    <text x="320" y="305" text-anchor="middle" font-size="14" fill="#374151">Baja</text>
  </svg>`
}

// ─── Generador de HTML ────────────────────────────────────────────────────────

/**
 * Construye el HTML completo del PDF Resumido.
 *
 * Estructura:
 *  Página 1 — Encabezado + Resumen ejecutivo + Tabla de empleados
 *  Página 2 — Gráfico de pastel global + Gráfico de barras por prioridad
 *
 * @param datos - Datos del PDF Resumido de cargarDatosPdfResumido()
 * @returns String HTML listo para expo-print
 */
export function generarHTMLPdfResumido(datos: DatosPdfResumido): string {
  const { nombreGenerador, puestoGenerador, tituloPdf, statsGlobales, filas, todosLosReportes } = datos

  const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // Filas de la tabla de empleados
  const filasTabla = filas.map(f => {
    const deptCapital = f.departamento.charAt(0).toUpperCase() + f.departamento.slice(1)
    const cargoCapital = f.cargo.charAt(0).toUpperCase() + f.cargo.slice(1)
    // Barra de progreso visual: resueltos / total
    const pctResuelto = f.stats.total > 0 ? Math.round((f.stats.resueltos / f.stats.total) * 100) : 0

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:50%; background:#1e40af; color:white;
              font-weight:bold; font-size:14px; text-align:center; line-height:34px; flex-shrink:0;">
              ${f.nombreCompleto.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>${f.nombreCompleto}</strong>
              <div style="font-size:11px; color:#6b7280;">${cargoCapital}</div>
            </div>
          </div>
        </td>
        <td style="text-transform:capitalize; font-size:13px;">${deptCapital}</td>
        <td style="text-align:center; font-size:20px; font-weight:bold; color:#1e40af;">${f.stats.total}</td>
        <td style="text-align:center;">
          <span style="background:#FEF3C7; color:#92400e; padding:3px 10px; border-radius:10px; font-size:12px; font-weight:600;">
            ${f.stats.pendientes}
          </span>
        </td>
        <td style="text-align:center;">
          <span style="background:#DBEAFE; color:#1e40af; padding:3px 10px; border-radius:10px; font-size:12px; font-weight:600;">
            ${f.stats.enProceso}
          </span>
        </td>
        <td style="text-align:center;">
          <span style="background:#D1FAE5; color:#065f46; padding:3px 10px; border-radius:10px; font-size:12px; font-weight:600;">
            ${f.stats.resueltos}
          </span>
        </td>
        <td style="text-align:center; min-width:80px;">
          <div style="background:#e5e7eb; border-radius:4px; height:8px; overflow:hidden;">
            <div style="background:#22C55E; height:8px; width:${pctResuelto}%;"></div>
          </div>
          <span style="font-size:11px; color:#6b7280;">${pctResuelto}%</span>
        </td>
      </tr>
    `
  }).join('')

  const pieGlobal    = generarPieSVG(statsGlobales)
  const barrasGlobal = generarBarrasSVG(todosLosReportes)

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${tituloPdf}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          padding: 24px 30px; color: #1f2937; background: #fff;
        }
        .page-break { page-break-after: always; break-after: page; }
        .header { text-align:center; margin-bottom:32px; border-bottom:3px solid #3b82f6; padding-bottom:18px; }
        .header h1 { color:#1e40af; font-size:26px; margin-bottom:8px; }
        .header .sub  { color:#6b7280; font-size:13px; margin-top:5px; }
        .header .gen  { color:#059669; font-size:14px; font-weight:600; margin-top:8px; }
        table { width:100%; border-collapse:collapse; margin-top:16px; border-radius:8px; overflow:hidden; }
        thead { background:#1e40af; color:white; }
        th { padding:12px 10px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
        td { padding:12px 10px; border-bottom:1px solid #e5e7eb; font-size:13px; vertical-align:middle; }
        tr:last-child td { border-bottom:none; }
        tbody tr:nth-child(even) { background:#f9fafb; }
        .seccion-titulo { color:#1e40af; font-size:17px; margin-bottom:12px; border-left:4px solid #3b82f6; padding-left:10px; font-weight:bold; }
        .pagina-graficos { display:flex; flex-direction:column; align-items:center; padding:20px 0; }
        .pagina-graficos h2 { color:#1e40af; font-size:22px; margin-bottom:36px; border-bottom:3px solid #3b82f6; padding-bottom:12px; width:100%; text-align:center; }
        .footer { margin-top:40px; padding-top:14px; border-top:2px solid #e5e7eb; text-align:center; color:#6b7280; font-size:11px; }
        @media print { body { padding:16px 20px; } tr { page-break-inside:avoid; break-inside:avoid; } }
      </style>
    </head>
    <body>

      <!-- ENCABEZADO -->
      <div class="header">
        <h1>📋 ${tituloPdf}</h1>
        <p class="sub">Generado el ${fechaGeneracion}</p>
        ${nombreGenerador
          ? `<p class="gen">👤 ${nombreGenerador}${puestoGenerador ? ` (${puestoGenerador})` : ''}</p>`
          : ''}
      </div>

      <!-- RESUMEN EJECUTIVO GLOBAL (inline styles para expo-print) -->
      <div style="border:2px solid #1e40af; border-radius:12px; padding:20px; margin-bottom:26px;">
        <h2 style="font-size:18px; font-weight:bold; color:#1e40af; text-align:center; margin-bottom:16px; margin-top:0;">
          Resumen Ejecutivo
        </h2>
        <table style="width:100%; border-collapse:collapse; box-shadow:none; border-radius:0;">
          <tr>
            <td style="width:20%; text-align:center; padding:12px 6px; border:1px solid #e5e7eb; border-left:4px solid #1e40af;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Total</p>
              <p style="font-size:26px; font-weight:bold; color:#1e40af; margin:0;">${statsGlobales.total}</p>
            </td>
            <td style="width:20%; text-align:center; padding:12px 6px; border:1px solid #e5e7eb; border-left:4px solid #F59E0B;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Pendientes</p>
              <p style="font-size:26px; font-weight:bold; color:#F59E0B; margin:0;">${statsGlobales.pendientes}</p>
            </td>
            <td style="width:20%; text-align:center; padding:12px 6px; border:1px solid #e5e7eb; border-left:4px solid #3B82F6;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">En Proceso</p>
              <p style="font-size:26px; font-weight:bold; color:#3B82F6; margin:0;">${statsGlobales.enProceso}</p>
            </td>
            <td style="width:20%; text-align:center; padding:12px 6px; border:1px solid #e5e7eb; border-left:4px solid #22C55E;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Resueltos</p>
              <p style="font-size:26px; font-weight:bold; color:#22C55E; margin:0;">${statsGlobales.resueltos}</p>
            </td>
            <td style="width:20%; text-align:center; padding:12px 6px; border:1px solid #e5e7eb; border-left:4px solid #8B5CF6;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Colaboradores</p>
              <p style="font-size:26px; font-weight:bold; color:#8B5CF6; margin:0;">${statsGlobales.totalEmpleados}</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- TABLA DE EMPLEADOS -->
      <!-- Subtítulo separador — fluye sin salto de página -->
      <div style="margin-top:32px; margin-bottom:18px; border-bottom:3px solid #3b82f6; padding-bottom:14px;">
        <h2 style="font-size:22px; font-weight:bold; color:#1e40af; margin:0 0 6px 0;">
          Desempeño por Colaborador
        </h2>
        <p style="font-size:13px; color:#6b7280; margin:0;">
          Resumen de reportes asignados, en proceso y resueltos por cada colaborador
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Departamento</th>
            <th style="text-align:center;">Total</th>
            <th style="text-align:center;">Pendientes</th>
            <th style="text-align:center;">En Proceso</th>
            <th style="text-align:center;">Resueltos</th>
            <th style="text-align:center;">% Resuelto</th>
          </tr>
        </thead>
        <tbody>
          ${filasTabla || `<tr><td colspan="7" style="text-align:center; color:#9ca3af; padding:20px;">Sin colaboradores</td></tr>`}
        </tbody>
      </table>

      <!-- FOOTER PÁGINA 1 -->
      <div class="footer">
        <p>Total reportes: ${statsGlobales.total} · Colaboradores: ${statsGlobales.totalEmpleados}</p>
        ${nombreGenerador ? `<p>Generado por: ${nombreGenerador}</p>` : ''}
        <p>© ${new Date().getFullYear()} — Sistema de Gestión de Reportes</p>
      </div>

      <!-- PÁGINA 2: ANÁLISIS ESTADÍSTICO GLOBAL -->
      <div style="page-break-before:always;"></div>
      <div class="pagina-graficos">
        <h2>📈 Análisis Estadístico Global</h2>
        <div>${pieGlobal}</div>
        <div style="margin-top:24px;">${barrasGlobal}</div>
      </div>

    </body>
    </html>
  `
}

// ─── Descarga directa al dispositivo ─────────────────────────────────────────

/**
 * Genera el PDF Resumido y lo guarda directamente en el dispositivo.
 * NO usa expo-sharing. Retorna la URI del archivo guardado.
 *
 * @param datos - Datos del PDF Resumido de cargarDatosPdfResumido()
 * @returns URI del archivo PDF guardado, o undefined si hubo error
 */
export async function generarYDescargarPdfResumido(
  datos: DatosPdfResumido
): Promise<string | undefined> {
  try {
    if (datos.filas.length === 0) {
      throw new Error('No hay colaboradores para generar el informe')
    }

    const html = generarHTMLPdfResumido(datos)
    const { uri: uriTemporal } = await Print.printToFileAsync({ html, base64: false })

    const fecha      = new Date().toISOString().split('T')[0]
    const deptLabel  = datos.filtroDepartamento === 'todos' ? 'todos' : datos.filtroDepartamento
    const genLimpio  = datos.nombreGenerador
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]/g, '').trim().replace(/\s+/g, '_')
    const nombreArchivo = `informe_resumido_${deptLabel}_${fecha}_${genLimpio}.pdf`

    // Guardar en carpeta Descargas real del dispositivo
    // En Android usa StorageAccessFramework (pide permiso al usuario)
    // En iOS guarda en documentDirectory (visible desde app Archivos)
    const uriDestino = await guardarEnDescargas(uriTemporal, nombreArchivo)

    return uriDestino
  } catch (error) {
    console.error('Error al generar PDF Resumido:', error)
    throw error
  }
}
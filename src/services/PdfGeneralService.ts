/**
 * PdfGeneralService.ts
 *
 * Componente helper encargado de:
 *  1. Generar el HTML completo del PDF General Departamental
 *  2. Renderizarlo con expo-print
 *  3. Guardarlo en el dispositivo con expo-file-system (descarga directa)
 *
 * NO usa expo-sharing — el archivo se descarga directamente al dispositivo.
 *
 * Sigue el mismo patrón de PdfService.ts (capa de componente/presentación).
 * Los gráficos SVG se generan inline igual que en PdfService.ts.
 *
 * Flujo de uso desde la UI:
 *  1. Llamar cargarDatosPdfDepartamental() de PdfDepartamentalService
 *  2. Pasar el resultado a generarYDescargarPdfGeneral()
 *  3. La función retorna la URI del archivo guardado
 *
 * Ubicación: src/components/ (capa de componente/presentación)
 */

import * as Print from 'expo-print'
import * as FileSystem from 'expo-file-system/legacy'
import { guardarEnDescargas } from './DescargaPdfUtil'
import { Reporte } from '../types/Database'
import { DatosPdfGeneral, GrupoEmpleado } from './PdfDepartamentalService'

// ─── Gráfico SVG: Pastel compacto por empleado ───────────────────────────────

/**
 * Genera un gráfico de pastel SVG compacto para las estadísticas de un empleado.
 * Versión reducida del generarGraficoPieSVG() de PdfService.ts,
 * optimizada para caber en las secciones individuales del PDF.
 *
 * @param stats - Estadísticas del empleado
 * @param tamanio - Dimensión del SVG en píxeles (default 180)
 * @returns String SVG listo para insertar en HTML
 */
function generarPieSVGCompacto(
  stats: { pendientes: number; enProceso: number; resueltos: number },
  tamanio = 180
): string {
  const datos = [
    { label: 'Pendientes', valor: stats.pendientes, color: '#FFA726' },
    { label: 'En Proceso', valor: stats.enProceso,  color: '#42A5F5' },
    { label: 'Resueltos',  valor: stats.resueltos,  color: '#66BB6A' },
  ]

  const total = datos.reduce((s, d) => s + d.valor, 0)
  const cx    = tamanio / 2
  const cy    = tamanio / 2
  const radio = tamanio * 0.38

  if (total === 0) {
    return `<svg width="${tamanio}" height="${tamanio}" viewBox="0 0 ${tamanio} ${tamanio}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${radio}" fill="#e5e7eb"/>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="12" fill="#9ca3af" font-family="sans-serif">Sin datos</text>
    </svg>`
  }

  const conValor = datos.filter(d => d.valor > 0)
  let segmentos = ''

  if (conValor.length === 1) {
    segmentos = `<circle cx="${cx}" cy="${cy}" r="${radio}" fill="${conValor[0].color}"/>`
  } else {
    let angulo = -Math.PI / 2
    segmentos = conValor.map(d => {
      const prop = d.valor / total
      const arco = prop * 2 * Math.PI
      const x1   = cx + radio * Math.cos(angulo)
      const y1   = cy + radio * Math.sin(angulo)
      angulo    += arco
      const x2   = cx + radio * Math.cos(angulo)
      const y2   = cy + radio * Math.sin(angulo)
      const large = arco > Math.PI ? 1 : 0
      return `<path d="M${cx} ${cy} L${x1} ${y1} A${radio} ${radio} 0 ${large} 1 ${x2} ${y2}Z" fill="${d.color}" stroke="white" stroke-width="1.5"/>`
    }).join('')
  }

  // Agujero central con el total
  const hoyo = `
    <circle cx="${cx}" cy="${cy}" r="${radio * 0.33}" fill="white"/>
    <text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="9" fill="#6b7280" font-family="sans-serif">Total</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="13" font-weight="bold" fill="#1f2937" font-family="sans-serif">${total}</text>
  `

  return `<svg width="${tamanio}" height="${tamanio}" viewBox="0 0 ${tamanio} ${tamanio}" xmlns="http://www.w3.org/2000/svg">
    ${segmentos}${hoyo}
  </svg>`
}

// ─── Gráfico SVG: Barras de prioridad compactas por empleado ─────────────────

/**
 * Genera un gráfico de barras SVG compacto por prioridad.
 * Versión reducida de generarGraficoBarrasPrioridad() de PdfService.ts.
 *
 * @param reportes - Lista de reportes del empleado
 * @returns String SVG listo para insertar en HTML
 */
function generarBarrasPrioridadCompacto(reportes: Reporte[]): string {
  const conteo = {
    alta:  reportes.filter(r => r.prioReporte?.toLowerCase() === 'alta').length,
    media: reportes.filter(r => r.prioReporte?.toLowerCase() === 'media').length,
    baja:  reportes.filter(r => r.prioReporte?.toLowerCase() === 'baja').length,
  }
  const maxV = Math.max(conteo.alta, conteo.media, conteo.baja, 1)
  const hMax = 80

  const barra = (x: number, valor: number, color: string, label: string) => {
    const h = Math.max((valor / maxV) * hMax, valor > 0 ? 4 : 0)
    const y = 100 - h
    return `
      <rect x="${x}" y="${y}" width="40" height="${h}" fill="${color}" rx="3"/>
      <text x="${x + 20}" y="${y - 5}" text-anchor="middle" font-size="11" font-weight="bold" fill="#1f2937" font-family="sans-serif">${valor}</text>
      <text x="${x + 20}" y="116" text-anchor="middle" font-size="10" fill="#374151" font-family="sans-serif">${label}</text>
    `
  }

  return `<svg width="190" height="130" viewBox="0 0 190 130" xmlns="http://www.w3.org/2000/svg">
    ${barra(15,  conteo.alta,  '#EF4444', 'Alta')}
    ${barra(75,  conteo.media, '#F59E0B', 'Media')}
    ${barra(135, conteo.baja,  '#6366F1', 'Baja')}
  </svg>`
}

// ─── Gráfico SVG: Pastel global (página de análisis) ─────────────────────────

/**
 * Genera el gráfico de pastel global a tamaño completo.
 * Equivalente a generarGraficoPieSVG() de PdfService.ts,
 * adaptado para recibir statsGlobales directamente.
 *
 * @param stats - Estadísticas globales del informe
 * @returns String SVG listo para insertar en HTML
 */
function generarPieGlobalSVG(stats: {
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
  const cx = 150, cy = 150, radio = 120

  if (total === 0) {
    return `<svg width="300" height="420" viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg">
      <text x="150" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">Distribución Global por Estado</text>
      <circle cx="${cx}" cy="${cy}" r="${radio}" fill="#e5e7eb"/>
      <text x="150" y="155" text-anchor="middle" fill="#6b7280" font-size="16" font-family="sans-serif">Sin datos</text>
    </svg>`
  }

  const conValor = datos.filter(d => d.valor > 0)
  let segmentos = ''
  let porcentajes = ''

  if (conValor.length === 1) {
    segmentos = `<circle cx="${cx}" cy="${cy}" r="${radio}" fill="${conValor[0].color}" stroke="white" stroke-width="2"/>`
  } else {
    let ang = -Math.PI / 2
    segmentos = conValor.map(d => {
      const prop  = d.valor / total
      const arco  = prop * 2 * Math.PI
      const x1    = cx + radio * Math.cos(ang)
      const y1    = cy + radio * Math.sin(ang)
      ang        += arco
      const x2    = cx + radio * Math.cos(ang)
      const y2    = cy + radio * Math.sin(ang)
      const large = arco > Math.PI ? 1 : 0
      return `<path d="M${cx} ${cy} L${x1} ${y1} A${radio} ${radio} 0 ${large} 1 ${x2} ${y2}Z" fill="${d.color}" stroke="white" stroke-width="2"/>`
    }).join('')

    let ang2 = -Math.PI / 2
    porcentajes = conValor.map(d => {
      const prop = d.valor / total
      const arco = prop * 2 * Math.PI
      ang2      += arco
      const medio = ang2 - arco / 2
      const pct = Math.round(prop * 100)
      if (pct <= 5) return ''
      const lx = cx + radio * 0.6 * Math.cos(medio)
      const ly = cy + radio * 0.6 * Math.sin(medio)
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="bold" font-family="sans-serif" fill="white">${pct}%</text>`
    }).join('')
  }

  const leyenda = datos.map((d, i) => {
    const pct = total > 0 ? Math.round((d.valor / total) * 100) : 0
    const y   = 330 + i * 28
    return `
      <rect x="30" y="${y}" width="16" height="16" rx="3" fill="${d.color}" opacity="${d.valor > 0 ? 1 : 0.3}"/>
      <text x="52" y="${y + 13}" font-size="14" font-family="sans-serif" fill="${d.valor > 0 ? '#374151' : '#9ca3af'}">${d.label}: ${d.valor} (${pct}%)</text>
    `
  }).join('')

  const hoyo = `
    <circle cx="${cx}" cy="${cy}" r="35" fill="white"/>
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="11" font-family="sans-serif" fill="#6b7280">Total</text>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1f2937">${total}</text>
  `

  return `<svg width="300" height="420" viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg">
    <text x="150" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">Distribución Global por Estado</text>
    ${segmentos}${porcentajes}${hoyo}${leyenda}
  </svg>`
}

// ─── Gráfico SVG: Barras globales por prioridad ───────────────────────────────

/**
 * Gráfico de barras global por prioridad, equivalente al de PdfService.ts
 * pero tomando todos los reportes del informe departamental.
 *
 * @param reportes - Todos los reportes del informe
 * @returns String SVG listo para insertar en HTML
 */
function generarBarrasGlobalSVG(reportes: Reporte[]): string {
  const conteo = {
    alta:  reportes.filter(r => r.prioReporte?.toLowerCase() === 'alta').length,
    media: reportes.filter(r => r.prioReporte?.toLowerCase() === 'media').length,
    baja:  reportes.filter(r => r.prioReporte?.toLowerCase() === 'baja').length,
  }

  const maxValor       = Math.max(conteo.alta, conteo.media, conteo.baja, 1)
  const alturaMaxBarra = 200

  return `
    <svg width="400" height="350" viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
      <text x="200" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">
        Distribución Global por Prioridad
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

// ─── Constructor de nombre de archivo ────────────────────────────────────────

/**
 * Construye el nombre del archivo PDF con fecha y nombre del generador.
 * Mismo patrón que construirNombreArchivo() de PdfService.ts.
 *
 * @param nombreGenerador - Nombre de quien genera el PDF
 * @param departamento - Departamento incluido en el nombre
 * @returns Nombre de archivo seguro para el sistema de archivos
 */
function construirNombreArchivoGeneral(nombreGenerador: string, departamento: string): string {
  const fecha      = new Date().toISOString().split('T')[0]
  const nombreLimpio = (nombreGenerador || 'Sistema')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
  const deptLimpio = departamento
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase()
  return `informe_general_${deptLimpio}_${fecha}_${nombreLimpio}.pdf`
}

// ─── Generador de HTML principal ─────────────────────────────────────────────

/**
 * Construye el HTML completo del PDF General Departamental.
 *
 * Estructura del PDF:
 *  Página 1 — Portada + Resumen ejecutivo global + Tabla resumen de empleados
 *  Páginas 2..N — Una sección por empleado con mini-gráficos y tabla de reportes
 *  Página final — Análisis estadístico global (gráfico pie + gráfico barras)
 *
 * @param datos - Datos organizados por cargarDatosPdfDepartamental()
 * @returns String HTML completo listo para expo-print
 */
export function generarHTMLPdfGeneral(datos: DatosPdfGeneral): string {
  const {
    nombreGenerador, puestoGenerador, tituloPdf,
    statsGlobales, grupos, todosLosReportes, todosLosEmpleados,
  } = datos

  const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // ── Tabla resumen: TODOS los empleados del depto (incluso sin reportes) ──────
  // grupos solo tiene los que tienen reportes (para secciones individuales)
  // todosLosEmpleados incluye a todos para la tabla de la página 1
  const filasResumen = datos.todosLosEmpleados.map(g => `
    <tr>
      <td><strong>${g.nombreCompleto}</strong></td>
      <td>${g.cargo}</td>
      <td style="text-transform:capitalize;">${g.departamento}</td>
      <td style="text-align:center; font-weight:bold; color:#1e40af;">${g.stats.total}</td>
      <td style="text-align:center; color:#F59E0B;">${g.stats.pendientes}</td>
      <td style="text-align:center; color:#3B82F6;">${g.stats.enProceso}</td>
      <td style="text-align:center; color:#22C55E;">${g.stats.resueltos}</td>
    </tr>
  `).join('')

  // ── Secciones individuales por empleado ────────────────────────────────────
  const seccionesEmpleados = grupos.map((grupo, idx) => {
    const pieSVG    = generarPieSVGCompacto(grupo.stats)
    const barrasSVG = generarBarrasPrioridadCompacto(grupo.reportes)

    const filasReportes = grupo.reportes.map(r => {
      const fecha    = new Date(r.fecReporte).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
      const estNorm  = r.estReporte?.toLowerCase().replace(/\s+/g, '-') || 'default'
      const prioNorm = r.prioReporte?.toLowerCase().replace(/\s+/g, '-') || 'no-asignada'
      const usuario  = r.usuario
        ? `${r.usuario.nomUser} ${r.usuario.apeUser}`
        : 'N/A'
      const desc = r.descriReporte
        ? (r.descriReporte.length > 90 ? r.descriReporte.substring(0, 90) + '…' : r.descriReporte)
        : 'Sin descripción'

      return `
        <tr>
          <td><strong>#${r.idReporte}</strong></td>
          <td><span class="badge estado-${estNorm}">${r.estReporte}</span></td>
          <td><span class="badge prioridad-${prioNorm}">${r.prioReporte || 'No asignada'}</span></td>
          <td>${fecha}</td>
          <td>${usuario}</td>
          <td style="font-size:11px; color:#4b5563;">${desc}</td>
        </tr>
      `
    }).join('')

    // Salto de página antes de cada empleado excepto el primero
    const separador = idx > 0
      ? '<hr style="border:none; border-top:1px dashed #e5e7eb; margin:16px 0;" />'
      : ''

    return `
      ${separador}
      <div class="seccion-empleado">
        <div class="empleado-header">
          <div class="empleado-avatar">${grupo.nombreCompleto.charAt(0).toUpperCase()}</div>
          <div class="empleado-info">
            <h3 class="empleado-nombre">${grupo.nombreCompleto}</h3>
            <p class="empleado-cargo">${grupo.cargo} · <span style="text-transform:capitalize;">${grupo.departamento}</span></p>
          </div>
          <div class="empleado-badge-total">
            <span class="badge-num">${grupo.stats.total}</span>
            <span class="badge-label">reportes</span>
          </div>
        </div>

        <div class="empleado-graficos-row">
          <div class="mini-grafico-wrap">
            <p class="mini-titulo">Por Estado</p>
            ${pieSVG}
          </div>
          <div class="mini-grafico-wrap">
            <p class="mini-titulo">Por Prioridad</p>
            ${barrasSVG}
          </div>
          <div class="mini-stats-wrap">
            <div class="mini-stat" style="border-left:3px solid #F59E0B;">
              <span class="mini-stat-num" style="color:#F59E0B;">${grupo.stats.pendientes}</span>
              <span class="mini-stat-lbl">Pendientes</span>
            </div>
            <div class="mini-stat" style="border-left:3px solid #3B82F6;">
              <span class="mini-stat-num" style="color:#3B82F6;">${grupo.stats.enProceso}</span>
              <span class="mini-stat-lbl">En Proceso</span>
            </div>
            <div class="mini-stat" style="border-left:3px solid #22C55E;">
              <span class="mini-stat-num" style="color:#22C55E;">${grupo.stats.resueltos}</span>
              <span class="mini-stat-lbl">Resueltos</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Fecha</th>
              <th>Solicitado por</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            ${filasReportes || `<tr><td colspan="6" style="text-align:center; color:#9ca3af; padding:20px;">Sin reportes asignados</td></tr>`}
          </tbody>
        </table>
      </div>
    `
  }).join('')

  // ── Gráficos globales para la página final ─────────────────────────────────
  const pieGlobal    = generarPieGlobalSVG(statsGlobales)
  const barrasGlobal = generarBarrasGlobalSVG(todosLosReportes)

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${tituloPdf}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 24px 30px;
          color: #1f2937;
          background: #ffffff;
        }

        /* ── Paginación optimizada ── */
        /* page-break-before evita páginas en blanco innecesarias */
        /* page-break inline en cada sección donde se necesita */
        /* avoid: mantiene encabezado+contenido juntos en la misma página */
        /* seccion-empleado fluye libremente sin restricciones de página */
        /* La tabla no se corta en medio de una fila */
        tr { page-break-inside: avoid; break-inside: avoid; }

        /* ── Encabezado principal ── */
        .header {
          text-align: center;
          margin-bottom: 36px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 18px;
        }
        .header h1 { color: #1e40af; font-size: 28px; margin-bottom: 8px; }
        .header .subtitulo { color: #6b7280; font-size: 13px; margin-top: 6px; }
        .header .generador { color: #059669; font-size: 15px; font-weight: 600; margin-top: 10px; }

        /* ── Resumen ejecutivo global ── */
        .resumen-global {
          border: 2px solid #1e40af;
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 28px;
        }
        .resumen-global h2 {
          font-size: 20px;
          font-weight: bold;
          color: #1e40af;
          text-align: center;
          margin-bottom: 18px;
        }
        .stats-fila {
          display: flex;
          gap: 12px;
        }
        .stat-celda {
          flex: 1;
          text-align: center;
          padding: 14px 8px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .stat-lbl {
          font-size: 10px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .stat-num { font-size: 28px; font-weight: bold; }

        /* ── Tabla resumen de empleados ── */
        .seccion-titulo {
          color: #1e40af;
          font-size: 18px;
          margin-bottom: 14px;
          border-left: 4px solid #3b82f6;
          padding-left: 10px;
        }

        /* ── Tabla general ── */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        thead { background: #1e40af; color: white; }
        th { padding: 12px 10px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 11px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        tr:last-child td { border-bottom: none; }
        tbody tr:nth-child(even) { background-color: #f9fafb; }

        /* ── Badges de estado y prioridad ── */
        .badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .estado-pendiente   { background: #FEF3C7; color: #92400e; }
        .estado-en-proceso  { background: #DBEAFE; color: #1e40af; }
        .estado-resuelto    { background: #D1FAE5; color: #065f46; }
        .prioridad-alta     { background: #FEE2E2; color: #991b1b; }
        .prioridad-media    { background: #FED7AA; color: #9a3412; }
        .prioridad-baja     { background: #E0E7FF; color: #3730a3; }
        .prioridad-no-asignada { background: #F3F4F6; color: #6b7280; }

        /* ── Sección por empleado ── */
        .seccion-empleado { margin-top: 8px; }

        .empleado-header {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 10px;
          padding: 14px 18px;
          margin-bottom: 10px;
        }
        .empleado-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #1e40af;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          flex-shrink: 0;
          /* expo-print no soporta flexbox dentro de divs para centrado perfecto
             así que usamos line-height como fallback */
          line-height: 46px;
          text-align: center;
        }
        .empleado-info { flex: 1; }
        .empleado-nombre { font-size: 17px; font-weight: bold; color: #1e3a5f; }
        .empleado-cargo  { font-size: 13px; color: #6b7280; margin-top: 2px; }

        .empleado-badge-total {
          text-align: center;
          background: #1e40af;
          color: white;
          border-radius: 8px;
          padding: 8px 14px;
          flex-shrink: 0;
        }
        .badge-num   { display: block; font-size: 22px; font-weight: bold; }
        .badge-label { display: block; font-size: 10px; opacity: 0.85; }

        /* ── Mini gráficos por empleado ── */
        .empleado-graficos-row {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .mini-grafico-wrap {
          flex: 0 0 auto;
          text-align: center;
        }
        .mini-titulo {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .mini-stats-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: center;
          padding-top: 20px;
        }
        .mini-stat {
          padding: 8px 12px;
          background: #f9fafb;
          border-radius: 6px;
        }
        .mini-stat-num {
          display: block;
          font-size: 20px;
          font-weight: bold;
        }
        .mini-stat-lbl {
          font-size: 11px;
          color: #6b7280;
        }

        /* ── Página de análisis global ── */
        .pagina-analisis {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
        }
        .pagina-analisis h2 {
          color: #1e40af;
          font-size: 24px;
          margin-bottom: 40px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 12px;
          width: 100%;
          text-align: center;
        }
        .graficos-globales {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          width: 100%;
        }

        /* ── Footer ── */
        .footer {
          margin-top: 50px;
          padding-top: 16px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 11px;
        }

        @media print {
          body { padding: 20px; }
          .page-break { page-break-after: always; }
          tr { break-inside: avoid; }
          .seccion-empleado { break-inside: avoid; }
        }
      </style>
    </head>
    <body>

      <!-- ══ PÁGINA 1: PORTADA + RESUMEN GLOBAL ══ -->

      <!-- Encabezado -->
      <div class="header">
        <h1>📊 ${tituloPdf}</h1>
        <p class="subtitulo">Generado el ${fechaGeneracion}</p>
        ${nombreGenerador ? `
          <p class="generador">👤 Generado por: ${nombreGenerador}${puestoGenerador ? ` (${puestoGenerador})` : ''}</p>
        ` : ''}
      </div>

      <!-- Resumen ejecutivo global con inline styles para compatibilidad expo-print -->
      <div style="border:2px solid #1e40af; border-radius:12px; padding:22px; margin-bottom:28px;">
        <h2 style="font-size:20px; font-weight:bold; color:#1e40af; text-align:center; margin-bottom:18px; margin-top:0;">
          Resumen Ejecutivo Global
        </h2>
        <table style="width:100%; border-collapse:collapse; box-shadow:none;">
          <tr>
            <td style="width:20%; text-align:center; padding:14px 8px; border:1px solid #e5e7eb; border-left:4px solid #1e40af; border-radius:0;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Total</p>
              <p style="font-size:28px; font-weight:bold; color:#1e40af; margin:0;">${statsGlobales.total}</p>
            </td>
            <td style="width:20%; text-align:center; padding:14px 8px; border:1px solid #e5e7eb; border-left:4px solid #F59E0B;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Pendientes</p>
              <p style="font-size:28px; font-weight:bold; color:#F59E0B; margin:0;">${statsGlobales.pendientes}</p>
            </td>
            <td style="width:20%; text-align:center; padding:14px 8px; border:1px solid #e5e7eb; border-left:4px solid #3B82F6;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">En Proceso</p>
              <p style="font-size:28px; font-weight:bold; color:#3B82F6; margin:0;">${statsGlobales.enProceso}</p>
            </td>
            <td style="width:20%; text-align:center; padding:14px 8px; border:1px solid #e5e7eb; border-left:4px solid #22C55E;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Resueltos</p>
              <p style="font-size:28px; font-weight:bold; color:#22C55E; margin:0;">${statsGlobales.resueltos}</p>
            </td>
            <td style="width:20%; text-align:center; padding:14px 8px; border:1px solid #e5e7eb; border-left:4px solid #8B5CF6;">
              <p style="font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Empleados</p>
              <p style="font-size:28px; font-weight:bold; color:#8B5CF6; margin:0;">${statsGlobales.totalEmpleados}</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Tabla resumen de empleados -->
      <h2 class="seccion-titulo">Resumen por Colaborador</h2>
      <table>
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Cargo</th>
            <th>Departamento</th>
            <th style="text-align:center;">Total</th>
            <th style="text-align:center;">Pendientes</th>
            <th style="text-align:center;">En Proceso</th>
            <th style="text-align:center;">Resueltos</th>
          </tr>
        </thead>
        <tbody>
          ${filasResumen || `<tr><td colspan="7" style="text-align:center; color:#9ca3af; padding:20px;">Sin colaboradores</td></tr>`}
        </tbody>
      </table>

      <!-- Subtítulo separador — sin salto de página, fluye naturalmente -->
      <div style="margin-top:20px; margin-bottom:16px; border-bottom:2px solid #3b82f6; padding-bottom:10px;">
        <h2 style="font-size:22px; font-weight:bold; color:#1e40af; margin:0 0 6px 0;">
          Informes Individuales por Colaborador
        </h2>
        <p style="font-size:13px; color:#6b7280; margin:0;">
          Detalle de reportes asignados y estadísticas por cada colaborador del departamento
        </p>
      </div>

      <!-- ══ SECCIONES POR EMPLEADO ══ -->
      ${seccionesEmpleados}

      <!-- ══ PÁGINA FINAL: ANÁLISIS ESTADÍSTICO GLOBAL — página nueva ══ -->
      <div style="page-break-before:always;"></div>
      <div class="pagina-analisis" style="margin-top:0;">
        <h2>📈 Análisis Estadístico Global</h2>
        <div class="graficos-globales">
          <div>${pieGlobal}</div>
          <div>${barrasGlobal}</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Informe generado automáticamente · Total de reportes: ${statsGlobales.total} · Colaboradores: ${statsGlobales.totalEmpleados}</p>
        ${nombreGenerador ? `<p>Generado por: ${nombreGenerador}${puestoGenerador ? ` (${puestoGenerador})` : ''}</p>` : ''}
        <p>© ${new Date().getFullYear()} — Sistema de Gestión de Reportes</p>
      </div>

    </body>
    </html>
  `
}

// ─── Función principal de generación y descarga ───────────────────────────────

/**
 * Genera el PDF General Departamental y lo guarda directamente
 * en el dispositivo sin usar expo-sharing.
 *
 * Flujo:
 *  1. Genera el HTML con generarHTMLPdfGeneral()
 *  2. Renderiza el PDF con expo-print (Print.printToFileAsync)
 *  3. Mueve el archivo a documentDirectory con nombre descriptivo
 *  4. Retorna la URI final del archivo guardado
 *
 * El archivo queda en el directorio de documentos del dispositivo,
 * accesible desde el explorador de archivos nativo.
 *
 * @param datos - Datos del informe de PdfDepartamentalService
 * @returns URI del archivo PDF guardado, o undefined si hubo error
 */
export async function generarYDescargarPdfGeneral(
  datos: DatosPdfGeneral
): Promise<string | undefined> {
  try {
    if (!datos.todosLosReportes || datos.todosLosReportes.length === 0) {
      throw new Error('No hay reportes disponibles para generar el informe')
    }

    // 1. Construir HTML
    const html = generarHTMLPdfGeneral(datos)

    // 2. Renderizar PDF con expo-print
    const { uri: uriTemporal } = await Print.printToFileAsync({ html, base64: false })

    // 3. Construir nombre descriptivo del archivo
    // datos.departamento es string directo (ej: 'sistemas') en DatosPdfGeneral
    const deptLabel = datos.departamento || 'general'
    const nombreArchivo = construirNombreArchivoGeneral(datos.nombreGenerador, deptLabel)

    // 4. Guardar en carpeta Descargas real del dispositivo
    // En Android usa StorageAccessFramework (pide permiso al usuario)
    // En iOS guarda en documentDirectory (visible desde app Archivos)
    const uriDestino = await guardarEnDescargas(uriTemporal, nombreArchivo)

    return uriDestino

  } catch (error) {
    console.error('Error al generar PDF general:', error)
    throw error
  }
}
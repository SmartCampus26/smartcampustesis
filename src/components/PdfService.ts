// ===============================
// IMPORTACIONES NECESARIAS
// ===============================

// Librería para generar archivos PDF dinámicamente
import * as Print from 'expo-print'

// Permite compartir archivos (como el PDF generado) usando las opciones del dispositivo
import * as Sharing from 'expo-sharing'

// Sistema de archivos de Expo (versión legacy)
// Se usa para renombrar el archivo PDF antes de compartirlo
import * as FileSystem from 'expo-file-system/legacy'

import { Alert } from 'react-native'
// Permite mostrar mensajes emergentes al usuario (errores o confirmaciones)

// Función para obtener la sesión actual almacenada
import { obtenerSesion } from '../util/Session'

// Función que calcula estadísticas de los reportes (filtrado y conteo)
import { obtenerEstadisticas } from './filtrosReportes'

// Tipos y validadores de base de datos
import { Reporte, esEmpleado, esUsuario } from '../types/Database'
// Reporte: interfaz tipada del reporte
// esEmpleado / esUsuario: funciones type guard para validar el tipo de usuario

// ============================================
// INTERFACES Y TIPOS
// ============================================

/**
 * Estadísticas básicas para el PDF
 * Estas se calculan automáticamente con obtenerEstadisticas()
 */
interface Stats {
  total: number
  pendientes: number
  enProceso: number
  resueltos: number
}

/**
 * Opciones adicionales para personalizar el PDF
 */
interface OpcionesPDF {
  titulo?: string // Título personalizado del documento
  incluirImagen?: boolean // Si se debe mostrar la columna de imagen
  incluirEmpleado?: boolean // Si se debe mostrar empleado asignado
  incluirUsuario?: boolean // Si se debe mostrar usuario creador
  incluirDescripcion?: boolean // Si se debe mostrar descripción completa
  mostrarGraficos?: boolean // Para mostrar gráficos
  nombreGenerador?: string // Nombre de quien genera el PDF
}

// ============================================
// CONSTANTES DE COLORES
// ============================================

/**
 * Paleta de colores para badges de estado
 * Usamos colores claros con texto oscuro para mejor legibilidad
 */
const ESTADO_COLORES = {
  pendiente: { bg: '#FEF3C7', text: '#92400e' }, // Amarillo
  'en proceso': { bg: '#DBEAFE', text: '#1e40af' }, // Azul
  resuelto: { bg: '#D1FAE5', text: '#065f46' }, // Verde
  default: { bg: '#F3F4F6', text: '#1f2937' } // Gris
}

/**
 * Paleta de colores para badges de prioridad
 */
const PRIORIDAD_COLORES = {
  alta: { bg: '#FEE2E2', text: '#991b1b' }, // Rojo
  media: { bg: '#FED7AA', text: '#9a3412' }, // Naranja
  baja: { bg: '#E0E7FF', text: '#3730a3' }, // Índigo
  default: { bg: '#F3F4F6', text: '#1f2937' } // Gris
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
    { label: 'En Proceso', valor: stats.enProceso, color: '#42A5F5' },
    { label: 'Resueltos', valor: stats.resueltos, color: '#66BB6A' }
  ]

  const total = datos.reduce((sum, d) => sum + d.valor, 0)
  const cx = 150
  const cy = 150
  const radio = 120

  // Sin datos
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
    // UN SOLO dato -> círculo sólido (no se puede hacer con path)
    segmentosHTML = `<circle cx="${cx}" cy="${cy}" r="${radio}" fill="${datosConValor[0].color}" stroke="white" stroke-width="2"/>`
    porcentajesHTML = `<text x="${cx}" y="${cy - 50}" text-anchor="middle" font-size="18" font-weight="bold" font-family="sans-serif" fill="white">100%</text>`
  } else {
    // VARIOS datos -> paths normales
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

  // Leyenda
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
  const conteo = {
    alta: reportes.filter(r => r.prioReporte?.toLowerCase() === 'alta').length,
    media: reportes.filter(r => r.prioReporte?.toLowerCase() === 'media').length,
    baja: reportes.filter(r => r.prioReporte?.toLowerCase() === 'baja').length
  }

  const maxValor = Math.max(conteo.alta, conteo.media, conteo.baja, 1)
  const alturaMaxBarra = 200

  return `
    <svg width="400" height="350" viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
      <text x="200" y="25" text-anchor="middle" font-size="16" font-weight="bold" font-family="sans-serif" fill="#1e40af">
        Distribución por Prioridad
      </text>
      
      <!-- Barras -->
      <rect x="40" y="${280 - (conteo.alta / maxValor * alturaMaxBarra)}" 
            width="80" height="${conteo.alta / maxValor * alturaMaxBarra}" 
            fill="#EF4444" rx="4"/>
      <text x="80" y="${270 - (conteo.alta / maxValor * alturaMaxBarra)}" 
            text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">
        ${conteo.alta}
      </text>
      <text x="80" y="305" text-anchor="middle" font-size="14" fill="#374151">Alta</text>
      
      <rect x="160" y="${280 - (conteo.media / maxValor * alturaMaxBarra)}" 
            width="80" height="${conteo.media / maxValor * alturaMaxBarra}" 
            fill="#F59E0B" rx="4"/>
      <text x="200" y="${270 - (conteo.media / maxValor * alturaMaxBarra)}" 
            text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">
        ${conteo.media}
      </text>
      <text x="200" y="305" text-anchor="middle" font-size="14" fill="#374151">Media</text>
      
      <rect x="280" y="${280 - (conteo.baja / maxValor * alturaMaxBarra)}" 
            width="80" height="${conteo.baja / maxValor * alturaMaxBarra}" 
            fill="#6366F1" rx="4"/>
      <text x="320" y="${270 - (conteo.baja / maxValor * alturaMaxBarra)}" 
            text-anchor="middle" font-size="16" font-weight="bold" fill="#1f2937">
        ${conteo.baja}
      </text>
      <text x="320" y="305" text-anchor="middle" font-size="14" fill="#374151">Baja</text>
    </svg>
  `
}

// ============================================
// ⭐ NUEVA FUNCIÓN AUXILIAR: CONSTRUIR NOMBRE DE ARCHIVO
// ============================================

/**
 * Construye el nombre del archivo PDF con formato: informe_fecha_nombre.pdf
 *
 * - La fecha se obtiene automáticamente del sistema (formato YYYY-MM-DD)
 * - El nombre se sanitiza eliminando caracteres especiales no permitidos
 *   en nombres de archivo (ej: /, \, :, *, ?, ", <, >, |)
 * - Los espacios se reemplazan por guiones bajos para mejor compatibilidad
 *
 * @param nombreGenerador - Nombre de quien genera el PDF (ej: "Juan Pérez")
 * @returns Nombre del archivo (ej: "informe_2026-02-16_Juan_Perez.pdf")
 *
 * @example
 * construirNombreArchivo("Juan Pérez")  // → "informe_2026-02-16_Juan_Perez.pdf"
 * construirNombreArchivo(undefined)     // → "informe_2026-02-16_Sistema.pdf"
 */
function construirNombreArchivo(nombreGenerador?: string): string {
  // Fecha actual en formato ISO y recortar solo la parte de la fecha (YYYY-MM-DD)
  const fechaArchivo = new Date().toISOString().split('T')[0]

  // Limpiar el nombre:
  // 1. Eliminar caracteres que no sean letras (incluye tildes y ñ), números o espacios
  // 2. Quitar espacios al inicio/final
  // 3. Reemplazar espacios internos con guiones bajos
  const nombreLimpio = (nombreGenerador || 'Sistema')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_')

  return `informe_${fechaArchivo}_${nombreLimpio}.pdf`
}

// ============================================
// ⭐ NUEVA FUNCIÓN AUXILIAR: RENOMBRAR ARCHIVO PDF
// ============================================

/**
 * Renombra el archivo PDF generado por expo-print con un nombre personalizado.
 *
 * ¿Por qué es necesario?
 * expo-print NO permite definir el nombre del archivo al crearlo; siempre
 * genera un nombre aleatorio tipo "print-xxxxxx.pdf". Para solucionar esto,
 * obtenemos el directorio del archivo original y lo movemos (renombramos)
 * al mismo directorio con el nuevo nombre usando FileSystem.moveAsync.
 *
 * @param uriOriginal - URI del archivo generado por expo-print
 * @param nombreArchivo - Nombre deseado para el archivo (ej: "informe_2026-02-16_Juan.pdf")
 * @returns Nueva URI del archivo con el nombre personalizado
 *
 * @example
 * const nuevaUri = await renombrarArchivoPDF(
 *   'file:///cache/print-abc123.pdf',
 *   'informe_2026-02-16_Juan_Perez.pdf'
 * )
 * // nuevaUri → 'file:///cache/informe_2026-02-16_Juan_Perez.pdf'
 */
async function renombrarArchivoPDF(uriOriginal: string, nombreArchivo: string): Promise<string> {
  // Extraer el directorio base del archivo original.
  // Usamos una variable tipada explícitamente como number para evitar el error
  // de TypeScript: "The left-hand side of an arithmetic operation must be of
  // type 'any', 'number', 'bigint' or an enum type"
  const ultimaBarraPos: number = uriOriginal.lastIndexOf('/') + 1
  const directorioBase = uriOriginal.substring(0, ultimaBarraPos)

  // Construir la nueva URI con el nombre personalizado
  const nuevaUri = `${directorioBase}${nombreArchivo}`

  // Mover (renombrar) el archivo al nuevo nombre en el mismo directorio
  await FileSystem.moveAsync({ from: uriOriginal, to: nuevaUri })

  return nuevaUri
}

// ============================================
// FUNCIÓN PRINCIPAL: GENERAR PDF
// ============================================

/**
 * Genera un PDF con el listado de reportes y estadísticas
 *
 * Flujo del proceso:
 * 1. Valida que haya reportes
 * 2. Calcula estadísticas automáticamente
 * 3. Obtiene datos del generador desde la sesión activa
 * 4. Construye el HTML con tablas, badges y gráficos SVG
 * 5. Convierte el HTML a PDF con expo-print
 * 6. ⭐ Renombra el archivo con formato: informe_fecha_nombre.pdf
 * 7. Comparte el PDF mediante expo-sharing
 *
 * @param reportes - Array de reportes a incluir (puede estar previamente filtrado)
 * @param opciones - Configuración opcional para personalizar el PDF
 * @returns URI del archivo PDF generado con nombre personalizado
 */
export async function generarPDF(
  reportes: Reporte[],
  opciones: OpcionesPDF = { mostrarGraficos: true }
) {
  try {
    // ========================================
    // VALIDACIONES INICIALES
    // ========================================

    if (!reportes || reportes.length === 0) {
      Alert.alert('Advertencia', 'No hay reportes para generar el PDF')
      return
    }

    // ========================================
    // PREPARACIÓN DE DATOS
    // ========================================

    // Calcular estadísticas automáticamente usando la función del filtro
    const stats = obtenerEstadisticas(reportes)

    // ⭐ OBTENER NOMBRE Y PUESTO DEL GENERADOR DE LA SESIÓN ⭐
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

        if (!nombreGenerador) {
          nombreGenerador = 'Sistema' // Fallback
        }

      } catch (error) {
        console.error('Error obteniendo datos de sesión para PDF:', error)
        nombreGenerador = 'Sistema'
      }
    }

    // Formatear fecha de generación en español
    const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Título del documento (personalizable o por defecto)
    const tituloPDF = opciones.titulo || 'Informe de Reportes'

    // PRE-GENERAR los SVGs antes de meter en el HTML
    const graficoSVG = generarGraficoPieSVG(stats)
    const graficoBarras = generarGraficoBarrasPrioridad(reportes)

    // ========================================
    // CONSTRUCCIÓN DEL HTML
    // ========================================

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tituloPDF}</title>
        <style>
          /* ================================
             RESET Y ESTILOS BASE
             ================================ */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 40px;
            color: #1f2937;
            background: #ffffff;
          }
          
          /* ================================
             SALTOS DE PÁGINA
             ================================ */
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          
          /* ================================
             HEADER (ENCABEZADO)
             ================================ */
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          
          h1 {
            color: #1e40af;
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .fecha-generacion {
            color: #6b7280;
            font-size: 14px;
            margin-top: 8px;
          }

          .generado-por {
            color: #059669;
            font-size: 16px;
            font-weight: 600;
            margin-top: 12px;
          }
          
          /* ================================
             SECCIÓN DE RESUMEN
             ================================ */
          .resumen {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
            color: white;
          }
          
          .resumen h2 {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          /* Grid de 2 columnas para las estadísticas */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .stat-card {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          
          .stat-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .stat-value {
            font-size: 36px;
            font-weight: bold;
          } 
          
          /* ================================
             PÁGINA DE GRÁFICOS ESTADÍSTICOS
             ================================ */
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

          .grafico-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          /* ================================
             SECCIÓN DE DETALLE
             ================================ */
          .detalle {
            margin-top: 40px;
          }
          
          .detalle h2 {
            color: #1e40af;
            font-size: 24px;
            margin-bottom: 20px;
            border-left: 4px solid #3b82f6;
            padding-left: 12px;
          }
          
          /* ================================
             TABLA DE REPORTES
             ================================ */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          
          thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          th {
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          td {
            padding: 14px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          
          /* Eliminar borde en la última fila */
          tr:last-child td {
            border-bottom: none;
          }
          
          /* Filas alternadas para mejor legibilidad */
          tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          tbody tr:hover {
            background-color: #f3f4f6;
          }
          
          /* ================================
             BADGES (ETIQUETAS)
             ================================ */
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
          }
          
          /* Estilos específicos por estado */
          .estado-pendiente { 
            background: #FEF3C7; 
            color: #92400e; 
          }
          .estado-en-proceso { 
            background: #DBEAFE; 
            color: #1e40af; 
          }
          .estado-resuelto { 
            background: #D1FAE5; 
            color: #065f46; 
          }
          
          /* Estilos específicos por prioridad */
          .prioridad-alta { 
            background: #FEE2E2; 
            color: #991b1b; 
          }
          .prioridad-media { 
            background: #FED7AA; 
            color: #9a3412; 
          }
          .prioridad-baja { 
            background: #E0E7FF; 
            color: #3730a3; 
          }
          
          /* ================================
             DESCRIPCIÓN LARGA
             ================================ */
          .descripcion {
            max-width: 400px;
            font-size: 12px;
            color: #4b5563;
            line-height: 1.4;
          }
          
          /* ================================
             FOOTER (PIE DE PÁGINA)
             ================================ */
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          .no-data {
            text-align: center;
            padding: 40px;
            color: #6b7280;
            font-style: italic;
          }
          
          /* ================================
             ESTILOS PARA IMPRESIÓN
             ================================ */
          @media print {
            body { padding: 20px; }
            .stat-card { break-inside: avoid; }
            tr { break-inside: avoid; }
            .page-break { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        <!-- ================================
             PÁGINA 1: ENCABEZADO Y RESUMEN
             ================================ -->
        <div class="header">
          <h1>📊 ${tituloPDF}</h1>
          <p class="fecha-generacion">Generado el ${fechaGeneracion}</p>
          ${nombreGenerador ? `
            <p class="generado-por">
              👤 Generado por: ${nombreGenerador} ${puestoGenerador ? `(${puestoGenerador})` : ''}
            </p>
          ` : ''}
        </div>

        <!-- ================================
             RESUMEN EJECUTIVO
             ================================ -->
        <div class="resumen">
          <h2>Resumen Ejecutivo</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total de Reportes</div>
              <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Pendientes</div>
              <div class="stat-value">${stats.pendientes}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">En Proceso</div>
              <div class="stat-value">${stats.enProceso}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Resueltos</div>
              <div class="stat-value">${stats.resueltos}</div>
            </div>
          </div>
        </div>
        
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
                  // ========================================
                  // FORMATEO DE DATOS DE CADA REPORTE
                  // ========================================
                  
                  // Convertir fecha a formato local español
                  const fecha = new Date(r.fecReporte)
                  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                  
                  // Normalizar estado para la clase CSS (ej: "En Proceso" -> "en-proceso")
                  const estadoNormalizado = r.estReporte?.toLowerCase().replace(/\s+/g, '-') || 'default'
                  
                  // Normalizar prioridad para la clase CSS
                  const prioridadNormalizada = r.prioReporte?.toLowerCase() || 'default'
                  
                  // Construir nombre completo del usuario creador
                  const nombreUsuario = r.usuario 
                    ? `${r.usuario.nomUser} ${r.usuario.apeUser}`
                    : 'N/A'
                  
                  // Construir nombre completo del empleado asignado
                  const nombreEmpleado = r.empleado 
                    ? `${r.empleado.nomEmpl} ${r.empleado.apeEmpl}`
                    : 'Sin asignar'
                  
                  // Truncar descripción si es muy larga
                  const descripcion = r.descriReporte 
                    ? (r.descriReporte.length > 100 
                        ? r.descriReporte.substring(0, 100) + '...' 
                        : r.descriReporte)
                    : 'Sin descripción'
                  
                  // ========================================
                  // CONSTRUCCIÓN DE LA FILA
                  // ========================================
                  return `
                    <tr>
                      <td><strong>#${r.idReporte}</strong></td>
                      <td>
                        <span class="badge estado-${estadoNormalizado}">
                          ${r.estReporte}
                        </span>
                      </td>
                      <td>
                        <span class="badge prioridad-${prioridadNormalizada}">
                          ${r.prioReporte}
                        </span>
                      </td>
                      <td>${fechaFormateada}</td>
                      ${opciones.incluirUsuario !== false ? `<td>${nombreUsuario}</td>` : ''}
                      ${opciones.incluirEmpleado !== false ? `<td>${nombreEmpleado}</td>` : ''}
                      ${opciones.incluirDescripcion ? `<td class="descripcion">${descripcion}</td>` : ''}
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          ` : `
            <div class="no-data">
              No hay reportes disponibles para mostrar
            </div>
          `}
        </div>

        <!-- ================================
             PIE DE PÁGINA
             ================================ -->
        <div class="footer">
          <p>Informe generado automáticamente | Total de reportes: ${stats.total}</p>
          ${nombreGenerador ? `<p>Generado por: ${nombreGenerador} ${puestoGenerador ? `(${puestoGenerador})` : ''}</p>` : ''}
          <p>© ${new Date().getFullYear()} - Sistema de Gestión de Reportes</p>
        </div>

        <!-- ⭐ SALTO DE PÁGINA ANTES DE LOS GRÁFICOS ⭐ -->
        <div class="page-break"></div>

        <!-- ================================
             PÁGINA 2: GRÁFICOS ESTADÍSTICOS
             ================================ -->
        ${opciones.mostrarGraficos !== false ? `
          <div class="pagina-graficos">
            <h2>📈 Análisis Estadístico</h2>

            <div class="graficos-container">
              <!-- Gráfico de Pastel -->
              <div class="grafico-wrapper">
                ${graficoSVG}
              </div>

              <!-- Gráfico de Barras -->
              <div class="grafico-wrapper">
                ${graficoBarras}
              </div>
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `

    // ========================================
    // GENERACIÓN DEL PDF
    // ========================================

    // Convertir HTML a PDF usando expo-print.
    // NOTA: expo-print no permite definir el nombre del archivo, siempre
    // genera un nombre aleatorio tipo "print-xxxxxx.pdf". Por eso el
    // siguiente paso es renombrarlo con nuestra función auxiliar.
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false // No necesitamos base64, solo el URI del archivo
    })

    // ========================================
    // ⭐ RENOMBRAR EL ARCHIVO CON NOMBRE PERSONALIZADO
    // ========================================

    // Construir el nombre deseado: informe_2026-02-16_Juan_Perez.pdf
    const nombreArchivo = construirNombreArchivo(nombreGenerador)

    // Mover el archivo al nuevo nombre usando FileSystem.moveAsync.
    // Esto es equivalente a renombrarlo en el mismo directorio.
    const uriConNombre = await renombrarArchivoPDF(uri, nombreArchivo)

    // ========================================
    // COMPARTIR EL PDF
    // ========================================

    // Verificar si el dispositivo puede compartir archivos
    const canShare = await Sharing.isAvailableAsync()

    if (canShare) {
      // Compartir el PDF renombrado con opciones específicas
      await Sharing.shareAsync(uriConNombre, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir Informe de Reportes',
        UTI: 'com.adobe.pdf' // Identificador de tipo uniforme para iOS
      })
    } else {
      // Si no se puede compartir, mostrar alerta
      Alert.alert(
        'Compartir no disponible',
        'No se puede compartir el archivo en este dispositivo'
      )
    }

    // Retornar la URI del PDF renombrado para uso posterior si es necesario
    return uriConNombre

  } catch (error) {
    // ========================================
    // MANEJO DE ERRORES
    // ========================================

    console.error('Error al generar PDF:', error)
    Alert.alert(
      'Error',
      'No se pudo generar el PDF. Por favor, intenta nuevamente.'
    )
    throw error
  }
}

// ============================================
// FUNCIONES AUXILIARES PRE-CONFIGURADAS
// ============================================

/**
 * Genera un PDF solo con reportes de un estado específico
 */
export async function generarPDFPorEstado(
  reportes: Reporte[],
  estado: string,
  nombreGenerador?: string
) {
  const reportesFiltrados = reportes.filter(
    r => r.estReporte.toLowerCase() === estado.toLowerCase()
  )

  return generarPDF(reportesFiltrados, {
    titulo: `Reportes ${estado.charAt(0).toUpperCase() + estado.slice(1)}`,
    mostrarGraficos: true,
    nombreGenerador
  })
}

/**
 * Genera un PDF con reportes en un rango de fechas
 */
export async function generarPDFPorFechas(
  reportes: Reporte[],
  fechaInicio: Date,
  fechaFin: Date,
  nombreGenerador?: string
) {
  const inicio = new Date(fechaInicio)
  inicio.setHours(0, 0, 0, 0)

  const fin = new Date(fechaFin)
  fin.setHours(23, 59, 59, 999)

  const reportesFiltrados = reportes.filter(r => {
    const fecha = new Date(r.fecReporte)
    return fecha >= inicio && fecha <= fin
  })

  const rangoTexto = `${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}`

  return generarPDF(reportesFiltrados, {
    titulo: `Reportes del ${rangoTexto}`,
    mostrarGraficos: true,
    nombreGenerador
  })
}

/**
 * Genera un PDF con reportes asignados a un empleado específico
 */
export async function generarPDFPorEmpleado(
  reportes: Reporte[],
  idEmpl: string,
  nombreGenerador?: string
) {
  const reportesFiltrados = reportes.filter(r => r.idEmpl === idEmpl)

  const nombreEmpleado = reportesFiltrados[0]?.empleado
    ? `${reportesFiltrados[0].empleado.nomEmpl} ${reportesFiltrados[0].empleado.apeEmpl}`
    : 'Empleado Desconocido'

  return generarPDF(reportesFiltrados, {
    titulo: `Reportes de ${nombreEmpleado}`,
    incluirEmpleado: false,
    mostrarGraficos: true,
    nombreGenerador
  })
}

/**
 * Genera un PDF con reportes creados por un usuario específico
 */
export async function generarPDFPorUsuario(
  reportes: Reporte[],
  idUser: string,
  nombreGenerador?: string
) {
  const reportesFiltrados = reportes.filter(r => r.idUser === idUser)

  const nombreUsuario = reportesFiltrados[0]?.usuario
    ? `${reportesFiltrados[0].usuario.nomUser} ${reportesFiltrados[0].usuario.apeUser}`
    : 'Usuario Desconocido'

  return generarPDF(reportesFiltrados, {
    titulo: `Reportes de ${nombreUsuario}`,
    incluirUsuario: false,
    mostrarGraficos: true,
    nombreGenerador
  })
}

/**
 * Genera un PDF detallado con descripción completa de cada reporte
 */
export async function generarPDFDetallado(
  reportes: Reporte[],
  nombreGenerador?: string
) {
  return generarPDF(reportes, {
    titulo: 'Informe Detallado de Reportes',
    incluirDescripcion: true,
    incluirUsuario: true,
    incluirEmpleado: true,
    mostrarGraficos: true,
    nombreGenerador
  })
}
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Alert } from 'react-native'
import { Reporte } from '../types/Database'
import { obtenerEstadisticas } from '../components/filtrosReportes'

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
  mostrarGraficos?: boolean // Para futuras implementaciones
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
// FUNCIÓN PRINCIPAL: GENERAR PDF
// ============================================

/**
 * Genera un PDF con el listado de reportes y estadísticas
 * 
 * @param reportes - Array de reportes a incluir (puede estar previamente filtrado)
 * @param opciones - Configuración opcional para personalizar el PDF
 * @returns URI del archivo PDF generado
 * 
 * Ejemplo de uso:
 * ```typescript
 * // Generar PDF con todos los reportes
 * const reportes = await obtenerReportes()
 * await generarPDF(reportes)
 * 
 * // Generar PDF con reportes filtrados
 * const reportesPendientes = filtrarReportes(reportes, { estado: 'pendiente' })
 * await generarPDF(reportesPendientes, { titulo: 'Reportes Pendientes' })
 * ```
 */
export async function generarPDF(
  reportes: Reporte[], 
  opciones: OpcionesPDF = {}
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
          }
        </style>
      </head>
      <body>
        <!-- ================================
             ENCABEZADO DEL DOCUMENTO
             ================================ -->
        <div class="header">
          <h1>📊 ${tituloPDF}</h1>
          <p class="fecha-generacion">Generado el ${fechaGeneracion}</p>
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

        <!-- ================================
             TABLA DE DETALLE
             ================================ -->
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
          <p>© ${new Date().getFullYear()} - Sistema de Gestión de Reportes</p>
        </div>
      </body>
      </html>
    `

    // ========================================
    // GENERACIÓN DEL PDF
    // ========================================

    // Convertir HTML a PDF usando expo-print
    const { uri } = await Print.printToFileAsync({ 
      html,
      base64: false // No necesitamos base64, solo el URI del archivo
    })

    // ========================================
    // COMPARTIR EL PDF
    // ========================================

    // Verificar si el dispositivo puede compartir archivos
    const canShare = await Sharing.isAvailableAsync()
    
    if (canShare) {
      // Compartir el PDF con opciones específicas
      await Sharing.shareAsync(uri, {
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

    // Retornar la URI del PDF para uso posterior si es necesario
    return uri

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
 * 
 * @param reportes - Array completo de reportes
 * @param estado - Estado a filtrar ('pendiente', 'en proceso', 'resuelto')
 * 
 * Ejemplo:
 * ```typescript
 * await generarPDFPorEstado(reportes, 'pendiente')
 * ```
 */
export async function generarPDFPorEstado(
  reportes: Reporte[], 
  estado: string
) {
  // Filtrar reportes por el estado solicitado (case-insensitive)
  const reportesFiltrados = reportes.filter(
    r => r.estReporte.toLowerCase() === estado.toLowerCase()
  )
  
  // Generar PDF con título personalizado
  return generarPDF(reportesFiltrados, {
    titulo: `Reportes ${estado.charAt(0).toUpperCase() + estado.slice(1)}`
  })
}

/**
 * Genera un PDF con reportes en un rango de fechas
 * 
 * @param reportes - Array completo de reportes
 * @param fechaInicio - Fecha de inicio del rango
 * @param fechaFin - Fecha de fin del rango
 * 
 * Ejemplo:
 * ```typescript
 * await generarPDFPorFechas(
 *   reportes, 
 *   new Date('2026-01-01'), 
 *   new Date('2026-01-31')
 * )
 * ```
 */
export async function generarPDFPorFechas(
  reportes: Reporte[],
  fechaInicio: Date,
  fechaFin: Date
) {
  // Normalizar fechas (inicio a las 00:00:00, fin a las 23:59:59)
  const inicio = new Date(fechaInicio)
  inicio.setHours(0, 0, 0, 0)
  
  const fin = new Date(fechaFin)
  fin.setHours(23, 59, 59, 999)
  
  // Filtrar reportes dentro del rango
  const reportesFiltrados = reportes.filter(r => {
    const fecha = new Date(r.fecReporte)
    return fecha >= inicio && fecha <= fin
  })
  
  // Formatear rango de fechas para el título
  const rangoTexto = `${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}`
  
  // Generar PDF con título que incluye el rango de fechas
  return generarPDF(reportesFiltrados, {
    titulo: `Reportes del ${rangoTexto}`
  })
}

/**
 * Genera un PDF con reportes asignados a un empleado específico
 * 
 * @param reportes - Array completo de reportes
 * @param idEmpl - ID del empleado
 * 
 * Ejemplo:
 * ```typescript
 * await generarPDFPorEmpleado(reportes, 123)
 * ```
 */
export async function generarPDFPorEmpleado(
  reportes: Reporte[],
  idEmpl: number
) {
  // Filtrar reportes asignados al empleado
  const reportesFiltrados = reportes.filter(r => r.idEmpl === idEmpl)
  
  // Obtener nombre del empleado del primer reporte (si existe)
  const nombreEmpleado = reportesFiltrados[0]?.empleado
    ? `${reportesFiltrados[0].empleado.nomEmpl} ${reportesFiltrados[0].empleado.apeEmpl}`
    : 'Empleado Desconocido'
  
  // Generar PDF con título personalizado
  return generarPDF(reportesFiltrados, {
    titulo: `Reportes de ${nombreEmpleado}`,
    incluirEmpleado: false // No mostrar columna de empleado (ya sabemos cuál es)
  })
}

/**
 * Genera un PDF con reportes creados por un usuario específico
 * 
 * @param reportes - Array completo de reportes
 * @param idUser - ID del usuario
 * 
 * Ejemplo:
 * ```typescript
 * await generarPDFPorUsuario(reportes, 456)
 * ```
 */
export async function generarPDFPorUsuario(
  reportes: Reporte[],
  idUser: number
) {
  // Filtrar reportes creados por el usuario
  const reportesFiltrados = reportes.filter(r => r.idUser === idUser)
  
  // Obtener nombre del usuario del primer reporte (si existe)
  const nombreUsuario = reportesFiltrados[0]?.usuario
    ? `${reportesFiltrados[0].usuario.nomUser} ${reportesFiltrados[0].usuario.apeUser}`
    : 'Usuario Desconocido'
  
  // Generar PDF con título personalizado
  return generarPDF(reportesFiltrados, {
    titulo: `Reportes de ${nombreUsuario}`,
    incluirUsuario: false // No mostrar columna de usuario (ya sabemos quién es)
  })
}

/**
 * Genera un PDF detallado con descripción completa de cada reporte
 * Útil para reportes con mucho texto
 * 
 * @param reportes - Array de reportes
 * 
 * Ejemplo:
 * ```typescript
 * await generarPDFDetallado(reportes)
 * ```
 */
export async function generarPDFDetallado(reportes: Reporte[]) {
  return generarPDF(reportes, {
    titulo: 'Informe Detallado de Reportes',
    incluirDescripcion: true, // Mostrar descripción completa
    incluirUsuario: true,
    incluirEmpleado: true
  })
}
/**
 * DescargaPdfUtil.ts
 *
 * Utilidad compartida para guardar y compartir PDFs generados por expo-print.
 * Funciona en Android e iOS usando expo-sharing con control de concurrencia.
 *
 * Comportamiento:
 *  - El archivo SIEMPRE se guarda en documentDirectory con nombre descriptivo
 *  - Luego se abre el diálogo de compartir para que el usuario elija dónde guardarlo
 *  - Si el usuario cancela el diálogo, el archivo sigue guardado en documentDirectory
 *  - shareAsync no distingue entre "guardó" y "canceló" — ambos son éxito técnico
 *  - El flag 'compartiendo' evita el error "Another share request is being processed"
 *
 * Retorna:
 *  - string: URI del archivo en documentDirectory (siempre, si no hubo error)
 *  - undefined: si el dispositivo no soporta sharing o hay un error real
 *
 * Usado por: PdfService.ts, PdfGeneralService.ts, PdfResumidoService.ts
 * Ubicación: src/services/ (capa de servicio)
 */

import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'

// ─── Flag de control de concurrencia ─────────────────────────────────────────

/**
 * Evita el error "Another share request is being processed now".
 * Se activa al iniciar y se resetea siempre en el bloque finally.
 */
let compartiendo = false

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Guarda el PDF en documentDirectory y abre el diálogo de compartir.
 *
 * Flujo:
 *  1. Verifica que sharing esté disponible
 *  2. Mueve el PDF temporal a documentDirectory con nombre descriptivo
 *  3. Abre el diálogo de compartir (el usuario elige dónde guardarlo)
 *  4. Retorna la URI de documentDirectory independientemente de lo que
 *     el usuario hizo en el diálogo (shareAsync no detecta cancelación)
 *
 * El archivo queda accesible en documentDirectory aunque el usuario
 * cierre el diálogo sin elegir destino.
 *
 * @param uriTemporal - URI temporal de Print.printToFileAsync
 * @param nombreArchivo - Nombre descriptivo del archivo final
 * @returns URI del archivo guardado, o undefined si no se pudo guardar
 */
export async function guardarEnDescargas(
  uriTemporal: string,
  nombreArchivo: string
): Promise<string | undefined> {
  // Bloquear llamadas simultáneas
  if (compartiendo) {
    throw new Error('Ya hay una operación en proceso. Espera a que termine.')
  }

  try {
    compartiendo = true

    // 1. Verificar disponibilidad de sharing
    const disponible = await Sharing.isAvailableAsync()
    if (!disponible) {
      // En dispositivos sin sharing, solo guardamos el archivo
      const dir = FileSystem.documentDirectory
      if (!dir) throw new Error('No se pudo acceder al directorio de documentos')
      const uriDestino = `${dir}${nombreArchivo}`
      await FileSystem.moveAsync({ from: uriTemporal, to: uriDestino })
      return uriDestino
    }

    // 2. Guardar en documentDirectory con nombre descriptivo
    const dir = FileSystem.documentDirectory
    if (!dir) throw new Error('No se pudo acceder al directorio de documentos')

    const uriDestino = `${dir}${nombreArchivo}`

    // Eliminar versión previa si existe
    const info = await FileSystem.getInfoAsync(uriDestino)
    if (info.exists) {
      await FileSystem.deleteAsync(uriDestino, { idempotent: true })
    }

    await FileSystem.moveAsync({ from: uriTemporal, to: uriDestino })

    // 3. Abrir diálogo de compartir
    // Nota: shareAsync no lanza error ni retorna estado al cancelar —
    // simplemente resuelve. El archivo ya está guardado en uriDestino.
    await Sharing.shareAsync(uriDestino, {
      mimeType: 'application/pdf',
      dialogTitle: `Guardar ${nombreArchivo}`,
      UTI: 'com.adobe.pdf',
    })

    // Retornamos la URI siempre — el archivo está en documentDirectory
    // independientemente de si el usuario eligió destino o canceló el diálogo
    return uriDestino

  } catch (error: any) {
    // Solo lanzar si es un error real (no cancelación del usuario)
    // El error de cancelación en Android tiene mensaje específico
    const msg: string = error?.message ?? ''
    if (msg.includes('User did not share') || msg.includes('canceled') || msg.includes('cancelled')) {
      // Usuario canceló — el archivo sigue en documentDirectory
      const dir = FileSystem.documentDirectory
      return dir ? `${dir}${nombreArchivo}` : undefined
    }
    // Error real
    console.error('[DescargaPdfUtil] Error al guardar PDF:', error)
    throw error
  } finally {
    compartiendo = false
  }
}
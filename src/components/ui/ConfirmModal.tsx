// ─── ConfirmModal.tsx ─────────────────────────────────────────────────────────
// Modal de confirmación con estética oscura consistente con ToastContext.
// Fondo oscuro, borde de color dinámico, punto indicador y texto claro —
// igual que los banners toast de la app.
//
// Reemplaza los ConfirmModal locales en:
//   - Buscador.tsx          (eliminación de usuarios/empleados)
//   - ReasignarEmpleado.tsx (confirmación de reasignación)
//   - ReportesPendientes.tsx (confirmación de asignación)
//   - TodosReportes.tsx     (eliminación de reportes)
//
// El componente es completamente genérico — no conoce el dominio de negocio.
// El color del acento comunica la naturaleza de la acción:
//   '#e63946' rojo   → acciones destructivas  (eliminar)
//   '#4895ef' azul   → acciones neutras        (reasignar, confirmar)
//   '#2dc653' verde  → acciones positivas      (asignar, guardar)
//
// USO:
//   <ConfirmModal
//     visible={confirm.visible}
//     titulo="Eliminar reporte"
//     mensaje="¿Estás seguro? Esta acción no se puede deshacer."
//     labelConfirmar="Eliminar"
//     accentColor="#e63946"
//     onConfirm={handleEliminar}
//     onCancel={closeConfirm}
//   />

import * as React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  /** Controla la visibilidad del modal */
  visible: boolean
  /** Título principal mostrado junto al punto indicador */
  titulo: string
  /** Descripción de la acción a confirmar */
  mensaje: string
  /** Texto del botón de confirmación. Default: 'Confirmar' */
  labelConfirmar?: string
  /** Texto del botón de cancelación. Default: 'Cancelar' */
  labelCancelar?: string
  /**
   * Color del borde, punto indicador y botón confirmar.
   * Default: '#4895ef' (azul neutro).
   * Usar '#e63946' para acciones destructivas.
   */
  accentColor?: string
  /** Función ejecutada al confirmar */
  onConfirm: () => void
  /** Función ejecutada al cancelar o tocar fuera */
  onCancel: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ConfirmModal({
  visible,
  titulo,
  mensaje,
  labelConfirmar = 'Confirmar',
  labelCancelar  = 'Cancelar',
  accentColor    = '#4895ef',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // El fondo varía según la naturaleza del acento, igual que ToastContext:
  //   rojo  → #1a1a2e  (toastError)
  //   otros → #0f1623  (toastInfo / toastSuccess)
  const bgColor = accentColor === '#e63946' ? '#1a1a2e' : '#0f1623'

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.box,
          { backgroundColor: bgColor, borderColor: accentColor, shadowColor: accentColor },
        ]}>

          {/* Encabezado: punto indicador + título — mismo patrón que ToastBanner */}
          <View style={styles.header}>
            <View style={[styles.dot, { backgroundColor: accentColor }]} />
            <Text style={styles.titulo}>{titulo}</Text>
          </View>

          {/* Mensaje descriptivo */}
          <Text style={styles.mensaje}>{mensaje}</Text>

          {/* Fila de botones */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.btnCancelar} onPress={onCancel}>
              <Text style={styles.btnCancelarText}>{labelCancelar}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnConfirmar, { backgroundColor: accentColor }]}
              onPress={onConfirm}
            >
              <Text style={[
                styles.btnConfirmarText,
                { color: accentColor === '#e63946' ? '#f1f1f1' : '#0f1623' },
              ]}>
                {labelConfirmar}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  box: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 360,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  titulo: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: '#f1f1f1',
    flexShrink: 1,
  },
  mensaje: {
    fontSize: TYPOGRAPHY.md,
    color: '#a0aec0',
    lineHeight: 20,
    marginBottom: SPACING.xl,
    paddingLeft: SPACING.base + 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
  },
  btnCancelar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  btnCancelarText: {
    color: '#a0aec0',
    fontWeight: '600',
    fontSize: TYPOGRAPHY.md,
  },
  btnConfirmar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
  },
  btnConfirmarText: {
    fontWeight: '700',
    fontSize: TYPOGRAPHY.md,
  },
})
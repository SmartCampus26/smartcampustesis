// ─── ConfirmModal.tsx ─────────────────────────────────────────────────────────
// Modal de confirmación antes de ejecutar acciones críticas (eliminar, reasignar).
// Muestra el nombre del elemento afectado y dos botones: cancelar y confirmar.
//
// Reemplaza:
//   - Componente local `ConfirmModal` en Buscador.tsx
//   - Alert.alert de confirmación en ReasignarEmpleado.tsx
//   - Alert.alert de confirmación en ReportesPendientes.tsx
//
// NOTA: Se mantiene como componente global porque su lógica es completamente
// genérica. No conoce reportes, empleados ni ningún dominio específico.
//
// USO:
//   <ConfirmModal
//     visible={confirm.visible}
//     title="Confirmar eliminación"
//     message={`¿Estás seguro de eliminar a ${nombre}?`}
//     confirmLabel="Eliminar"
//     confirmVariant="danger"
//     onConfirm={handleEliminar}
//     onCancel={() => setConfirm({ visible: false })}
//   />

import * as React from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ConfirmVariant = 'primary' | 'danger'

interface ConfirmModalProps {
  /** Controla la visibilidad del modal */
  visible: boolean
  /** Título del modal */
  title: string
  /** Mensaje descriptivo de la acción */
  message: string
  /** Texto del botón de confirmación. Default: 'Confirmar' */
  confirmLabel?: string
  /** Variante visual del botón de confirmación. Default: 'danger' */
  confirmVariant?: ConfirmVariant
  /** Texto del botón de cancelación. Default: 'Cancelar' */
  cancelLabel?: string
  /** Función ejecutada al confirmar */
  onConfirm: () => void
  /** Función ejecutada al cancelar */
  onCancel: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  confirmVariant = 'danger',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      {/* Overlay semitransparente */}
      <View style={styles.overlay}>
        {/* Caja del modal */}
        <View style={styles.box}>
          {/* Título */}
          <Text style={styles.title}>{title}</Text>

          {/* Mensaje descriptivo */}
          <Text style={styles.message}>{message}</Text>

          {/* Fila de botones */}
          <View style={styles.buttonRow}>
            {/* Botón cancelar */}
            <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
              <Text style={styles.btnCancelText}>{cancelLabel}</Text>
            </TouchableOpacity>

            {/* Botón confirmar — color dinámico según variante */}
            <TouchableOpacity
              style={[
                styles.btnConfirm,
                { backgroundColor: confirmVariant === 'danger' ? '#E63946' : COLORS.primary },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.btnConfirmText}>{confirmLabel}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
  },

  box: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    ...SHADOWS.lg,
  },

  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  message: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  btnCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },

  btnCancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
  },

  btnConfirm: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },

  btnConfirmText: {
    color: COLORS.textWhite,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.base,
  },
})
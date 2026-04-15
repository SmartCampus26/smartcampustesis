// ─── FormularioEdicion.tsx ────────────────────────────────────────────────────
// Formulario inline para editar estado, prioridad y comentario de un reporte.
// Extraído del subcomponente local de ReportesPendientes.tsx.
//
// Las opciones válidas de estado y prioridad vienen del servicio:
//   ESTADOS_VALIDOS y PRIORIDADES_VALIDAS de ReportesPendientesService.ts
//
// USO:
//   <FormularioEdicion
//     nuevoEstado={nuevoEstado}
//     nuevaPrioridad={nuevaPrioridad}
//     nuevoComentario={nuevoComentario}
//     estados={ESTADOS_VALIDOS}
//     prioridades={PRIORIDADES_VALIDAS}
//     onEstadoChange={setNuevoEstado}
//     onPrioridadChange={setNuevaPrioridad}
//     onComentarioChange={setNuevoComentario}
//     onGuardar={handleGuardar}
//     onCancelar={cancelarEdicion}
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../styles/tokens'

// ─── Paleta oscura (consistente con reportesPendientesStyles) ─────────────────
const C = {
  bg:            '#0F1E2E',
  surface:       '#1C3045',
  surfaceAlt:    '#243D55',
  cardBorder:    '#1E3448',
  accent:        '#1DCDFE',
  mint:          '#21D0B2',
  white:         '#FFFFFF',
  textPrimary:   '#E8F4FD',
  textSecondary: '#7FA8C4',
  textMuted:     '#4A7294',
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface FormularioEdicionProps {
  /** Valor actual del estado seleccionado */
  nuevoEstado: string
  /** Valor actual de la prioridad seleccionada */
  nuevaPrioridad: string
  /** Texto actual del comentario */
  nuevoComentario: string
  /** Opciones válidas de estado — vienen de ESTADOS_VALIDOS del servicio */
  estados: readonly string[]
  /** Opciones válidas de prioridad — vienen de PRIORIDADES_VALIDAS del servicio */
  prioridades: readonly string[]
  onEstadoChange: (v: string) => void
  onPrioridadChange: (v: string) => void
  onComentarioChange: (v: string) => void
  onGuardar: () => void
  onCancelar: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FormularioEdicion({
  nuevoEstado,
  nuevaPrioridad,
  nuevoComentario,
  estados,
  prioridades,
  onEstadoChange,
  onPrioridadChange,
  onComentarioChange,
  onGuardar,
  onCancelar,
}: FormularioEdicionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.form}>

        {/* Selector de estado */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Estado</Text>
          <View style={styles.opciones}>
            {estados.map((est) => (
              <TouchableOpacity
                key={est}
                style={[styles.opcion, nuevoEstado === est && styles.opcionSelected]}
                onPress={() => onEstadoChange(est)}
              >
                <Text style={[
                  styles.opcionText,
                  nuevoEstado === est && styles.opcionTextSelected,
                ]}>
                  {est}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selector de prioridad */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Prioridad</Text>
          <View style={styles.opciones}>
            {prioridades.map((prio) => (
              <TouchableOpacity
                key={prio}
                style={[styles.opcion, nuevaPrioridad === prio && styles.opcionSelected]}
                onPress={() => onPrioridadChange(prio)}
              >
                <Text style={[
                  styles.opcionText,
                  nuevaPrioridad === prio && styles.opcionTextSelected,
                ]}>
                  {prio}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Campo de comentario libre */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Comentario</Text>
          <TextInput
            value={nuevoComentario}
            onChangeText={onComentarioChange}
            style={styles.textArea}
            placeholder="Agrega un comentario..."
            placeholderTextColor={C.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnGuardar} onPress={onGuardar}>
            <Ionicons name="checkmark-circle-outline" size={18} color={C.bg} />
            <Text style={styles.btnGuardarText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
            <Ionicons name="close-circle-outline" size={18} color={C.textSecondary} />
            <Text style={styles.btnCancelarText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: C.cardBorder,
    marginTop: SPACING.xs,
  },
  form: {
    gap: SPACING.md,
  },
  group: {
    gap: SPACING.xs,
  },
  groupLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  opciones: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  opcion: {
    flex: 1,
    paddingVertical: SPACING.sm + 1,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: C.cardBorder,
    alignItems: 'center',
    backgroundColor: C.surfaceAlt,
  },
  opcionSelected: {
    borderColor: C.accent,
    backgroundColor: 'rgba(29,205,254,0.12)',
  },
  opcionText: {
    color: C.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
  },
  opcionTextSelected: {
    color: C.accent,
    fontWeight: TYPOGRAPHY.bold,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: C.cardBorder,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm + 2,
    minHeight: 80,
    backgroundColor: C.surfaceAlt,
    color: C.textPrimary,
    fontSize: TYPOGRAPHY.sm,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  btnGuardar: {
    flex: 1,
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  btnGuardarText: {
    color: C.bg,
    fontWeight: TYPOGRAPHY.bold,
    fontSize: TYPOGRAPHY.md,
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: C.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  btnCancelarText: {
    color: C.textSecondary,
    fontWeight: TYPOGRAPHY.semibold,
    fontSize: TYPOGRAPHY.md,
  },
})
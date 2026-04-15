// 📋 ReportesPendientes.tsx
// Pantalla de gestión de reportes para empleados y jefes de área.
//
// Comportamiento según rol:
//   - Colaborador: ve sus reportes asignados y puede editar estado/prioridad/comentario.
//   - Jefe: ve reportes sin asignar y asignados (tabs), puede asignar/reasignar
//           colaboradores. La eliminación de reportes es exclusiva de autoridades
//           y se gestiona desde la pantalla TodosReportes.
//
// Subcomponentes:
//   - ImagenZoomModal: modal con zoom + pan para ver las fotos del reporte
//   - FormularioEdicion: formulario inline para editar estado, prioridad y comentario
//   - ConfirmModal: modal de confirmación con la misma estética del ToastContext
//     (fondo oscuro #0f1623, borde de color, punto indicador, texto claro).
//     Reemplaza Alert.alert para confirmaciones de asignación/reasignación,
//     manteniendo consistencia visual con el sistema de notificaciones de la app.

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import {
    GestureHandlerRootView,
    PanGestureHandler,
    PinchGestureHandler,
    State,
} from 'react-native-gesture-handler'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { colors, styles } from '../../src/components/reportesPendientesStyles'
import { useSesion } from '../../src/context/SesionContext'
import { useToast } from '../../src/context/ToastContext'
import {
    ESTADOS_VALIDOS,
    PRIORIDADES_VALIDAS,
    ReporteCompleto,
    asignarColaboradorAReporte,
    cargarColaboradoresDepto,
    cargarReportesAsignadosDepto,
    cargarReportesEmpleado,
    cargarReportesSinAsignar,
    getColorEstado,
    getColorPrioridad,
    guardarCambiosReporte,
    obtenerSesionEmpleado,
} from '../../src/services/empleado/ReportesPendientesService'
import { Empleado } from '../../src/types/Database'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'
import { router } from 'expo-router'

// ─── Constantes ───────────────────────────────────────────────────────────────

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')



/** Tabs disponibles para el jefe: reportes sin asignar o ya asignados */
type TabJefe = 'sinAsignar' | 'asignados'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Datos necesarios para mostrar el modal de confirmación */
interface ConfirmData {
  visible: boolean
  titulo: string
  mensaje: string
  labelConfirmar?: string
  /** Color del borde, punto indicador y botón — espeja la paleta del ToastContext */
  accentColor?: string
  onConfirm: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: ConfirmModal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Modal de confirmación con la misma estética del ToastContext:
 *   - Fondo oscuro: #0f1623  (igual que toastInfo)
 *   - Borde de color dinámico según acción (accentColor)
 *   - Punto indicador de color: igual que el dot del toast
 *   - Texto principal: #f1f1f1  |  Texto secundario: #a0aec0
 *   - Botón Cancelar con borde sutil (#2d3748)
 *   - Botón Confirmar con fondo del accentColor y texto oscuro
 *
 * Props:
 *  - visible       : controla si el modal está abierto
 *  - titulo        : título principal (junto al punto indicador)
 *  - mensaje       : descripción de la acción a confirmar
 *  - labelConfirmar: texto del botón de acción (por defecto "Confirmar")
 *  - accentColor   : color del borde, punto y botón (por defecto colors.accent)
 *  - onConfirm     : callback ejecutado al confirmar
 *  - onCancel      : callback ejecutado al cancelar o tocar fuera
 */



function ConfirmModal({
  visible,
  titulo,
  mensaje,
  labelConfirmar = 'Confirmar',
  accentColor,
  onConfirm,
  onCancel,
}: ConfirmData & { onCancel: () => void }) {
  const accent = accentColor ?? colors.accent

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}>
        <View style={{
          backgroundColor: '#0f1623',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: accent,
          padding: 24,
          width: '100%',
          maxWidth: 360,
          shadowColor: accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 12,
        }}>
          {/* Encabezado: punto indicador + título — mismo patrón que ToastBanner */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: accent,
              flexShrink: 0,
            }} />
            <Text style={{
              fontSize: 15,
              fontWeight: '700',
              color: '#f1f1f1',
              flexShrink: 1,
            }}>
              {titulo}
            </Text>
          </View>

          {/* Mensaje */}
          <Text style={{
            fontSize: 14,
            color: '#a0aec0',
            lineHeight: 20,
            marginBottom: 22,
            paddingLeft: 18,
          }}>
            {mensaje}
          </Text>

          {/* Acciones */}
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#2d3748',
              }}
            >
              <Text style={{ color: '#a0aec0', fontWeight: '600', fontSize: 14 }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: accent,
              }}
            >
              <Text style={{ color: '#0f1623', fontWeight: '700', fontSize: 14 }}>
                {labelConfirmar}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: ImagenZoomModal
// ─────────────────────────────────────────────────────────────────────────────

const ImagenZoomModal: React.FC<{ uri: string | null; onClose: () => void }> = ({ uri, onClose }) => {
  const scale          = useSharedValue(1)
  const lastScale      = useSharedValue(1)
  const translateX     = useSharedValue(0)
  const translateY     = useSharedValue(0)
  const lastTranslateX = useSharedValue(0)
  const lastTranslateY = useSharedValue(0)
  const pinchRef       = useRef(null)
  const panRef         = useRef(null)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  const onPinchEvent = (event: any) => {
    scale.value = Math.max(1, Math.min(lastScale.value * event.nativeEvent.scale, 5))
  }

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      lastScale.value = scale.value
      if (scale.value <= 1) {
        translateX.value     = withTiming(0)
        translateY.value     = withTiming(0)
        lastTranslateX.value = 0
        lastTranslateY.value = 0
      }
    }
  }

  const onPanEvent = (event: any) => {
    if (scale.value > 1) {
      translateX.value = lastTranslateX.value + event.nativeEvent.translationX
      translateY.value = lastTranslateY.value + event.nativeEvent.translationY
    }
  }

  const onPanStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      lastTranslateX.value = translateX.value
      lastTranslateY.value = translateY.value
    }
  }

  const handleClose = () => {
    scale.value          = withTiming(1)
    lastScale.value      = 1
    translateX.value     = withTiming(0)
    translateY.value     = withTiming(0)
    lastTranslateX.value = 0
    lastTranslateY.value = 0
    onClose()
  }

  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.96)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleClose}
            style={{ position: 'absolute', top: 48, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8 }}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <PanGestureHandler ref={panRef} simultaneousHandlers={pinchRef} onGestureEvent={onPanEvent} onHandlerStateChange={onPanStateChange} minPointers={1} maxPointers={2}>
            <Animated.View style={{ width: SCREEN_W, height: SCREEN_H * 0.8, justifyContent: 'center', alignItems: 'center' }}>
              <PinchGestureHandler ref={pinchRef} simultaneousHandlers={panRef} onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
                <Animated.View style={[animatedStyle, { width: SCREEN_W, height: SCREEN_H * 0.8 }]}>
                  {uri && <Image source={{ uri }} style={{ width: SCREEN_W, height: SCREEN_H * 0.8 }} resizeMode="contain" />}
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, position: 'absolute', bottom: 24 }}>
            Pellizca para zoom · Arrastra para moverte
          </Text>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: FormularioEdicion
// ─────────────────────────────────────────────────────────────────────────────

interface FormularioEdicionProps {
  nuevoEstado: string
  nuevaPrioridad: string
  nuevoComentario: string
  onEstadoChange: (v: string) => void
  onPrioridadChange: (v: string) => void
  onComentarioChange: (v: string) => void
  onGuardar: () => void
  onCancelar: () => void
}

const FormularioEdicion: React.FC<FormularioEdicionProps> = ({
  nuevoEstado, nuevaPrioridad, nuevoComentario,
  onEstadoChange, onPrioridadChange, onComentarioChange,
  onGuardar, onCancelar,
}) => (
  <View style={styles.editFormContainer}>
    <View style={styles.editForm}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Estado</Text>
        <View style={styles.pickerContainer}>
          {ESTADOS_VALIDOS.map((est) => (
            <TouchableOpacity
              key={est}
              style={[styles.pickerOption, nuevoEstado === est && styles.pickerOptionSelected]}
              onPress={() => onEstadoChange(est)}
            >
              <Text style={[styles.pickerOptionText, nuevoEstado === est && styles.pickerOptionTextSelected]}>
                {est}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Prioridad</Text>
        <View style={styles.pickerContainer}>
          {PRIORIDADES_VALIDAS.map((prio) => (
            <TouchableOpacity
              key={prio}
              style={[styles.pickerOption, nuevaPrioridad === prio && styles.pickerOptionSelected]}
              onPress={() => onPrioridadChange(prio)}
            >
              <Text style={[styles.pickerOptionText, nuevaPrioridad === prio && styles.pickerOptionTextSelected]}>
                {prio}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Comentario</Text>
        <TextInput
          value={nuevoComentario}
          onChangeText={onComentarioChange}
          style={styles.textArea}
          placeholder="Agrega un comentario..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={onGuardar}>
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.bg} />
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancelar}>
          <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal: ReportesPendientes
// ─────────────────────────────────────────────────────────────────────────────

const ReportesPendientes: React.FC = () => {
  const { showToast } = useToast()
  const { sesion }    = useSesion()

  useAndroidBack(() => {
    if (router.canGoBack()) {
      router.back()
    }
  })

  // ── Datos de sesión ───────────────────────────────────────────────────────
  const [esJefe, setEsJefe]                           = useState(false)
  const [empleadoActual, setEmpleadoActual]           = useState<string | null>(null)
  const [nombreJefe, setNombreJefe]                   = useState('')
  const [depto, setDepto]                             = useState('')

  // ── Datos de reportes ─────────────────────────────────────────────────────
  const [reportes, setReportes]                       = useState<ReporteCompleto[]>([])
  const [reportesAsignados, setReportesAsignados]     = useState<ReporteCompleto[]>([])
  const [colaboradores, setColaboradores]             = useState<Empleado[]>([])

  // ── Estado de UI ──────────────────────────────────────────────────────────
  const [loading, setLoading]       = useState(true)
  const [recargando, setRecargando] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [tabActivo, setTabActivo]   = useState<TabJefe>('sinAsignar')

  // ── Estado de edición inline ──────────────────────────────────────────────
  const [editando, setEditando]               = useState<string | null>(null)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [nuevaPrioridad, setNuevaPrioridad]   = useState('')
  const [nuevoEstado, setNuevoEstado]         = useState('')

  // ── Estado del modal de detalle/asignación ────────────────────────────────
  const [modalVisible, setModalVisible]               = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteCompleto | null>(null)
  const [imagenZoom, setImagenZoom]                   = useState<string | null>(null)

  // ── Estado del ConfirmModal (reemplaza Alert.alert) ───────────────────────
  const [confirm, setConfirm] = useState<ConfirmData>({
    visible: false,
    titulo: '',
    mensaje: '',
    labelConfirmar: 'Confirmar',
    accentColor: undefined,
    onConfirm: () => {},
  })

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Abre el ConfirmModal con estética de toast.
   * @param titulo         - Título del modal (junto al punto indicador)
   * @param mensaje        - Descripción de la acción
   * @param onConfirm      - Acción al confirmar
   * @param labelConfirmar - Texto del botón (por defecto "Confirmar")
   * @param accentColor    - Color del borde, punto y botón. Mapea las mismas
   *                         claves del ToastContext: success=#2dc653,
   *                         error=#e63946, info=#4895ef
   */
  const openConfirm = (
    titulo: string,
    mensaje: string,
    onConfirm: () => void,
    labelConfirmar = 'Confirmar',
    accentColor?: string,
  ) => setConfirm({ visible: true, titulo, mensaje, labelConfirmar, accentColor, onConfirm })

  /** Cierra el ConfirmModal sin ejecutar ninguna acción */
  const closeConfirm = () => setConfirm((p) => ({ ...p, visible: false }))

  useEffect(() => {
    if (sesion) iniciar()
  }, [sesion])

  // ── Inicialización ────────────────────────────────────────────────────────

  const iniciar = async () => {
    try {
      if (!sesion) return
      const sesionData = obtenerSesionEmpleado(sesion)
      const jefe       = sesionData.cargo === 'jefe'
      setEsJefe(jefe)
      setEmpleadoActual(sesionData.id)
      setNombreJefe(sesionData.nombre)
      setDepto(sesionData.depto)

      if (jefe) {
        const [colab, sinAsignar, asignados] = await Promise.all([
          cargarColaboradoresDepto(sesionData.depto),
          cargarReportesSinAsignar(),
          cargarReportesAsignadosDepto(sesionData.depto),
        ])
        setColaboradores(colab)
        setReportes(sinAsignar)
        setReportesAsignados(asignados)
      } else {
        const data = await cargarReportesEmpleado(sesionData.id)
        setReportes(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const recargar = async () => {
    setRecargando(true)
    try {
      if (esJefe) {
        const [sinAsignar, asignados] = await Promise.all([
          cargarReportesSinAsignar(),
          cargarReportesAsignadosDepto(depto),
        ])
        setReportes(sinAsignar)
        setReportesAsignados(asignados)
      } else if (empleadoActual) {
        const data = await cargarReportesEmpleado(empleadoActual)
        setReportes(data)
      }
    } catch (err: any) {
      showToast(err.message || 'Error al recargar', 'error')
    } finally {
      setRecargando(false)
    }
  }

  const abrirModal = (reporte: ReporteCompleto) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  /**
   * Muestra el ConfirmModal con colores del sistema toast:
   *   - Asignación nueva → azul info (#4895ef), igual que showToast('...','info')
   *   - Reasignación     → accent de la app, igual que showToast('...','success')
   * Reemplaza Alert.alert manteniendo coherencia visual total con ToastContext.
   */
  const confirmarAsignacion = (colaborador: Empleado) => {
    const yaAsignado  = !!reporteSeleccionado?.idEmpl
    const titulo      = yaAsignado ? 'Confirmar reasignación' : 'Confirmar asignación'
    const mensaje     = `¿${yaAsignado ? 'Reasignar' : 'Asignar'} este reporte a ${colaborador.nomEmpl} ${colaborador.apeEmpl}?`
    // Azul info para asignación nueva · accent (verde) para reasignación
    const accentColor = yaAsignado ? colors.accent : '#4895ef'

    openConfirm(titulo, mensaje, async () => {
      closeConfirm()
      try {
        await asignarColaboradorAReporte(
          reporteSeleccionado!.idReporte,
          colaborador.idEmpl,
          nombreJefe,
        )
        showToast(`Reporte ${yaAsignado ? 'reasignado' : 'asignado'} correctamente`, 'success')
        setModalVisible(false)
        recargar()
      } catch (err: any) {
        showToast(err.message || 'Error al asignar', 'error')
      }
    }, yaAsignado ? 'Reasignar' : 'Asignar', accentColor)
  }

  const iniciarEdicion = (reporte: ReporteCompleto) => {
    setEditando(reporte.idReporte)
    setNuevoComentario(reporte.comentReporte || '')
    setNuevaPrioridad(reporte.prioReporte)
    setNuevoEstado(reporte.estReporte)
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setNuevoComentario('')
    setNuevaPrioridad('')
    setNuevoEstado('')
  }

  const guardarCambios = async (idReporte: string) => {
    try {
      const reporteActual =
        reportes.find(r => r.idReporte === idReporte) ??
        reportesAsignados.find(r => r.idReporte === idReporte)
      if (!reporteActual) return
      await guardarCambiosReporte(idReporte, reporteActual, nuevoComentario, nuevaPrioridad, nuevoEstado)
      await recargar()
      cancelarEdicion()
    } catch (err: any) {
      showToast(err.message || 'Error al guardar', 'error')
    }
  }

  const getIniciales = (nombre?: string, apellido?: string) =>
    `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

  // ── Render de tarjeta ─────────────────────────────────────────────────────
  // La eliminación de reportes ha sido removida de esta pantalla.
  // Es una acción exclusiva de autoridades disponible en TodosReportes.

  const renderTarjeta = (reporte: ReporteCompleto, permitirReasignar = false) => {
    const enEdicion      = editando === reporte.idReporte
    const colorEstado    = getColorEstado(reporte.estReporte)
    const colorPrioridad = getColorPrioridad(reporte.prioReporte)

    return (
      <View key={reporte.idReporte} style={styles.card}>
        <View style={[styles.cardAccentBar, { backgroundColor: colorEstado }]} />

        {reporte.imgReporte?.length > 0 && (
          <TouchableOpacity activeOpacity={0.85} onPress={() => setImagenZoom(reporte.imgReporte[0])}>
            <Image source={{ uri: reporte.imgReporte[0] }} style={styles.cardImage} resizeMode="cover" />
            <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 6, padding: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="expand-outline" size={14} color="#FFF" />
              <Text style={{ color: '#FFF', fontSize: 11 }}>Ver foto</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.cardContent}>
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {getIniciales(reporte.usuario?.nomUser, reporte.usuario?.apeUser)}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.sectionLabel}>Reportado por</Text>
              <Text style={styles.userName}>{reporte.usuario?.nomUser} {reporte.usuario?.apeUser}</Text>
              <Text style={styles.userEmail}>{reporte.usuario?.correoUser}</Text>
            </View>
          </View>

          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{reporte.objeto?.nomObj || 'Sin título'}</Text>
            <Text style={styles.cardDate}>
              {new Date(reporte.fecReporte).toLocaleDateString('es-EC', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </Text>
          </View>

          <Text style={styles.cardDescription}>{reporte.descriReporte}</Text>

          <View style={styles.infoGrid}>
            {reporte.lugar && (
              <View style={styles.infoChip}>
                <View style={styles.infoChipIconWrap}>
                  <Ionicons name="location" size={15} color={colors.accent} />
                </View>
                <View style={styles.infoChipContent}>
                  <Text style={styles.infoChipLabel}>Ubicación</Text>
                  <Text style={styles.infoChipText}>
                    {reporte.lugar.nomLugar} · Piso {reporte.lugar.pisoLugar} · {reporte.lugar.aulaLugar}
                    {reporte.lugar.numAula ? ` ${reporte.lugar.numAula}` : ''}
                  </Text>
                </View>
              </View>
            )}
            {reporte.objeto && (
              <View style={styles.infoChip}>
                <View style={styles.infoChipIconWrap}>
                  <Ionicons name="cube-outline" size={15} color={colors.mint} />
                </View>
                <View style={styles.infoChipContent}>
                  <Text style={styles.infoChipLabel}>Objeto</Text>
                  <Text style={styles.infoChipText}>
                    {reporte.objeto.nomObj}{reporte.objeto.ctgobj ? ` · ${reporte.objeto.ctgobj}` : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.badgeWrap, { borderColor: colorEstado, backgroundColor: `${colorEstado}18` }]}>
              <View style={[styles.badgeDot, { backgroundColor: colorEstado }]} />
              <Text style={[styles.badgeText, { color: colorEstado }]}>{reporte.estReporte}</Text>
            </View>
            <View style={[styles.badgeWrap, { borderColor: colorPrioridad, backgroundColor: `${colorPrioridad}18` }]}>
              <View style={[styles.badgeDot, { backgroundColor: colorPrioridad }]} />
              <Text style={[styles.badgeText, { color: colorPrioridad }]}>{reporte.prioReporte}</Text>
            </View>
          </View>

          {reporte.empleado && (
            <View style={styles.assigneeContainer}>
              <Ionicons name="person-circle-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.assigneeText}>
                Asignado a{' '}
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  {reporte.empleado.nomEmpl} {reporte.empleado.apeEmpl}
                </Text>
              </Text>
            </View>
          )}

          {!enEdicion && reporte.comentReporte && (
            <View style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                <Ionicons name="chatbox-ellipses-outline" size={15} color={colors.mint} />
                <Text style={styles.commentLabel}>Comentario</Text>
              </View>
              <Text style={styles.commentText}>{reporte.comentReporte}</Text>
            </View>
          )}

          {enEdicion ? (
            <FormularioEdicion
              nuevoEstado={nuevoEstado}
              nuevaPrioridad={nuevaPrioridad}
              nuevoComentario={nuevoComentario}
              onEstadoChange={setNuevoEstado}
              onPrioridadChange={setNuevaPrioridad}
              onComentarioChange={setNuevoComentario}
              onGuardar={() => guardarCambios(reporte.idReporte)}
              onCancelar={cancelarEdicion}
            />
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editButton} onPress={() => iniciarEdicion(reporte)}>
                <Ionicons name="create-outline" size={17} color={colors.accent} />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>

              {/* Asignar / Reasignar — solo jefes */}
              {esJefe && (
                <TouchableOpacity style={styles.assignButton} onPress={() => abrirModal(reporte)}>
                  <Ionicons name="person-add-outline" size={17} color={colors.bg} />
                  <Text style={styles.assignButtonText}>
                    {permitirReasignar ? 'Reasignar' : 'Asignar'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    )
  }

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={[styles.editButton, { marginTop: 20 }]} onPress={iniciar}>
          <Ionicons name="refresh-outline" size={17} color={colors.accent} />
          <Text style={styles.editButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const reportesMostrados = esJefe
    ? (tabActivo === 'sinAsignar' ? reportes : reportesAsignados)
    : reportes

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={recargando}
            onRefresh={recargar}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>{esJefe ? 'Gestión de Reportes' : 'Mis Reportes'}</Text>

          {esJefe && (
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                onPress={() => setTabActivo('sinAsignar')}
                style={[styles.tab, tabActivo === 'sinAsignar' && styles.tabActivo]}
              >
                <Text style={[styles.tabTexto, tabActivo === 'sinAsignar' && styles.tabTextoActivo]}>
                  Sin asignar ({reportes.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTabActivo('asignados')}
                style={[styles.tab, tabActivo === 'asignados' && styles.tabActivo]}
              >
                <Text style={[styles.tabTexto, tabActivo === 'asignados' && styles.tabTextoActivo]}>
                  Asignados ({reportesAsignados.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {reportesMostrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={72} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                {esJefe
                  ? tabActivo === 'sinAsignar'
                    ? 'No hay reportes pendientes de asignación'
                    : 'No hay reportes asignados en tu departamento'
                  : 'No tienes reportes asignados'}
              </Text>
            </View>
          ) : (
            <View style={styles.reportesGrid}>
              {reportesMostrados.map((reporte) =>
                renderTarjeta(reporte, tabActivo === 'asignados')
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <ImagenZoomModal uri={imagenZoom} onClose={() => setImagenZoom(null)} />

      {/* Modal de selección de colaborador — solo jefes */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {reporteSeleccionado?.idEmpl ? 'Reasignar Colaborador' : 'Asignar Colaborador'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {colaboradores.length === 0 ? (
                <Text style={styles.modalEmptyText}>No hay colaboradores disponibles en este departamento</Text>
              ) : (
                colaboradores.map((colab) => (
                  <TouchableOpacity key={colab.idEmpl} onPress={() => confirmarAsignacion(colab)} style={styles.colaboradorItem}>
                    <View style={styles.colaboradorAvatar}>
                      <Text style={styles.colaboradorAvatarText}>
                        {getIniciales(colab.nomEmpl, colab.apeEmpl)}
                      </Text>
                    </View>
                    <View style={styles.colaboradorInfo}>
                      <Text style={styles.colaboradorNombre}>{colab.nomEmpl} {colab.apeEmpl}</Text>
                      <Text style={styles.colaboradorCorreo}>{colab.correoEmpl}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ConfirmModal con estética de toast — fondo oscuro, borde de color, punto indicador */}
      <ConfirmModal
        visible={confirm.visible}
        titulo={confirm.titulo}
        mensaje={confirm.mensaje}
        labelConfirmar={confirm.labelConfirmar}
        accentColor={confirm.accentColor}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </View>
  )
}

export default ReportesPendientes


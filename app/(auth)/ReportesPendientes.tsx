// 📋 ReportesPendientes.tsx
// Pantalla de gestión de reportes para empleados y jefes de área.
//
// Comportamiento según rol:
//   - Colaborador: ve sus reportes asignados y puede editar estado/prioridad/comentario.
//   - Jefe: ve reportes sin asignar y asignados (tabs), puede asignar/reasignar
//           colaboradores y eliminar reportes.
//
// Subcomponentes:
//   - ImagenZoomModal: modal con zoom + pan para ver las fotos del reporte
//   - FormularioEdicion: formulario inline para editar estado, prioridad y comentario

import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
import { Ionicons } from '@expo/vector-icons'
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
import { styles, colors } from '../../src/components/reportesPendientesStyles'
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
  eliminarReporte,
} from '../../src/services/ReportesPendientesService'
import { Empleado } from '../../src/types/Database'
import { useToast } from '../../src/components/ToastContext'

// ─── Constantes ───────────────────────────────────────────────────────────────

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

/** Tabs disponibles para el jefe: reportes sin asignar o ya asignados */
type TabJefe = 'sinAsignar' | 'asignados'

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: ImagenZoomModal
// Modal de pantalla completa con zoom (pinch) y desplazamiento (pan)
// para ver las fotos adjuntas a un reporte en detalle.
// ─────────────────────────────────────────────────────────────────────────────
const ImagenZoomModal: React.FC<{ uri: string | null; onClose: () => void }> = ({ uri, onClose }) => {
  // ── Valores animados de zoom ──────────────────────────────────────────────
  const scale     = useSharedValue(1)
  const lastScale = useSharedValue(1)

  // ── Valores animados de posición ─────────────────────────────────────────
  const translateX     = useSharedValue(0)
  const translateY     = useSharedValue(0)
  const lastTranslateX = useSharedValue(0)
  const lastTranslateY = useSharedValue(0)

  const pinchRef = useRef(null)
  const panRef   = useRef(null)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  // ── Pinch: zoom desde donde están los dedos ──
  const onPinchEvent = (event: any) => {
    scale.value = Math.max(1, Math.min(lastScale.value * event.nativeEvent.scale, 5))
  }

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      lastScale.value = scale.value
      // Si vuelve a escala 1, resetea la posición al centro
      if (scale.value <= 1) {
        translateX.value = withTiming(0)
        translateY.value = withTiming(0)
        lastTranslateX.value = 0
        lastTranslateY.value = 0
      }
    }
  }

  // ── Pan: mover la imagen cuando está con zoom activo ──
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

  /**
   * Cierra el modal y resetea todos los valores de zoom y posición.
   */
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
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.96)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Botón cerrar */}
          <TouchableOpacity
            onPress={handleClose}
            style={{
              position: 'absolute', top: 48, right: 20,
              zIndex: 10, backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 20, padding: 8,
            }}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* PanGestureHandler + PinchGestureHandler combinados para zoom y movimiento */}
          <PanGestureHandler
            ref={panRef}
            simultaneousHandlers={pinchRef}
            onGestureEvent={onPanEvent}
            onHandlerStateChange={onPanStateChange}
            minPointers={1}
            maxPointers={2}
          >
            <Animated.View style={{ width: SCREEN_W, height: SCREEN_H * 0.8, justifyContent: 'center', alignItems: 'center' }}>
              <PinchGestureHandler
                ref={pinchRef}
                simultaneousHandlers={panRef}
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}
              >
                <Animated.View style={[animatedStyle, { width: SCREEN_W, height: SCREEN_H * 0.8 }]}>
                  {uri && (
                    <Image
                      source={{ uri }}
                      style={{ width: SCREEN_W, height: SCREEN_H * 0.8 }}
                      resizeMode="contain"
                    />
                  )}
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>

          <Text style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 12,
            position: 'absolute',
            bottom: 24,
          }}>
            Pellizca para zoom · Arrastra para moverte
          </Text>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: FormularioEdicion
// Formulario inline para que el colaborador/jefe edite estado,
// prioridad y comentario de un reporte sin salir de la pantalla.
// ─────────────────────────────────────────────────────────────────────────────

/** Props del formulario de edición de reporte */
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
  nuevoEstado,
  nuevaPrioridad,
  nuevoComentario,
  onEstadoChange,
  onPrioridadChange,
  onComentarioChange,
  onGuardar,
  onCancelar,
}) => (
  <View style={styles.editFormContainer}>
    <View style={styles.editForm}>

      {/* Selector de estado */}
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

      {/* Selector de prioridad */}
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

      {/* Campo de comentario libre */}
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

      {/* Botones de acción del formulario */}
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

/**
 * Pantalla de reportes pendientes para empleados y jefes.
 * Al montar, detecta el rol del empleado autenticado y carga
 * los reportes correspondientes (propios o del departamento).
 */
const ReportesPendientes: React.FC = () => {
  const { showToast } = useToast()

  // ── Datos de sesión ───────────────────────────────────────────────────────
  const [esJefe, setEsJefe]             = useState(false)
  const [empleadoActual, setEmpleadoActual] = useState<string | null>(null)
  const [nombreJefe, setNombreJefe]     = useState('')
  const [depto, setDepto]               = useState('')

  // ── Datos de reportes ─────────────────────────────────────────────────────
  const [reportes, setReportes]                   = useState<ReporteCompleto[]>([])
  const [reportesAsignados, setReportesAsignados] = useState<ReporteCompleto[]>([])
  const [colaboradores, setColaboradores]         = useState<Empleado[]>([])

  // ── Estado de UI ──────────────────────────────────────────────────────────
  const [loading, setLoading]     = useState(true)
  const [recargando, setRecargando] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [tabActivo, setTabActivo] = useState<TabJefe>('sinAsignar')

  // ── Estado de edición inline ──────────────────────────────────────────────
  const [editando, setEditando]           = useState<string | null>(null)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [nuevaPrioridad, setNuevaPrioridad]   = useState('')
  const [nuevoEstado, setNuevoEstado]         = useState('')

  // ── Estado del modal de asignación y zoom de imagen ───────────────────────
  const [modalVisible, setModalVisible]           = useState(false)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteCompleto | null>(null)
  const [imagenZoom, setImagenZoom]               = useState<string | null>(null)

  useEffect(() => { iniciar() }, [])

  // ── Inicialización ────────────────────────────────────────────────────────

  /**
   * Carga la sesión del empleado y los reportes correspondientes a su rol.
   * Para jefes: carga colaboradores, reportes sin asignar y asignados en paralelo.
   * Para colaboradores: carga solo los reportes propios.
   */
  const iniciar = async () => {
    try {
      const sesion = await obtenerSesionEmpleado()
      const jefe = sesion.cargo === 'jefe'
      setEsJefe(jefe)
      setEmpleadoActual(sesion.id)
      setNombreJefe(sesion.nombre)
      setDepto(sesion.depto)

      if (jefe) {
        const [colab, sinAsignar, asignados] = await Promise.all([
          cargarColaboradoresDepto(sesion.depto),
          cargarReportesSinAsignar(),
          cargarReportesAsignadosDepto(sesion.depto),
        ])
        setColaboradores(colab)
        setReportes(sinAsignar)
        setReportesAsignados(asignados)
      } else {
        const data = await cargarReportesEmpleado(sesion.id)
        setReportes(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Recarga los reportes según el rol activo.
   * Se activa por pull-to-refresh o después de mutaciones.
   */
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
      // Error de recarga — toast en lugar de Alert
      showToast(err.message || 'Error al recargar', 'error')
    } finally {
      setRecargando(false)
    }
  }

  /**
   * Abre el modal de selección de colaborador para el reporte dado.
   * @param reporte - Reporte al que se asignará un colaborador
   */
  const abrirModal = (reporte: ReporteCompleto) => {
    setReporteSeleccionado(reporte)
    setModalVisible(true)
  }

  /**
   * Solicita confirmación y asigna (o reasigna) un colaborador al reporte.
   * La confirmación usa Alert nativo porque requiere 2 botones (Cancelar / Confirmar).
   * Los errores del resultado se reportan vía toast.
   * @param colaborador - Empleado al que se asigna el reporte
   */
  const confirmarAsignacion = (colaborador: Empleado) => {
    const yaAsignado = !!reporteSeleccionado?.idEmpl
    // ⚠️ Alert se mantiene — confirmación destructiva con 2 botones
    Alert.alert(
      yaAsignado ? 'Confirmar reasignación' : 'Confirmar asignación',
      `¿${yaAsignado ? 'Reasignar' : 'Asignar'} este reporte a ${colaborador.nomEmpl} ${colaborador.apeEmpl}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await asignarColaboradorAReporte(
                reporteSeleccionado!.idReporte,
                colaborador.idEmpl,
                nombreJefe
              )
              // Éxito → toast global
              showToast(`Reporte ${yaAsignado ? 'reasignado' : 'asignado'} correctamente`, 'success')
              setModalVisible(false)
              recargar()
            } catch (err: any) {
              // Error → toast global
              showToast(err.message || 'Error al asignar', 'error')
            }
          },
        },
      ]
    )
  }

  /**
   * Activa el modo de edición inline para el reporte dado.
   * Pre-carga los valores actuales de estado, prioridad y comentario.
   * @param reporte - Reporte a editar
   */
  const iniciarEdicion = (reporte: ReporteCompleto) => {
    setEditando(reporte.idReporte)
    setNuevoComentario(reporte.comentReporte || '')
    setNuevaPrioridad(reporte.prioReporte)
    setNuevoEstado(reporte.estReporte)
  }

  /** Cancela la edición inline y limpia el estado del formulario */
  const cancelarEdicion = () => {
    setEditando(null)
    setNuevoComentario('')
    setNuevaPrioridad('')
    setNuevoEstado('')
  }

  /**
   * Guarda los cambios del formulario de edición en Supabase.
   * Muestra toast de error si la operación falla.
   * @param idReporte - ID del reporte a actualizar
   */
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
      // Error al guardar → toast global
      showToast(err.message || 'Error al guardar', 'error')
    }
  }

  /**
   * Solicita confirmación y elimina el reporte de la BD.
   * La confirmación usa Alert nativo porque es una acción destructiva con 2 botones.
   * Los errores del resultado se reportan vía toast.
   * @param idReporte - ID del reporte a eliminar
   */
  const confirmarEliminacion = (idReporte: string) => {
    // ⚠️ Alert se mantiene — confirmación destructiva con 2 botones (Cancelar / Eliminar)
    Alert.alert(
      'Eliminar reporte',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarReporte(idReporte)
              await recargar()
            } catch (err: any) {
              // Error al eliminar → toast global
              showToast(err.message || 'Error al eliminar', 'error')
            }
          },
        },
      ]
    )
  }

  /**
   * Genera las iniciales de nombre y apellido para los avatares.
   * @param nombre   - Primer nombre del empleado/usuario
   * @param apellido - Primer apellido del empleado/usuario
   */
  const getIniciales = (nombre?: string, apellido?: string) =>
    `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

  // ── Render de tarjeta de reporte ──────────────────────────────────────────

  /**
   * Renderiza la tarjeta completa de un reporte.
   * Incluye: foto (con zoom al tocar), datos del usuario, objeto, ubicación,
   * badges de estado/prioridad, colaborador asignado, comentario y acciones.
   *
   * @param reporte           - Reporte completo con relaciones cargadas
   * @param permitirReasignar - true si el botón de asignación debe decir "Reasignar"
   */
  const renderTarjeta = (reporte: ReporteCompleto, permitirReasignar = false) => {
    const enEdicion      = editando === reporte.idReporte
    const colorEstado    = getColorEstado(reporte.estReporte)
    const colorPrioridad = getColorPrioridad(reporte.prioReporte)

    return (
      <View key={reporte.idReporte} style={styles.card}>
        {/* Barra de acento de color según estado */}
        <View style={[styles.cardAccentBar, { backgroundColor: colorEstado }]} />

        {/* Foto del reporte — abre ImagenZoomModal al tocar */}
        {reporte.imgReporte?.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setImagenZoom(reporte.imgReporte[0])}
          >
            <Image
              source={{ uri: reporte.imgReporte[0] }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={{
              position: 'absolute', bottom: 8, right: 8,
              backgroundColor: 'rgba(0,0,0,0.45)',
              borderRadius: 6, padding: 4,
              flexDirection: 'row', alignItems: 'center', gap: 4,
            }}>
              <Ionicons name="expand-outline" size={14} color="#FFF" />
              <Text style={{ color: '#FFF', fontSize: 11 }}>Ver foto</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.cardContent}>

          {/* Sección del usuario que reportó */}
          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {getIniciales(reporte.usuario?.nomUser, reporte.usuario?.apeUser)}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.sectionLabel}>Reportado por</Text>
              <Text style={styles.userName}>
                {reporte.usuario?.nomUser} {reporte.usuario?.apeUser}
              </Text>
              <Text style={styles.userEmail}>{reporte.usuario?.correoUser}</Text>
            </View>
          </View>

          {/* Título del objeto y fecha */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{reporte.objeto?.nomObj || 'Sin título'}</Text>
            <Text style={styles.cardDate}>
              {new Date(reporte.fecReporte).toLocaleDateString('es-EC', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </Text>
          </View>

          <Text style={styles.cardDescription}>{reporte.descriReporte}</Text>

          {/* Chips de ubicación y objeto */}
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
                    {reporte.objeto.nomObj}
                    {reporte.objeto.ctgobj ? ` · ${reporte.objeto.ctgobj}` : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Badges de estado y prioridad */}
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

          {/* Colaborador asignado (si existe) */}
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

          {/* Comentario del colaborador (solo si no está en modo edición) */}
          {!enEdicion && reporte.comentReporte && (
            <View style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                <Ionicons name="chatbox-ellipses-outline" size={15} color={colors.mint} />
                <Text style={styles.commentLabel}>Comentario</Text>
              </View>
              <Text style={styles.commentText}>{reporte.comentReporte}</Text>
            </View>
          )}

          {/* Formulario de edición inline o botones de acción */}
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
              {/* Editar estado/prioridad/comentario */}
              <TouchableOpacity style={styles.editButton} onPress={() => iniciarEdicion(reporte)}>
                <Ionicons name="create-outline" size={17} color={colors.accent} />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>

              {/* Eliminar reporte — solo jefes */}
              {esJefe && (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: '#DC143C' }]}
                  onPress={() => confirmarEliminacion(reporte.idReporte)}
                >
                  <Ionicons name="trash-outline" size={17} color="#DC143C" />
                  <Text style={[styles.cancelButtonText, { color: '#DC143C' }]}>Eliminar</Text>
                </TouchableOpacity>
              )}

              {/* Asignar / Reasignar colaborador — solo jefes */}
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

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    )
  }

  // ── Error de inicialización ───────────────────────────────────────────────

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

  // Lista de reportes según tab activo (jefe) o todos (colaborador)
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
          <Text style={styles.title}>
            {esJefe ? 'Gestión de Reportes' : 'Mis Reportes'}
          </Text>

          {/* ── TABS (solo para jefes) ──────────────────────────────────────
              Sin asignar: reportes que aún no tienen colaborador.
              Asignados: reportes ya en progreso del departamento. ── */}
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

          {/* ── LISTA DE REPORTES o estado vacío ── */}
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

      {/* Modal de zoom para imágenes del reporte */}
      <ImagenZoomModal
        uri={imagenZoom}
        onClose={() => setImagenZoom(null)}
      />

      {/* ── MODAL DE SELECCIÓN DE COLABORADOR ──────────────────────────────
          Permite al jefe elegir a quién asignar o reasignar el reporte. ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
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

            {/* Lista de colaboradores disponibles en el departamento */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {colaboradores.length === 0 ? (
                <Text style={styles.modalEmptyText}>
                  No hay colaboradores disponibles en este departamento
                </Text>
              ) : (
                colaboradores.map((colab) => (
                  <TouchableOpacity
                    key={colab.idEmpl}
                    onPress={() => confirmarAsignacion(colab)}
                    style={styles.colaboradorItem}
                  >
                    <View style={styles.colaboradorAvatar}>
                      <Text style={styles.colaboradorAvatarText}>
                        {getIniciales(colab.nomEmpl, colab.apeEmpl)}
                      </Text>
                    </View>
                    <View style={styles.colaboradorInfo}>
                      <Text style={styles.colaboradorNombre}>
                        {colab.nomEmpl} {colab.apeEmpl}
                      </Text>
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
    </View>
  )
}

export default ReportesPendientes
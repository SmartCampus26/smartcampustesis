// 📸 PhotoReviewCard: Tarjeta profesional de revisión de foto con zoom
// Reemplaza SwipeCard — el usuario confirma, retoma o descarta con botones explícitos.

import { Check, RefreshCcw, X, ZoomIn, ZoomOut } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated2, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// ─── Props ────────────────────────────────────────────────────────────────────
interface PhotoReviewCardProps {
  photoUri: string;
  capturedAt?: Date;            // Hora de captura para el panel de detalles
  cameraFacing?: 'front' | 'back';
  onConfirm: () => void;        // Guardar en galería + reporte
  onRetake: () => void;         // Volver a la cámara
  onDiscard: () => void;        // Descartar sin guardar
}

// ─── Constantes de zoom ───────────────────────────────────────────────────────
const ZOOM_STEPS = [1, 1.5, 2, 2.5, 3];
const ZOOM_MIN   = ZOOM_STEPS[0];
const ZOOM_MAX   = ZOOM_STEPS[ZOOM_STEPS.length - 1];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(date: Date) {
  return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function PhotoReviewCard({
  photoUri,
  capturedAt = new Date(),
  cameraFacing = 'back',
  onConfirm,
  onRetake,
  onDiscard,
}: PhotoReviewCardProps) {

  // Zoom controlado por botones
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoomScale = useSharedValue(1);

  // Zoom por pellizco (pinch)
  const pinchScale    = useRef(new Animated.Value(1)).current;
  const lastPinchScale = useRef(1);

  // ── Botones de zoom ──────────────────────────────────────────────────────
  const handleZoomIn = () => {
    const next = Math.min(zoomIndex + 1, ZOOM_STEPS.length - 1);
    setZoomIndex(next);
    zoomScale.value = withSpring(ZOOM_STEPS[next], { damping: 80, stiffness: 300 });
  };

  const handleZoomOut = () => {
    const prev = Math.max(zoomIndex - 1, 0);
    setZoomIndex(prev);
    zoomScale.value = withSpring(ZOOM_STEPS[prev], { damping: 80, stiffness: 300 });
  };

  // ── Toque sobre la imagen: alterna 1x ↔ 2x ──────────────────────────────
  const handleTapImage = () => {
    const next = zoomIndex === 0 ? 2 : 0; // índice 0 = 1x, índice 2 = 2x
    setZoomIndex(next);
    zoomScale.value = withSpring(ZOOM_STEPS[next], { damping: 80, stiffness: 300 });
  };

  // ── Pinch gesture ────────────────────────────────────────────────────────
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const raw = lastPinchScale.current * event.nativeEvent.scale;
      const clamped = clamp(raw, ZOOM_MIN, ZOOM_MAX);
      lastPinchScale.current = clamped;
      // Sincroniza al step más cercano para los botones
      const closest = ZOOM_STEPS.reduce((prev, curr) =>
        Math.abs(curr - clamped) < Math.abs(prev - clamped) ? curr : prev
      );
      setZoomIndex(ZOOM_STEPS.indexOf(closest));
      zoomScale.value = withSpring(clamped, { damping: 80, stiffness: 300 });
      pinchScale.setValue(1);
    }
  };

  // ── Estilo animado de la imagen ──────────────────────────────────────────
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoomScale.value }],
  }));

  const currentZoomPct = `${Math.round(ZOOM_STEPS[zoomIndex] * 100)}%`;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <GestureHandlerRootView style={styles.root}>

      {/* ── Encabezado de sección ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>VISTA PREVIA</Text>
        <Text style={styles.sectionMeta}>{formatTime(capturedAt)}</Text>
      </View>

      {/* ── Marco de la foto con zoom ── */}
      <PinchGestureHandler
        onGestureEvent={onPinchGestureEvent}
        onHandlerStateChange={onPinchHandlerStateChange}
      >
        <Animated.View style={styles.photoFrame}>
          <TouchableOpacity activeOpacity={1} onPress={handleTapImage} style={styles.imageTouchable}>
            <Animated2.View style={[styles.imageWrapper, animatedImageStyle]}>
              <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            </Animated2.View>
          </TouchableOpacity>

          {/* Indicador de zoom activo */}
          <View style={styles.zoomBadge}>
            <Text style={styles.zoomBadgeText}>{currentZoomPct}</Text>
          </View>

          {/* Hint solo en zoom 1x */}
          {zoomIndex === 0 && (
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Toca para ampliar</Text>
            </View>
          )}
        </Animated.View>
      </PinchGestureHandler>

      {/* ── Controles de zoom ── */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={[styles.zoomBtn, zoomIndex === 0 && styles.zoomBtnDisabled]}
          onPress={handleZoomOut}
          disabled={zoomIndex === 0}
        >
          <ZoomOut size={18} color={zoomIndex === 0 ? 'rgba(47,69,92,0.3)' : '#2F455C'} />
        </TouchableOpacity>

        <View style={styles.zoomTrack}>
          {ZOOM_STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.zoomDot, i === zoomIndex && styles.zoomDotActive]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.zoomBtn, zoomIndex === ZOOM_STEPS.length - 1 && styles.zoomBtnDisabled]}
          onPress={handleZoomIn}
          disabled={zoomIndex === ZOOM_STEPS.length - 1}
        >
          <ZoomIn size={18} color={zoomIndex === ZOOM_STEPS.length - 1 ? 'rgba(47,69,92,0.3)' : '#2F455C'} />
        </TouchableOpacity>
      </View>

      {/* ── Panel de detalles ── */}
      <View style={styles.detailPanel}>
        <DetailRow label="Estado"        value="Lista para guardar" valueColor="#21D0B2" dot />
        <DetailRow label="Capturada"     value={formatTime(capturedAt)} />
        <DetailRow label="Cámara"        value={cameraFacing === 'back' ? 'Trasera' : 'Frontal'} />
        <DetailRow label="Almacenamiento" value="Galería + Reporte" last />
      </View>

      {/* ── Acciones ── */}
      <View style={styles.actions}>

        {/* Confirmar — acción principal */}
        <TouchableOpacity style={styles.btnConfirm} onPress={onConfirm} activeOpacity={0.85}>
          <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.btnConfirmText}>Confirmar y guardar</Text>
        </TouchableOpacity>

        {/* Secundarias — retomar y descartar */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btnSecondary, styles.btnRetake]} onPress={onRetake} activeOpacity={0.8}>
            <RefreshCcw size={16} color="#2F455C" />
            <Text style={styles.btnRetakeText}>Volver a tomar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnSecondary, styles.btnDiscard]} onPress={onDiscard} activeOpacity={0.8}>
            <X size={16} color="#e63946" strokeWidth={2.5} />
            <Text style={styles.btnDiscardText}>Descartar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </GestureHandlerRootView>
  );
}

// ─── Subcomponente: fila de detalle ───────────────────────────────────────────
function DetailRow({
  label, value, valueColor, dot, last,
}: {
  label: string; value: string; valueColor?: string; dot?: boolean; last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <Text style={styles.detailKey}>{label}</Text>
      <View style={styles.detailValueWrap}>
        {dot && <View style={styles.statusDot} />}
        <Text style={[styles.detailValue, valueColor ? { color: valueColor } : null]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    marginBottom: 20,
    gap: 12,
  },

  // ── Encabezado ─────────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2F455C',
    letterSpacing: 0.8,
  },
  sectionMeta: {
    fontSize: 11,
    color: '#6B88A0',
    fontWeight: '500',
  },

  // ── Marco de foto ──────────────────────────────────────────────────────────
  photoFrame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#e8f4fb',
    borderWidth: 0.5,
    borderColor: 'rgba(29,205,254,0.2)',
  },
  imageTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  zoomBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(29,205,254,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  zoomBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tapHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(47,69,92,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tapHintText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // ── Controles de zoom ──────────────────────────────────────────────────────
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(29,205,254,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomBtnDisabled: {
    borderColor: 'rgba(47,69,92,0.12)',
    backgroundColor: 'rgba(47,69,92,0.04)',
  },
  zoomTrack: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  zoomDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(29,205,254,0.25)',
  },
  zoomDotActive: {
    backgroundColor: '#1DCDFE',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Panel de detalles ──────────────────────────────────────────────────────
  detailPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(29,205,254,0.15)',
    paddingHorizontal: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(29,205,254,0.1)',
  },
  detailKey: {
    fontSize: 12,
    color: '#6B88A0',
    fontWeight: '500',
  },
  detailValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#21D0B2',
  },
  detailValue: {
    fontSize: 12,
    color: '#2F455C',
    fontWeight: '600',
  },

  // ── Botones de acción ──────────────────────────────────────────────────────
  actions: {
    gap: 10,
  },
  btnConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1DCDFE',
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 0.5,
  },
  btnRetake: {
    backgroundColor: 'rgba(47,69,92,0.06)',
    borderColor: 'rgba(47,69,92,0.2)',
  },
  btnRetakeText: {
    color: '#2F455C',
    fontSize: 13,
    fontWeight: '600',
  },
  btnDiscard: {
    backgroundColor: 'rgba(230,57,70,0.06)',
    borderColor: 'rgba(230,57,70,0.25)',
  },
  btnDiscardText: {
    color: '#e63946',
    fontSize: 13,
    fontWeight: '600',
  },
});
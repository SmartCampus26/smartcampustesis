// ─── ImagenZoomModal.tsx ──────────────────────────────────────────────────────
// Modal de pantalla completa con zoom (pinch) y desplazamiento (pan) para
// ver imágenes adjuntas a un reporte en detalle.
// Extraído del subcomponente local de ReportesPendientes.tsx.
// Requiere: react-native-gesture-handler y react-native-reanimated.
//
// USO:
//   <ImagenZoomModal
//     uri={imagenZoom}
//     onClose={() => setImagenZoom(null)}
//   />

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { useRef } from 'react'
import { Dimensions, Image, Modal, Text, TouchableOpacity, View } from 'react-native'
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

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ImagenZoomModalProps {
  /** URI de la imagen a mostrar. null = modal cerrado */
  uri: string | null
  /** Función ejecutada al cerrar el modal */
  onClose: () => void
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ImagenZoomModal({ uri, onClose }: ImagenZoomModalProps) {
  // ── Valores animados de zoom ────────────────────────────────────────────
  const scale     = useSharedValue(1)
  const lastScale = useSharedValue(1)

  // ── Valores animados de posición ────────────────────────────────────────
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

  // ── Pinch: zoom con los dedos ────────────────────────────────────────────
  const onPinchEvent = (event: any) => {
    scale.value = Math.max(1, Math.min(lastScale.value * event.nativeEvent.scale, 5))
  }

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      lastScale.value = scale.value
      // Si vuelve a escala 1, resetea la posición al centro
      if (scale.value <= 1) {
        translateX.value     = withTiming(0)
        translateY.value     = withTiming(0)
        lastTranslateX.value = 0
        lastTranslateY.value = 0
      }
    }
  }

  // ── Pan: mover la imagen con zoom activo ─────────────────────────────────
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

  /** Cierra el modal y resetea todos los valores de zoom y posición */
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
              position: 'absolute',
              top: 48,
              right: 20,
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* PanGestureHandler + PinchGestureHandler combinados */}
          <PanGestureHandler
            ref={panRef}
            simultaneousHandlers={pinchRef}
            onGestureEvent={onPanEvent}
            onHandlerStateChange={onPanStateChange}
            minPointers={1}
            maxPointers={2}
          >
            <Animated.View style={{
              width: SCREEN_W,
              height: SCREEN_H * 0.8,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <PinchGestureHandler
                ref={pinchRef}
                simultaneousHandlers={panRef}
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}
              >
                <Animated.View style={[animatedStyle, {
                  width: SCREEN_W,
                  height: SCREEN_H * 0.8,
                }]}>
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

          {/* Instrucción de uso */}
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
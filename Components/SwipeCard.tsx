// 🎯 SwipeCard: Tarjeta interactiva con gestos de deslizamiento
// Permite guardar o descartar una imagen mediante swipe horizontal
import * as React from 'react';
import { StyleSheet, View, Dimensions, Image, Text } from 'react-native';
// Manejo de gestos táctiles
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// Animaciones de alto rendimiento
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
// Iconos visuales
import { Heart, X, Camera } from 'lucide-react-native';

// Dimensiones de pantalla para cálculos de swipe y tamaño de tarjeta
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Distancia mínima para considerar un swipe válido
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

// Tamaño de la tarjeta: ancho fijo, alto limitado para que la barra superior siempre sea visible
const CARD_WIDTH  = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.52; // ← ajustado para dejar espacio arriba y abajo

//Props del componente SwipeCard
interface SwipeCardProps {
  photoUri?: string; // Imagen a mostrar en la tarjeta
  onSwipeLeft: () => void; // Acción al deslizar a la izquierda (guardar)
  onSwipeRight: () => void; // Acción al deslizar a la derecha (descartar)
  // Callback que informa la dirección activa mientras el usuario arrastra
  // 'left' = apuntando a guardar | 'right' = apuntando a descartar | null = sin dirección
  onSwipeDirectionChange?: (direction: 'left' | 'right' | null) => void;
}

/**
 * Componente SwipeCard
 * Renderiza una tarjeta interactiva que permite guardar o descartar
 * una imagen mediante gestos de deslizamiento (swipe).
 *
 * Los badges GUARDAR / DESCARTAR se renderizan FUERA de la tarjeta
 * para que la imagen nunca los tape.
 */
export default function SwipeCard({ photoUri, onSwipeLeft, onSwipeRight, onSwipeDirectionChange }: SwipeCardProps) {
  // Valores compartidos que controlan la posición de la tarjeta
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Rastrea la dirección actual para evitar llamadas redundantes al callback
  const currentDirection = useSharedValue<'left' | 'right' | null>(null);

  /**
   * Notifica al padre sobre la dirección activa.
   * Se ejecuta en el hilo JS mediante runOnJS.
   */
  const notifyDirection = (direction: 'left' | 'right' | null) => {
    onSwipeDirectionChange?.(direction);
  };

  /**
   * Gesto de arrastre (Pan)
   * Detecta el desplazamiento y decide la acción al soltar la tarjeta
   */
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Actualiza la posición de la tarjeta mientras se arrastra
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // Notifica la dirección activa solo cuando cambia, para no saturar el hilo JS
      if (event.translationX < -SWIPE_THRESHOLD / 2 && currentDirection.value !== 'left') {
        currentDirection.value = 'left';
        runOnJS(notifyDirection)('left');
      } else if (event.translationX > SWIPE_THRESHOLD / 2 && currentDirection.value !== 'right') {
        currentDirection.value = 'right';
        runOnJS(notifyDirection)('right');
      } else if (
        Math.abs(event.translationX) <= SWIPE_THRESHOLD / 2 &&
        currentDirection.value !== null
      ) {
        // Regresó al centro sin superar el umbral
        currentDirection.value = null;
        runOnJS(notifyDirection)(null);
      }
    })
    .onEnd((event) => {
      // Swipe a la izquierda → Guardar
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH);
        runOnJS(onSwipeLeft)();
      }
      // Swipe a la derecha → Descartar
      else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH);
        runOnJS(onSwipeRight)();
      }
      // Swipe insuficiente → Regresa al centro y limpia dirección
      else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        currentDirection.value = null;
        runOnJS(notifyDirection)(null);
      }
    });

  /**
   * Estilo animado de la tarjeta
   * Incluye traslación y rotación según la posición horizontal
   */
  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-30, 0, 30]
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  /**
   * Estilo del badge GUARDAR — flota sobre la tarjeta, esquina superior izquierda
   * Aparece progresivamente al deslizar a la izquierda
   */
  const saveStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1, 0.5, 0]
    );
    const scale = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1, 0.85, 0.7]
    );
    return { opacity, transform: [{ scale }] };
  });

  /**
   * Estilo del badge DESCARTAR — flota sobre la tarjeta, esquina superior derecha
   * Aparece progresivamente al deslizar a la derecha
   */
  const discardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 0.5, 1]
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0.7, 0.85, 1]
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    // El contenedor usa position: 'relative' para que los badges absolutos
    // se posicionen respecto a él, no respecto a la tarjeta con imagen
    <View style={styles.container}>

      {/* ── Tarjeta con imagen (se mueve con el gesto) ─────────────────── */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {/* Muestra la imagen capturada o un icono de cámara */}
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.iconContainer}>
              <Camera size={120} color="#34F5C5" strokeWidth={1.5} />
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* ── Badge GUARDAR — fuera de la tarjeta, siempre encima ────────── */}
      <Animated.View style={[styles.badge, styles.badgeSave, saveStyle]} pointerEvents="none">
        <Heart size={28} color="#FFFFFF" fill="#FFFFFF" />
        <Text style={styles.badgeText}>GUARDAR</Text>
      </Animated.View>

      {/* ── Badge DESCARTAR — fuera de la tarjeta, siempre encima ─────── */}
      <Animated.View style={[styles.badge, styles.badgeDiscard, discardStyle]} pointerEvents="none">
        <X size={28} color="#FFFFFF" strokeWidth={3} />
        <Text style={styles.badgeText}>DESCARTAR</Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT, // ← altura limitada, no cubre toda la pantalla
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(29, 205, 254, 0.15)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },

  // ── Badges flotantes (fuera de la tarjeta, no tapados por la imagen) ──
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    top: 20, // Alineado con la parte superior de la tarjeta
  },
  badgeSave: {
    left: 16,
    backgroundColor: '#21D0B2',
    shadowColor: '#21D0B2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeDiscard: {
    right: 16,
    backgroundColor: '#e63946',
    shadowColor: '#e63946',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
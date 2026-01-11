// 🎯 SwipeCard: Tarjeta interactiva con gestos de deslizamiento
import React from 'react';
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Heart, X, Camera } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeCardProps {
  photoUri?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * 🎯 Tarjeta con gestos de swipe para guardar o descartar fotos
 * 
 * Izquierda ❤️ = Guardar | Derecha ❌ = Descartar
 * Incluye animaciones fluidas y feedback visual en tiempo real
 */

export default function SwipeCard({ photoUri, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  // 📍 Valores compartidos para animaciones suaves
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 👆 Gesto de arrastre con lógica de decisión
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Actualizar posición mientras se arrastra
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Guardar: swipe izquierda
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH);
        runOnJS(onSwipeLeft)();
      }
      // Descartar: swipe derecha
      else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH);
        runOnJS(onSwipeRight)();
      }
      // Volver al centro
      else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // 🎨 Animación de la tarjeta con rotación dinámica
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

  // 💚 Overlay de corazón (guardar)
  const heartStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      [1, 0.5, 0]
    );
    return { opacity };
  });

  // ❌ Overlay de X (descartar)
  const xStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 0.5, 1]
    );
    return { opacity };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {/* 📸 Mostrar foto o placeholder */}
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.iconContainer}>
              <Camera size={120} color="#34F5C5" strokeWidth={1.5} />
            </View>
          )}

          {/* 💚 Indicador visual de guardar */}
          <Animated.View style={[styles.overlay, styles.leftOverlay, heartStyle]}>
            <Heart size={80} color="#34F5C5" fill="#34F5C5" />
          </Animated.View>

          {/* ❌ Indicador visual de descartar */}
          <Animated.View style={[styles.overlay, styles.rightOverlay, xStyle]}>
            <X size={80} color="#2F455C" strokeWidth={3} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.3,
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
    backgroundColor: 'linear-gradient(135deg, #1DCDFE 0%, #21D0B2 100%)',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  leftOverlay: {
    top: 80,
    left: 30,
    borderWidth: 4,
    borderColor: 'rgba(52, 245, 197, 0.4)',
  },
  rightOverlay: {
    top: 80,
    right: 30,
    borderWidth: 4,
    borderColor: 'rgba(47, 69, 92, 0.3)',
  },
});
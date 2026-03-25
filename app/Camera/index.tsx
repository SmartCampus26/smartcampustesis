// 🏠 index: Pantalla principal con cámara y gestos de swipe

import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { ArrowLeft, Camera, FlipHorizontal, RotateCcw } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeCard from '../../Components/SwipeCard';
import { useSaved } from '../../src/context/SavedContext';

export default function HomeScreen() {

  const { addSavedPhoto, clearSavedPhotos, savedPhotos } = useSaved();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions({ writeOnly: true });
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [showFeedback, setShowFeedback] = useState<'saved' | 'discarded' | null>(null);
  // ── Dirección activa mientras el usuario arrastra la tarjeta
  // null = sin arrastrar | 'left' = apuntando a guardar | 'right' = apuntando a descartar
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // ✅ Límite: solo se permite 1 foto guardada por reporte
  const hasReachedLimit = savedPhotos.length >= 1;

  const requestPermissions = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
        return false;
      }
    }
    if (!mediaPermission?.granted) {
      const { granted } = await requestMediaPermission();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería');
        return false;
      }
    }
    return true;
  };

  const handleOpenCamera = async () => {
    // Bloquear cámara si ya se guardó 1 foto
    if (hasReachedLimit) {
      Alert.alert(
        'Límite alcanzado',
        'Ya tienes una foto guardada para este reporte. Reinicia si deseas tomar otra.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    const hasPermissions = await requestPermissions();
    if (hasPermissions) setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) {
        setCurrentPhoto(photo.uri);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const handleSwipeLeft = async () => {
    if (!currentPhoto) return;
    try {
      await MediaLibrary.saveToLibraryAsync(currentPhoto);
      addSavedPhoto(currentPhoto);
      setSwipeDirection(null);
      setShowFeedback('saved');
      setTimeout(() => { setShowFeedback(null); setCurrentPhoto(null); }, 500);
    } catch (error) {
      console.error('Error al guardar foto:', error);
      Alert.alert('Error', 'No se pudo guardar la foto');
    }
  };

  const handleSwipeRight = () => {
    setSwipeDirection(null);
    setShowFeedback('discarded');
    setTimeout(() => { setShowFeedback(null); setCurrentPhoto(null); }, 500);
  };

  const handleReset = () => {
    clearSavedPhotos();
    setCurrentPhoto(null);
    setShowFeedback(null);
    setSwipeDirection(null);
    setShowCamera(false);
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  // ================= VISTA CÁMARA ACTIVA =================
  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={cameraType} />
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
            <FlipHorizontal size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
            <Text style={styles.closeButtonText}>✕ Cerrar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ================= VISTA PRINCIPAL =================
  return (
    <SafeAreaView style={styles.container}>

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>SmartCampus</Text>
        <Text style={styles.subtitle}>
          Almacenaremos la foto en tu celular para que tenga un respaldo
        </Text>
        <Text style={styles.photoCount}>{savedPhotos.length} fotos guardadas</Text>
      </View>

      {/* ── INSTRUCCIÓN DE SWIPE ────────────────────────────────────────────────
          Texto siempre visible debajo del header cuando hay foto pendiente.
          Cambia dinámicamente según hacia dónde arrastra el usuario.
          Los badges animados (GUARDAR / DESCARTAR) viven dentro de SwipeCard.
      ────────────────────────────────────────────────────────────────────── */}
      {currentPhoto && !showFeedback && (
        <View style={[
          styles.instructionBar,
          swipeDirection === 'left' && styles.instructionBarSave,
          swipeDirection === 'right' && styles.instructionBarDiscard,
        ]}>
          <Text style={[
            styles.instructionText,
            swipeDirection === 'left' && styles.instructionTextSave,
            swipeDirection === 'right' && styles.instructionTextDiscard,
          ]}>
            {swipeDirection === 'left'
              ? '💚 ¡Suelta para guardar!'
              : swipeDirection === 'right'
              ? '❌ ¡Suelta para descartar!'
              : '👆 Desliza la foto  ←guardar   descartar→'}
          </Text>
        </View>
      )}

      {/* Tarjeta con foto o estado vacío */}
      <View style={styles.cardContainer}>
        {currentPhoto ? (
          <SwipeCard
            photoUri={currentPhoto}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeDirectionChange={setSwipeDirection}
          />
        ) : (
          <View style={styles.emptyState}>
            <Camera size={100} color="#34F5C5" strokeWidth={1} />
            <Text style={styles.emptyText}>Captura el momento</Text>
            <Text style={styles.emptySubtext}>Toma una foto para continuar con el reporte</Text>
          </View>
        )}
      </View>

      {/* Feedback temporal */}
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {showFeedback === 'saved' ? '❤️ ¡Guardada en galería!' : '❌ Descartada'}
          </Text>
        </View>
      )}

      {/* Botones inferiores */}
      <View style={styles.footer}>
        {!currentPhoto && (
          <TouchableOpacity
            style={[styles.cameraButton, hasReachedLimit && styles.cameraButtonDisabled]}
            onPress={handleOpenCamera}
            disabled={hasReachedLimit}
          >
            <Camera size={24} color={hasReachedLimit ? 'rgba(255,255,255,0.4)' : '#FFFFFF'} />
            <Text style={[styles.buttonText, hasReachedLimit && styles.buttonTextDisabled]}>
              {hasReachedLimit ? 'Foto ya guardada' : 'Tomar Foto'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.footerRow}>
          {/* Botón volver al reporte */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#FFFFFF" />
            <Text style={styles.backText}>Volver al Reporte</Text>
          </TouchableOpacity>

          {/* Botón reiniciar */}
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={20} color="#FFFFFF" />
            <Text style={styles.resetText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9FF' },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(29, 205, 254, 0.15)',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 38,
    fontWeight: '800', color: '#1DCDFE', letterSpacing: -1, marginBottom: 8
  },
  subtitle: { fontSize: 14, color: '#2F455C', marginTop: 4, fontWeight: '500', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  photoCount: { fontSize: 13, color: '#2F455C', marginTop: 8, fontWeight: '600', backgroundColor: 'rgba(52, 245, 197, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(33, 208, 178, 0.2)' },

  // ── Barra de instrucción dinámica ────────────────────────────────────────────
  instructionBar: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 2,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(29, 205, 254, 0.2)',
    alignItems: 'center',
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  instructionBarSave: {
    backgroundColor: 'rgba(33, 208, 178, 0.12)',
    borderColor: '#21D0B2',
  },
  instructionBarDiscard: {
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
    borderColor: '#e63946',
  },
  instructionText: {
    fontSize: 13,
    color: '#2F455C',
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionTextSave: {
    color: '#21D0B2',
    fontSize: 15,
    fontWeight: '800',
  },
  instructionTextDiscard: {
    color: '#e63946',
    fontSize: 15,
    fontWeight: '800',
  },

  // ── Botón cámara deshabilitado ───────────────────────────────────────────────
  cameraButtonDisabled: {
    backgroundColor: 'rgba(29, 205, 254, 0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonTextDisabled: { color: 'rgba(255,255,255,0.5)' },

  // ── Resto de estilos originales ─────────────────────────────────────────────
  cardContainer: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 50 },
  emptyText: { fontSize: 24, fontWeight: '700', color: '#2F455C', marginTop: 24, letterSpacing: -0.5 },
  emptySubtext: { fontSize: 15, color: '#21D0B2', marginTop: 10, textAlign: 'center', lineHeight: 22 },
  feedbackContainer: { position: 'absolute', top: '50%', left: 0, right: 0, alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingVertical: 20, borderRadius: 20, marginHorizontal: 40, shadowColor: '#1DCDFE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10, borderWidth: 2, borderColor: 'rgba(52, 245, 197, 0.3)' },
  feedbackText: { fontSize: 24, fontWeight: '700', color: '#21D0B2', letterSpacing: -0.3 },
  footer: { padding: 24, alignItems: 'center', gap: 14 },
  footerRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  cameraButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1DCDFE', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 20, gap: 10, shadowColor: '#1DCDFE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10, minWidth: 200, justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  backButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#21D0B2', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, gap: 8, shadowColor: '#21D0B2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  backText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  resetButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2F455C', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, gap: 8, shadowColor: '#2F455C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  resetText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent' },
  flipButton: { position: 'absolute', top: 50, right: 24, backgroundColor: 'rgba(29, 205, 254, 0.9)', padding: 16, borderRadius: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  cameraControls: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
  captureButton: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: '#34F5C5', shadowColor: '#34F5C5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  captureButtonInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1DCDFE' },
  closeButton: { position: 'absolute', top: 50, left: 24, backgroundColor: 'rgba(47, 69, 92, 0.9)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  closeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
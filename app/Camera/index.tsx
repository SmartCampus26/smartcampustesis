// 🏠 index: Pantalla principal — cámara + revisión profesional de foto

import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { ArrowLeft, Camera, FlipHorizontal, RotateCcw } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PhotoReviewCard from '../../Components/Photoreviewcard';
import { useSaved } from '../../src/context/SavedContext';

export default function HomeScreen() {

  const { addSavedPhoto, clearSavedPhotos, savedPhotos } = useSaved();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions({ writeOnly: true });

  const [currentPhoto, setCurrentPhoto]   = useState<string | null>(null);
  const [capturedAt, setCapturedAt]       = useState<Date>(new Date());
  const [cameraFacing, setCameraFacing]   = useState<CameraType>('back');
  const [showCamera, setShowCamera]       = useState(false);
  const [showFeedback, setShowFeedback]   = useState<'saved' | 'discarded' | null>(null);

  const cameraRef = useRef<CameraView>(null);

  // ✅ Límite: solo se permite 1 foto guardada por reporte
  const hasReachedLimit = savedPhotos.length >= 1;

  // ─── Permisos ─────────────────────────────────────────────────────────────
  const requestPermissions = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara.');
        return false;
      }
    }
    if (!mediaPermission?.granted) {
      const { granted } = await requestMediaPermission();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería.');
        return false;
      }
    }
    return true;
  };

  // ─── Abrir cámara ────────────────────────────────────────────────────────
  const handleOpenCamera = async () => {
    if (hasReachedLimit) {
      Alert.alert(
        'Límite alcanzado',
        'Ya tienes una foto guardada para este reporte. Reinicia si deseas tomar otra.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    const ok = await requestPermissions();
    if (ok) setShowCamera(true);
  };

  // ─── Capturar foto ───────────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) {
        setCurrentPhoto(photo.uri);
        setCapturedAt(new Date());
        setShowCamera(false);
      }
    } catch {
      Alert.alert('Error', 'No se pudo tomar la foto. Inténtalo de nuevo.');
    }
  };

  // ─── Confirmar y guardar ─────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!currentPhoto) return;
    try {
      await MediaLibrary.saveToLibraryAsync(currentPhoto);
      addSavedPhoto(currentPhoto);
      setShowFeedback('saved');
      setTimeout(() => { setShowFeedback(null); setCurrentPhoto(null); }, 600);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la foto.');
    }
  };

  // ─── Volver a tomar ──────────────────────────────────────────────────────
  const handleRetake = () => {
    setCurrentPhoto(null);
    setShowCamera(true);
  };

  // ─── Descartar ───────────────────────────────────────────────────────────
  const handleDiscard = () => {
    setShowFeedback('discarded');
    setTimeout(() => { setShowFeedback(null); setCurrentPhoto(null); }, 600);
  };

  // ─── Reiniciar todo ──────────────────────────────────────────────────────
  const handleReset = () => {
    clearSavedPhotos();
    setCurrentPhoto(null);
    setShowFeedback(null);
    setShowCamera(false);
  };

  const toggleCameraFacing = () => {
    setCameraFacing(prev => (prev === 'back' ? 'front' : 'back'));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VISTA: CÁMARA ACTIVA
  // ═══════════════════════════════════════════════════════════════════════════
  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={cameraFacing} />
        <View style={styles.cameraOverlay}>
          {/* Voltear cámara */}
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <FlipHorizontal size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Botón de captura */}
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
          {/* Cerrar cámara */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
            <Text style={styles.closeButtonText}>✕ Cerrar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISTA: PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container}>

      {/* ── Encabezado ── */}
      <View style={styles.header}>
        <Text style={styles.title}>SmartCampus</Text>
        <Text style={styles.subtitle}>
          Almacenaremos la foto en tu celular para que tenga un respaldo
        </Text>
        <Text style={styles.photoCount}>{savedPhotos.length} fotos guardadas</Text>
      </View>

      {/* ── Contenido principal ── */}
      <View style={styles.body}>
        {currentPhoto ? (
          // Tarjeta de revisión profesional
          <PhotoReviewCard
            photoUri={currentPhoto}
            capturedAt={capturedAt}
            cameraFacing={cameraFacing === 'back' ? 'back' : 'front'}
            onConfirm={handleConfirm}
            onRetake={handleRetake}
            onDiscard={handleDiscard}
          />
        ) : (
          // Estado vacío
          <View style={styles.emptyState}>
            <Camera size={96} color="#34F5C5" strokeWidth={1} />
            <Text style={styles.emptyTitle}>Captura el momento</Text>
            <Text style={styles.emptySubtext}>
              Toma una foto para adjuntarla al reporte
            </Text>
          </View>
        )}
      </View>

      {/* ── Feedback temporal ── */}
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {showFeedback === 'saved' ? '✓ Guardada en galería' : '✕ Descartada'}
          </Text>
        </View>
      )}

      {/* ── Footer — solo visible cuando NO hay foto en revisión ── */}
      {!currentPhoto && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cameraButton, hasReachedLimit && styles.cameraButtonDisabled]}
            onPress={handleOpenCamera}
            disabled={hasReachedLimit}
          >
            <Camera size={22} color={hasReachedLimit ? 'rgba(255,255,255,0.4)' : '#FFFFFF'} />
            <Text style={[styles.buttonText, hasReachedLimit && styles.buttonTextDisabled]}>
              {hasReachedLimit ? 'Foto ya guardada' : 'Tomar foto'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={18} color="#FFFFFF" />
              <Text style={styles.backText}>Volver al Reporte</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <RotateCcw size={18} color="#FFFFFF" />
              <Text style={styles.resetText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9FF' },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(29,205,254,0.15)',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1DCDFE',
    letterSpacing: -1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#2F455C',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  photoCount: {
    fontSize: 12,
    color: '#2F455C',
    marginTop: 8,
    fontWeight: '600',
    backgroundColor: 'rgba(52,245,197,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(33,208,178,0.2)',
  },

  // ── Body ───────────────────────────────────────────────────────────────────
  body: { flex: 1 },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2F455C',
    letterSpacing: -0.5,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#21D0B2',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Feedback ───────────────────────────────────────────────────────────────
  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    left: 40,
    right: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(52,245,197,0.3)',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#21D0B2',
    letterSpacing: -0.3,
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DCDFE',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 18,
    gap: 10,
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
    minWidth: 190,
    justifyContent: 'center',
  },
  cameraButtonDisabled: {
    backgroundColor: 'rgba(29,205,254,0.3)',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  buttonTextDisabled: { color: 'rgba(255,255,255,0.45)' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21D0B2',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    gap: 6,
  },
  backText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F455C',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    gap: 6,
  },
  resetText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  // ── Cámara ─────────────────────────────────────────────────────────────────
  cameraOverlay: { flex: 1, backgroundColor: 'transparent' },
  flipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    backgroundColor: 'rgba(29,205,254,0.9)',
    padding: 14,
    borderRadius: 50,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#34F5C5',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1DCDFE',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    backgroundColor: 'rgba(47,69,92,0.9)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  closeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
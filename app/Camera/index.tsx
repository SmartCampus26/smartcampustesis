// 🏠 Camera/index.tsx — solo JSX, sin lógica de negocio.
// Lógica → useCamera | Estilos → cameraStyles

import { CameraView } from 'expo-camera'
import { ArrowLeft, Camera, FlipHorizontal, RotateCcw } from 'lucide-react-native'
import * as React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import PhotoReviewCard from '../../Components/Photoreviewcard'
import { styles } from '../../src/styles/camara/cameraStyles'
import { useCamera } from '../../src/hooks/camara/useCamera'

export default function CameraScreen() {
  const {
    cameraRef,
    currentPhoto, capturedAt, cameraFacing,
    showCamera, showFeedback,
    hasReachedLimit, savedPhotos,
    handleOpenCamera, handleTakePhoto,
    handleConfirm, handleRetake, handleDiscard,
    handleReset, handleBack, toggleCameraFacing, setShowCamera,
  } = useCamera()

  // ── Vista: cámara activa ──────────────────────────────────────────────────
  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={cameraFacing} />
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <FlipHorizontal size={28} color="#FFFFFF" />
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
    )
  }

  // ── Vista: principal ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Almacenaremos la foto en tu celular para que tenga un respaldo
        </Text>
        <Text style={styles.photoCount}>{savedPhotos.length} foto guardada</Text>
      </View>

      <View style={styles.body}>
        {currentPhoto ? (
          <PhotoReviewCard
            photoUri={currentPhoto}
            capturedAt={capturedAt}
            cameraFacing={cameraFacing === 'back' ? 'back' : 'front'}
            onConfirm={handleConfirm}
            onRetake={handleRetake}
            onDiscard={handleDiscard}
          />
        ) : (
          <View style={styles.emptyState}>
            <Camera size={96} color="#34F5C5" strokeWidth={1} />
            <Text style={styles.emptyTitle}>Captura el momento</Text>
            <Text style={styles.emptySubtext}>Toma una foto para adjuntarla al reporte</Text>
          </View>
        )}
      </View>

      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {showFeedback === 'saved' ? '✓ Guardada en galería' : '✕ Descartada'}
          </Text>
        </View>
      )}

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
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
  )
}
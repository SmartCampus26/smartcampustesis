// ─── useCamera.ts ─────────────────────────────────────────────────────────────
// Hook de Camera/index.tsx.
// Maneja permisos, captura, guardado y navegación.
// Al confirmar la foto → guarda → router.back() hacia CrearReporte.

import * as MediaLibrary from 'expo-media-library'
import { CameraType, useCameraPermissions } from 'expo-camera'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert } from 'react-native'
import { useSaved } from '../../context/SavedContext'

export function useCamera() {
  const { addSavedPhoto, clearSavedPhotos, savedPhotos } = useSaved()
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [mediaPermission, requestMediaPermission]   = MediaLibrary.usePermissions({ writeOnly: true })

  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)
  const [capturedAt, setCapturedAt]     = useState<Date>(new Date())
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back')
  const [showCamera, setShowCamera]     = useState(false)
  const [showFeedback, setShowFeedback] = useState<'saved' | 'discarded' | null>(null)

  const cameraRef = useRef<any>(null)

  // ✅ Límite: solo 1 foto por reporte
  const hasReachedLimit = savedPhotos.length >= 1

  // ── Permisos ──────────────────────────────────────────────────────────────

  const requestPermissions = async (): Promise<boolean> => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission()
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara.')
        return false
      }
    }
    if (!mediaPermission?.granted) {
      const { granted } = await requestMediaPermission()
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería.')
        return false
      }
    }
    return true
  }

  // ── Abrir cámara ──────────────────────────────────────────────────────────

  const handleOpenCamera = async () => {
    if (hasReachedLimit) {
      Alert.alert(
        'Límite alcanzado',
        'Ya tienes una foto guardada para este reporte. Reinicia si deseas tomar otra.',
        [{ text: 'Entendido' }]
      )
      return
    }
    const ok = await requestPermissions()
    if (ok) setShowCamera(true)
  }

  // ── Capturar foto ─────────────────────────────────────────────────────────

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 })
      if (photo) {
        setCurrentPhoto(photo.uri)
        setCapturedAt(new Date())
        setShowCamera(false)
      }
    } catch {
      Alert.alert('Error', 'No se pudo tomar la foto. Inténtalo de nuevo.')
    }
  }

  // ── Confirmar y guardar → redirige a CrearReporte ─────────────────────────

  const handleConfirm = async () => {
    if (!currentPhoto) return
    try {
      await MediaLibrary.saveToLibraryAsync(currentPhoto)
      addSavedPhoto(currentPhoto)
      setShowFeedback('saved')
      // Breve feedback visual y luego vuelve a CrearReporte
      setTimeout(() => {
        setShowFeedback(null)
        setCurrentPhoto(null)
        router.back()
      }, 600)
    } catch {
      Alert.alert('Error', 'No se pudo guardar la foto.')
    }
  }

  // ── Volver a tomar ────────────────────────────────────────────────────────

  const handleRetake = () => {
    setCurrentPhoto(null)
    setShowCamera(true)
  }

  // ── Descartar ─────────────────────────────────────────────────────────────

  const handleDiscard = () => {
    setShowFeedback('discarded')
    setTimeout(() => {
      setShowFeedback(null)
      setCurrentPhoto(null)
    }, 600)
  }

  // ── Reiniciar todo ────────────────────────────────────────────────────────

  const handleReset = () => {
    clearSavedPhotos()
    setCurrentPhoto(null)
    setShowFeedback(null)
    setShowCamera(false)
  }

  // ── Regresar al reporte ────────────────────────────────────────────────────────
  const handleBack = () => {
    router.back()
  }

  // ── Voltear cámara ────────────────────────────────────────────────────────

  const toggleCameraFacing = () =>
    setCameraFacing(prev => (prev === 'back' ? 'front' : 'back'))

  return {
    cameraRef,
    currentPhoto,
    capturedAt,
    cameraFacing,
    showCamera,
    showFeedback,
    hasReachedLimit,
    savedPhotos,
    handleOpenCamera,
    handleTakePhoto,
    handleConfirm,
    handleRetake,
    handleDiscard,
    handleReset,
    handleBack,
    toggleCameraFacing,
    setShowCamera,
  }
}
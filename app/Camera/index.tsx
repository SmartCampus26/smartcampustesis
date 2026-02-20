// 🏠 index: Pantalla principal con cámara y gestos de swipe

// Importa React y hooks necesarios para manejar estado y referencias
import React, { useState, useRef } from 'react';

// Importa componentes básicos de React Native
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';

// SafeAreaView evita que el contenido invada zonas como notch o barra superior
import { SafeAreaView } from 'react-native-safe-area-context';

// Importa la cámara de Expo y tipos relacionados
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

// Permite guardar fotos en la galería del dispositivo
import * as MediaLibrary from 'expo-media-library';

// Componente personalizado que permite hacer swipe izquierda/derecha
import SwipeCard from '../../Components/SwipeCard';

// Iconos usados en la interfaz
import { RotateCcw, Camera, FlipHorizontal } from 'lucide-react-native';

// Hook personalizado para acceder al contexto global de fotos guardadas
import { useSaved } from '../Camera/context/SavedContext';

// Permite abrir la galería del dispositivo
import * as ImagePicker from 'expo-image-picker';

/**
 * 🏠 Pantalla principal con cámara y swipe para guardar/descartar fotos
 * 
 * Las fotos guardadas se almacenan tanto en el contexto como en la galería
 */
export default function HomeScreen() {

  // Obtiene funciones y datos del contexto global
  // addSavedPhoto -> agrega foto al estado global
  // clearSavedPhotos -> limpia todas las fotos guardadas
  // savedPhotos -> arreglo con todas las fotos guardadas
  const { addSavedPhoto, clearSavedPhotos, savedPhotos } = useSaved();
  
  // Maneja permisos de cámara
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  // Maneja permisos de galería (writeOnly: true permite guardar pero no leer todo)
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions({
    writeOnly: true
  });
  
  // Estado que guarda la foto actual mostrada en pantalla
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  
  // Controla si la cámara está visible o no
  const [showCamera, setShowCamera] = useState(false);
  
  // Define si la cámara es frontal o trasera
  const [cameraType, setCameraType] = useState<CameraType>('back');
  
  // Muestra feedback visual temporal (guardada o descartada)
  const [showFeedback, setShowFeedback] = useState<'saved' | 'discarded' | null>(null);
  
  // Referencia directa al componente CameraView
  // Permite ejecutar métodos como takePictureAsync()
  const cameraRef = useRef<CameraView>(null);

  // Función que solicita permisos necesarios
  const requestPermissions = async () => {

    // Si no hay permiso de cámara
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();

      // Si el usuario lo niega
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
        return false;
      }
    }
    
    // Si no hay permiso de galería
    if (!mediaPermission?.granted) {
      const { granted } = await requestMediaPermission();

      // Si el usuario lo niega
      if (!granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería');
        return false; 
      }
    }
    
    // Si todo está correcto
    return true;
  };

  // Abre la cámara si existen permisos
  const handleOpenCamera = async () => {
    const hasPermissions = await requestPermissions();

    if (hasPermissions) {
      setShowCamera(true);
    }
  };

  // Abre la galería del dispositivo
  const openGallery = async () => {

    // Solicita permiso para acceder a galería
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Si el usuario niega el permiso
    if (!permission.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería');
      return;
    }

    // Abre selector de imágenes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Solo imágenes
      quality: 1, // Máxima calidad
    });

    // Si el usuario seleccionó una imagen
    if (!result.canceled) {
      setCurrentPhoto(result.assets[0].uri);
    }
  };

  // Captura foto con la cámara
  const handleTakePhoto = async () => {

    // Si no existe referencia a la cámara, no hace nada
    if (!cameraRef.current) return;

    try {
      // Toma la foto con calidad 0.8
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      // Si la foto fue tomada correctamente
      if (photo) {
        setCurrentPhoto(photo.uri); // Guarda la URI
        setShowCamera(false); // Cierra la cámara
      }

    } catch (error) {

      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  /**
   * Swipe izquierda = Guardar foto
   * Guarda en galería y en el contexto global
   */
  const handleSwipeLeft = async () => {

    if (!currentPhoto) return;

    try {
      // Guarda la imagen en la galería del dispositivo
      await MediaLibrary.saveToLibraryAsync(currentPhoto);
      
      // Guarda la imagen en el estado global
      addSavedPhoto(currentPhoto);
      
      // Muestra mensaje temporal de guardado
      setShowFeedback('saved');
      
      // Después de 500ms limpia el estado
      setTimeout(() => {
        setShowFeedback(null);
        setCurrentPhoto(null);
      }, 500);

    } catch (error) {

      console.error('Error al guardar foto:', error);
      Alert.alert('Error', 'No se pudo guardar la foto');
    }
  };

  /**
   * Swipe derecha = Descartar foto
   * No guarda la foto, solo la elimina
   */
  const handleSwipeRight = () => {

    // Muestra mensaje temporal de descarte
    setShowFeedback('discarded');
    
    // Después de 500ms limpia la foto
    setTimeout(() => {
      setShowFeedback(null);
      setCurrentPhoto(null);
    }, 500);
  };

  // Reinicia completamente la aplicación
  const handleReset = () => {

    clearSavedPhotos();   // Borra fotos del contexto
    setCurrentPhoto(null); 
    setShowFeedback(null);
    setShowCamera(false);
  };

  // Cambia entre cámara frontal y trasera
  const toggleCameraType = () => {

    setCameraType(current => 
      (current === 'back' ? 'front' : 'back')
    );
  };

  // ================= VISTA CUANDO LA CÁMARA ESTÁ ACTIVA =================

  if (showCamera) {

    return (
      <SafeAreaView style={styles.container}>

        {/* Componente que muestra la cámara en pantalla completa */}
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={cameraType}
        />

        {/* Capa superpuesta encima de la cámara */}
        <View style={styles.cameraOverlay}>

          {/* Botón para cambiar cámara */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType}
          >
            <FlipHorizontal size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Botón circular para capturar */}
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePhoto}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>

          {/* Botón para cerrar cámara */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.closeButtonText}>✕ Cerrar</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  // ================= VISTA PRINCIPAL =================

  return (
    <SafeAreaView style={styles.container}>

      {/* Encabezado con título y contador */}
      <View style={styles.header}>
        <Text style={styles.title}>SmartCampus</Text>

        <Text style={styles.subtitle}>
          Almacenaremos la foto en tu celular para que tenga un respaldo
        </Text>

        <Text style={styles.photoCount}>
          {savedPhotos.length} fotos guardadas
        </Text>
      </View>

      {/* Contenedor principal de tarjeta */}
      <View style={styles.cardContainer}>

        {currentPhoto ? (

          // Si hay foto, muestra tarjeta con gestos swipe
          <SwipeCard
            photoUri={currentPhoto}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />

        ) : (

          // Si no hay foto, muestra estado vacío
          <View style={styles.emptyState}>
            <Camera size={100} color="#34F5C5" strokeWidth={1} />
            <Text style={styles.emptyText}>Captura el momento</Text>
            <Text style={styles.emptySubtext}>
              Toma una foto o selecciona una de tu galería
            </Text>
          </View>
        )}
      </View>

      {/* Mensaje temporal de guardado o descarte */}
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {showFeedback === 'saved'
              ? '❤️ ¡Guardada en galería!'
              : '❌ Descartada'}
          </Text>
        </View>
      )}

      {/* Botones inferiores */}
      <View style={styles.footer}>

        {/* Solo se muestran si no hay foto actual */}
        {!currentPhoto && (
          <>
            {/* Botón para abrir cámara */}
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={handleOpenCamera}
            >
              <Camera size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Tomar Foto</Text>
            </TouchableOpacity>

            {/* Botón para abrir galería */}
            <TouchableOpacity 
              style={styles.galleryBall} 
              onPress={openGallery}
            >
              <Text style={styles.galleryText}>Galería</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Botón para reiniciar */}
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleReset}
        >
          <RotateCcw size={20} color="#FFFFFF" />
          <Text style={styles.resetText}>Reiniciar</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(29, 205, 254, 0.15)',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1DCDFE',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#2F455C',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  photoCount: {
    fontSize: 13,
    color: '#2F455C',
    marginTop: 8,
    fontWeight: '600',
    backgroundColor: 'rgba(52, 245, 197, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(33, 208, 178, 0.2)',
  },
  cardContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2F455C',
    marginTop: 24,
    letterSpacing: -0.5,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#21D0B2',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 20,
    borderRadius: 20,
    marginHorizontal: 40,
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(52, 245, 197, 0.3)',
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#21D0B2',
    letterSpacing: -0.3,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DCDFE',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
    shadowColor: '#1DCDFE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    minWidth: 200,
    justifyContent: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F455C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#2F455C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Estilos de cámara
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    backgroundColor: 'rgba(29, 205, 254, 0.9)',
    padding: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#34F5C5',
    shadowColor: '#34F5C5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1DCDFE',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    backgroundColor: 'rgba(47, 69, 92, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  galleryBall: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#21D0B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 8,
    shadowColor: '#21D0B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  galleryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
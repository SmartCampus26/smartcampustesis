// 🔔 ToastContext.tsx
// Contexto global de notificaciones tipo toast.
// Reemplaza Alert.alert() en todas las vistas con un mensaje visual animado.
//
// USO:
//   1. <ToastProvider> ya está en app/_layout.tsx (envuelve toda la app)
//   2. En cualquier vista: const { showToast } = useToast()
//   3. Llama: showToast('Mensaje', 'success' | 'error' | 'info')

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
  } from 'react'
  import { Animated, StyleSheet, Text, View } from 'react-native'
  
  // ─── Tipos ────────────────────────────────────────────────────────────────────
  
  /** Variantes visuales del toast */
  export type ToastType = 'success' | 'error' | 'info'
  
  /** Forma del contexto expuesto al resto de la app */
  interface ToastContextValue {
    /**
     * Muestra un toast en pantalla.
     * @param message  - Texto a mostrar
     * @param type     - Variante visual: 'success' | 'error' | 'info'
     * @param duration - Milisegundos que permanece visible (default: 3500)
     */
    showToast: (message: string, type: ToastType, duration?: number) => void
  }
  
  // ─── Contexto ─────────────────────────────────────────────────────────────────
  
  const ToastContext = createContext<ToastContextValue | undefined>(undefined)
  
  // ─── Componente interno ToastBanner ──────────────────────────────────────────
  
  interface ToastState {
    visible: boolean
    message: string
    type: ToastType
  }
  
  /**
   * Toast visual animado. Se posiciona en la parte superior central de la pantalla.
   * Usa animación de opacidad + traslación vertical para entrada y salida suaves.
   */
  function ToastBanner({ visible, message, type }: ToastState) {
    const opacity    = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(-20)).current
  
    useEffect(() => {
      if (visible) {
        // Entrada: baja desde arriba con fade-in
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]).start()
      } else {
        // Salida: sube con fade-out
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 220, useNativeDriver: true }),
        ]).start()
      }
    }, [visible])
  
    // Color del punto indicador según tipo
    const dotColor: Record<ToastType, string> = {
      success: '#2dc653',
      error:   '#e63946',
      info:    '#4895ef',
    }
  
    const containerStyle =
      type === 'success' ? styles.toastSuccess
      : type === 'error' ? styles.toastError
      : styles.toastInfo
  
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.toast, containerStyle, { opacity, transform: [{ translateY }] }]}
      >
        <View style={[styles.dot, { backgroundColor: dotColor[type] }]} />
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    )
  }
  
  // ─── Provider ─────────────────────────────────────────────────────────────────
  
  /**
   * Proveedor global del toast. Envuelve el layout raíz en app/_layout.tsx.
   */
  export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<ToastState>({
      visible: false,
      message: '',
      type: 'info',
    })
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
    /**
     * Muestra el toast. Si ya hay uno visible lo reemplaza inmediatamente.
     */
    const showToast = useCallback(
      (message: string, type: ToastType, duration = 3500) => {
        if (hideTimer.current) clearTimeout(hideTimer.current)
        setToast({ visible: true, message, type })
        hideTimer.current = setTimeout(
          () => setToast((prev) => ({ ...prev, visible: false })),
          duration
        )
      },
      []
    )
  
    return (
      <ToastContext.Provider value={{ showToast }}>
        {children}
        {/* ToastBanner vive fuera del árbol de navegación para estar siempre encima */}
        <ToastBanner visible={toast.visible} message={toast.message} type={toast.type} />
      </ToastContext.Provider>
    )
  }
  
  // ─── Hook ─────────────────────────────────────────────────────────────────────
  
  /**
   * Hook para acceder al toast global desde cualquier vista o componente.
   *
   * @example
   * const { showToast } = useToast()
   *
   * // En vez de: Alert.alert('Error', 'No se pudo guardar')
   * showToast('No se pudo guardar', 'error')
   *
   * // En vez de: Alert.alert('Éxito', 'Guardado correctamente')
   * showToast('Guardado correctamente', 'success')
   */
  export function useToast(): ToastContextValue {
    const context = useContext(ToastContext)
    if (!context) {
      throw new Error('❌ useToast debe usarse dentro de <ToastProvider>')
    }
    return context
  }
  
  // ─── Estilos ──────────────────────────────────────────────────────────────────
  
  const styles = StyleSheet.create({
    toast: {
      position: 'absolute',
      top: 60,
      alignSelf: 'center',
      left: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: 14,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
      zIndex: 9999,
    },
    toastSuccess: {
      backgroundColor: '#0d1f1a',
      borderColor: '#2dc653',
    },
    toastError: {
      backgroundColor: '#1a1a2e',
      borderColor: '#e63946',
    },
    toastInfo: {
      backgroundColor: '#0f1623',
      borderColor: '#4895ef',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      flexShrink: 0,
    },
    text: {
      color: '#f1f1f1',
      fontSize: 14,
      fontWeight: '500',
      flexShrink: 1,
      lineHeight: 20,
    },
  })
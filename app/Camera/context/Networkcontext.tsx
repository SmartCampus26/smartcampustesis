import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
  } from "react";
  import {
    View,
    Text,
    Animated,
    StyleSheet,
    Platform,
  } from "react-native";
  import NetInfo from "@react-native-community/netinfo";
  
  // ─── Tipos ────────────────────────────────────────────────────────────────────
  
  interface NetworkContextValue {
    isOnline: boolean;
  }
  
  const NetworkContext = createContext<NetworkContextValue>({ isOnline: true });
  
  export const useNetwork = () => useContext(NetworkContext);
  
  // ─── Toast interno ────────────────────────────────────────────────────────────
  
  interface ToastProps {
    message: string;
    type: "error" | "success";
    visible: boolean;
  }
  
  function Toast({ message, type, visible }: ToastProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
  
    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 20,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible]);
  
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          type === "error" ? styles.toastError : styles.toastSuccess,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <View
          style={[
            styles.dot,
            { backgroundColor: type === "error" ? "#e63946" : "#2dc653" },
          ]}
        />
        <Text style={styles.toastText}>{message}</Text>
      </Animated.View>
    );
  }
  
  // ─── Provider ─────────────────────────────────────────────────────────────────
  
  export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(true);
    const [toast, setToast] = useState<{
      visible: boolean;
      message: string;
      type: "error" | "success";
    }>({ visible: false, message: "", type: "error" });
  
    const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toastShownRef = useRef(false);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
    const showToast = useCallback(
      (message: string, type: "error" | "success", duration = 6000) => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setToast({ visible: true, message, type });
        hideTimerRef.current = setTimeout(() => {
          setToast((prev) => ({ ...prev, visible: false }));
        }, duration);
      },
      []
    );
  
    const clearOfflineTimer = () => {
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
        offlineTimerRef.current = null;
      }
    };
  
    useEffect(() => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        const connected =
          state.isConnected === true && state.isInternetReachable !== false;
  
        setIsOnline(connected);
  
        if (!connected) {
          // Perdió conexión → iniciar timer de 1 minuto
          toastShownRef.current = false;
          clearOfflineTimer();
  
          offlineTimerRef.current = setTimeout(() => {
            // Verificar de nuevo por si volvió la conexión
            NetInfo.fetch().then((s) => {
              const stillOffline =
                s.isConnected === false || s.isInternetReachable === false;
  
              if (stillOffline && !toastShownRef.current) {
                toastShownRef.current = true;
                showToast(
                  "Sin conexión a internet. Verifica tu red.",
                  "error",
                  8000
                );
              }
            });
          }, 5_000); // ← cambia aquí si quieres otro tiempo (ms)
        } else {
          // Recuperó conexión
 // Recuperó conexión
 clearOfflineTimer();
 showToast("Conexión restaurada. ✓", "success", 4000); // ← siempre muestra
 toastShownRef.current = false;
          }
        }
      );
  
      return () => {
        unsubscribe();
        clearOfflineTimer();
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      };
    }, [showToast]);
  
    return (
      <NetworkContext.Provider value={{ isOnline }}>
        {children}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
        />
      </NetworkContext.Provider>
    );
  }
  
  // ─── Estilos ──────────────────────────────────────────────────────────────────
  
  const styles = StyleSheet.create({
    toast: {
      position: "absolute",
      top: "50%", 
      alignSelf: "center",   
      transform: [{ translateY: -30 }],
      left: 20,
      right: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 8,
      zIndex: 9999,
    },
    toastError: {
      backgroundColor: "#1a1a2e",
      borderWidth: 1,
      borderColor: "#e63946",
    },
    toastSuccess: {
      backgroundColor: "#0d1f1a",
      borderWidth: 1,
      borderColor: "#2dc653",
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    toastText: {
      color: "#f1f1f1",
      fontSize: 14,
      fontWeight: "500",
      flexShrink: 1,
    },
  });
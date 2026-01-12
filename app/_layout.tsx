// Componente Stack de Expo Router permite definir la navegación basada en pila
import { Stack } from "expo-router";
// Contenedor raíz necesario para habilitar gestos react-native-gesture-handler requiere envolver la app en este componente
import { GestureHandlerRootView } from "react-native-gesture-handler";
// Proveedor de contexto para el módulo de cámara maneja el estado global de las fotos guardadas en la aplicación
import { SavedProvider } from "./Camera/context/SavedContext";

/**
 * RootLayout
 * 
 * Estructura principal de la aplicación
 * - Inicializa la navegación con Stack
 * - Habilita el manejo de gestos a nivel global
 * - Provee el contexto de fotos guardadas a toda la app
 */
export default function RootLayout() {
  return (
    // Contenedor raíz obligatorio para el correcto funcionamiento de los gestos
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Proveedor de estado global para imágenes guardadas */}
      <SavedProvider>
        {/* Navegación principal de la aplicación */}
        <Stack />
      </SavedProvider>
    </GestureHandlerRootView>
  );
}

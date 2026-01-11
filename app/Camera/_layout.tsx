// Estructura de navegación por pestañas
// Importa el sistema de pestañas de Expo Router
import { Tabs } from 'expo-router';
// Íconos para las pestañas
import { Home, Heart } from 'lucide-react-native';
// Contexto que permite compartir las fotos guardadas entre pantallas
import { SavedProvider } from '../Camera/context/SavedContext';
// Componente necesario para manejar gestos deslizamientos, toques
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// componente principal de La Estructura de navegación 
export default function TabLayout() {
  return (
    // Contenedor raíz necesario para que funcionen correctamente los gestos
    // Wrapper necesario para gestos de swipe
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Proveedor de contexto: Permite que todas las pantallas accedan a las fotos guardadas */}
      <SavedProvider>
        {/* Navegación por pestañas */}
        <Tabs
          screenOptions={{
            // Color del ícono y texto cuando la pestaña está activa (azul)
            tabBarActiveTintColor: '#3B82F6',
            
            // Color del ícono y texto cuando la pestaña está inactiva (gris)
            tabBarInactiveTintColor: '#94A3B8',
            
            // Se oculta el encabezado superior
            // Ocultar header - usamos SafeAreaView en cada pantalla para el maneja de su propio encabezado
            headerShown: false,
            
            // Estilos de la barra inferior de navegación
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E0E7FF', // Borde azul claro
              paddingTop: 8,
              height: 60,
            },
            
            // Estilo del texto debajo de cada ícono
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          {/* ==== PESTAÑA 1: INICIO ==== */}
          {/* Tab 1: Pantalla Home (index.tsx) */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Inicio',
              tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
            }}
          />
          
          {/* ==== PESTAÑA 2: GUARDADOS ===== */}
          {/* Tab 2: Pantalla Guardados (saved.tsx) */}
          <Tabs.Screen
            name="Guardado"  
            options={{
              title: 'Guardados',
              tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
            }}
          />
        </Tabs>
      </SavedProvider>
    </GestureHandlerRootView>
  );
}
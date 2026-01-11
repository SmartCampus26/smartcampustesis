// Se importa el componente Tabs para navegación por pestañas
import { Tabs } from 'expo-router'
// Se importa Íconos de Ionicons
import { Ionicons } from '@expo/vector-icons'

// Estructura de navegación del Docente
// Organiza las pantallas principales mediante pestañas
export default function DocenteLayout() {
  return (
    <Tabs
      // Configuración general de la barra inferior
      screenOptions={{
        // Color del ícono y texto activo
        tabBarActiveTintColor: '#21D0B2',
        // Color del ícono y texto inactivo
        tabBarInactiveTintColor: '#8B9BA8',
        // Estilos visuales de la barra de navegación
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E1E8ED',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        // Oculta el header superior
        headerShown: false,
      }}
    >
      {/* ===== PANTALLA: INICIO ===== */}
      <Tabs.Screen
        name="HomeDocente"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      {/* ===== PANTALLA: CÁMARA ===== */}
      <Tabs.Screen
        name="Camera"
        options={{
          title: 'Cámara',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      
      {/* ===== PANTALLA: CREAR REPORTE ===== */}
      <Tabs.Screen
        name="CrearReporte"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      
      {/* ==== PANTALLA: MIS REPORTES ===== */}
      <Tabs.Screen
        name="MisReportes"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="documents" size={size} color={color} />
          ),
        }}
      />
      
      {/* ===== PANTALLA: PERFIL ===== */}
      <Tabs.Screen
        name="ProfileDocente"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      
      {/* ===== PANTALLAS OCULTAS (SIN TAB) ===== */}
      {/* Detalle de reporte (acceso interno) */}
      <Tabs.Screen
        name="ReporteUsuario"
        options={{
          href: null,
        }}
      />
      
      {/* Fotos guardadas desde la cámara */}
      <Tabs.Screen
        name="saved"
        options={{
          href: null, // Fotos guardadas (accesible desde la cámara)
        }}
      />
    </Tabs>
  )
}
// Sistema de navegación por pestañas de Expo Router
// Permite organizar la interfaz en secciones accesibles desde una barra inferior
import { Tabs } from 'expo-router'
// Conjunto de íconos vectoriales usados en la barra de navegación
// Se utilizan para representar visualmente cada sección de la interfaz
import { Ionicons } from '@expo/vector-icons'

/**
 * AutoridadesLayout
 * 
 * Componente contenedor de navegación para el módulo de autoridades / empleados.
 * Define una barra de pestañas inferior con acceso a las principales funcionalidades:
 * - Inicio
 * - Perfil
 * - Búsqueda
 * - Reportes
 * - Creación de usuarios y empleados
 */
export default function AutoridadesLayout() {
  return (
    <Tabs
      screenOptions={{
        // Colores activos e inactivos de los íconos
        tabBarActiveTintColor: '#1DCDFE',
        tabBarInactiveTintColor: '#8B9BA8',
        // Estilos generales de la barra inferior
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          marginBottom: 20,
        },
        // Estilo del texto debajo de cada ícono
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        // Estilos del encabezado superior
        headerStyle: {
          backgroundColor: '#2F455C',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Pantalla principal */}
      <Tabs.Screen
        name="HomeEmpleado"
        options={{
          title: 'Inicio',
          headerTitle: 'Panel de Empleados',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Perfil del empleado */}
      <Tabs.Screen
        name="ProfileEmpleado"
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* Búsqueda de usuarios y empleados */}
      <Tabs.Screen
        name="ListadoEmpleado"
        options={{
          title: 'Buscador',
          headerTitle: 'Búsqueda de Usuario/Empleado',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* Gestión de reportes */}
      <Tabs.Screen
        name="ReportesPendientes"
        options={{
          title: 'Reportes',
          headerTitle: 'Mis Reportes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="CrearMenu"
        options={{
          title: 'Crear',
          headerTitle: 'Crear Usuario/Empleado',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} />
          ),
        }}
      /> 
      

      {/* Pantallas ocultas de la barra de tabs pero accesibles */}
      {/* Creación de usuarios o empleados */}
      <Tabs.Screen
        name="UsuarioNuevo"
        options={{
          href: null,
          headerTitle: 'Nuevo Usuario',
        }}
      />
      
      <Tabs.Screen
        name="EmpleadoNuevo"
        options={{
          href: null,
          headerTitle: 'Nuevo Empleado',
        }}
      />
    </Tabs>
  )
}
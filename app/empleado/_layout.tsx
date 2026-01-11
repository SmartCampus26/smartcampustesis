import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function AutoridadesLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1DCDFE',
        tabBarInactiveTintColor: '#8B9BA8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#2F455C',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
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
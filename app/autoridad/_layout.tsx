// Importamos el componente Tabs desde expo-router.
// Tabs nos permite crear una navegación inferior con pestañas (tab navigator).
import { Tabs } from 'expo-router'

// Importamos la librería Ionicons para usar íconos en las pestañas.
// Es parte de @expo/vector-icons.
import { Ionicons } from '@expo/vector-icons'


// Exportamos por defecto la función AutoridadesLayout.
// Esta función define la estructura de navegación por pestañas
// para el módulo o sección de "Autoridades".
export default function AutoridadesLayout() {

  // Retornamos el componente Tabs, que contendrá todas las pantallas
  // que aparecerán en la barra inferior de navegación.
  return (
    <Tabs

      // screenOptions permite definir configuraciones generales
      // que se aplicarán a TODAS las pantallas dentro de Tabs.
      screenOptions={{

        // Color del ícono y texto cuando la pestaña está activa (seleccionada)
        tabBarActiveTintColor: '#1DCDFE',

        // Color del ícono y texto cuando la pestaña está inactiva
        tabBarInactiveTintColor: '#8B9BA8',

        // Estilos generales de la barra inferior
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // Color de fondo de la barra
          borderTopWidth: 1,          // Grosor del borde superior
          borderTopColor: '#E5E7EB',  // Color del borde superior
          height: 60,                 // Altura total de la barra
          paddingBottom: 8,           // Espacio interno inferior
          paddingTop: 8,              // Espacio interno superior
          marginBottom: 20,           // Margen externo inferior
        },

        // Estilos del texto debajo de cada ícono
        tabBarLabelStyle: {
          fontSize: 12,       // Tamaño de letra
          fontWeight: '600',  // Grosor de la letra
        },

        // Estilo del encabezado superior (header)
        headerStyle: {
          backgroundColor: '#2F455C', // Color de fondo del header
        },

        // Color del texto y botones dentro del header
        headerTintColor: '#FFFFFF',

        // Estilo del título del header
        headerTitleStyle: {
          fontWeight: 'bold', // Texto en negrita
        },
      }}
    >

      {/* ===================== PANTALLA INICIO ===================== */}
      <Tabs.Screen
        name="HomeAutoridad" // Nombre del archivo/pantalla

        options={{
          title: 'Inicio', // Texto que aparece debajo del ícono
          headerTitle: 'Panel de Autoridades', // Título del header superior

          // Función que define el ícono de la pestaña
          // Recibe automáticamente color y size
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* ===================== REASIGNAR EMPLEADO ===================== */}
      <Tabs.Screen
        name="ReasignarEmpleado"
        options={{
          title: 'Reasignar',
          headerTitle: 'Reasignar Empleado',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal" size={size} color={color} />
          ),
        }}
      />

      {/* ===================== PERFIL ===================== */}
      <Tabs.Screen
        name="ProfileAutoridad"
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* ===================== BUSCADOR ===================== */}
      <Tabs.Screen
        name="ListadoAutoridad"
        options={{
          title: 'Buscador',
          headerTitle: 'Búsqueda de Usuario/Empleado',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* ===================== MIS REPORTES ===================== */}
      <Tabs.Screen
        name="MisReportes"
        options={{
          title: 'Reportes',
          headerTitle: 'Mis Reportes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />

      {/* ===================== TODOS LOS REPORTES ===================== */}
      <Tabs.Screen
        name="TodosReportes"
        options={{
          title: 'Todos',
          headerTitle: 'Todos los Reportes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-open" size={size} color={color} />
          ),
        }}
      />

      {/* ===================== CREAR USUARIO/EMPLEADO ===================== */}
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

      {/* =======================================================
         PANTALLAS OCULTAS
         Estas pantallas NO aparecen en la barra de tabs
         pero sí se pueden navegar hacia ellas con router.push()
         ======================================================= */}

      <Tabs.Screen
        name="ReporteAutoridad"
        options={{
          href: null, // Esto evita que aparezca en la barra inferior
          headerTitle: 'Detalle de Reporte',
        }}
      />
      
      <Tabs.Screen
        name="UsuarioNuevo"
        options={{
          href: null, // Oculta la pestaña
          headerTitle: 'Nuevo Usuario',
        }}
      />
      
      <Tabs.Screen
        name="EmpleadoNuevo"
        options={{
          href: null, // Oculta la pestaña
          headerTitle: 'Nuevo Empleado',
        }}
      />

    </Tabs>
  )
}

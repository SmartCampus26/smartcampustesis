import { Ionicons } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Sesion } from '../../src/types/Database'
import { obtenerSesion } from '../../src/util/Session'
import { Platform } from 'react-native'




const COLORS = {
  autoridad:     { active: '#1DCDFE', header: '#2F455C' },
  sistemas:      { active: '#1DCDFE', header: '#2F455C' },
  mantenimiento: { active: '#1DCDFE', header: '#2F455C' },
  docente:       { active: '#21D0B2', header: 'transparent' },
}

export default function UnifiedLayout() {
  const [sesion, setSesion]   = useState<Sesion | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerSesion().then((data) => {
      setSesion(data)
      setCargando(false)
    })
  }, [])

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  if (!sesion) return <Redirect href="/" />

  // ─── Determina el rol unificado ───────────────────────────────────────────
  // Para empleados el rol viene de deptEmpl, para usuarios de sesion.rol
  const rol = sesion.tipo === 'empleado' ? sesion.data.deptEmpl : sesion.rol
  const color = COLORS[rol as keyof typeof COLORS] ?? COLORS.docente

  const isAutoridad = rol === 'autoridad'
  const isDocente   = rol === 'docente'
  const isEmpleado  = rol === 'mantenimiento' || rol === 'sistemas'
  const isSistemas  = rol === 'sistemas'

  const isWeb = Platform.OS === 'web'

  return (
    <Tabs
    screenOptions={{
      tabBarActiveTintColor:   color.active,
      tabBarInactiveTintColor: '#8B9BA8',
      tabBarStyle: Platform.OS === 'web'
        ? { display: 'none' }
        : {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            marginBottom: 20,
          },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' as const },
      headerShown:      !isDocente,
      headerStyle:      { backgroundColor: color.header },
      headerTintColor:  '#FFFFFF',
      headerTitleStyle: { fontWeight: 'bold' as const },
    }}
    >

      {/* ── INICIO (cada rol ve solo el suyo) ── */}
      <Tabs.Screen name="HomeAutoridad"
        options={{
          href: isAutoridad ? undefined : null,
          title: 'Inicio', headerTitle: 'Panel de Autoridades',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="HomeDocente"
        options={{
          href: isDocente ? undefined : null,
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="HomeEmpleado"
        options={{
          href: isEmpleado ? undefined : null,
          title: 'Inicio', headerTitle: 'Panel de Empleados',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />

      {/* ── EXCLUSIVAS AUTORIDAD ── */}
      <Tabs.Screen name="ReasignarEmpleado"
        options={{
          href: isAutoridad ? undefined : null,
          title: 'Reasignar', headerTitle: 'Reasignar Empleado',
          tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="TodosReportes"
        options={{
          href: isAutoridad ? undefined : null,
          title: 'Todos', headerTitle: 'Todos los Reportes',
          tabBarIcon: ({ color, size }) => <Ionicons name="folder-open" size={size} color={color} />,
        }}
      />

      {/* ── EXCLUSIVAS EMPLEADO ── */}
      <Tabs.Screen name="ReportesPendientes"
        options={{
          href: isEmpleado ? undefined : null,
          title: 'Reportes', headerTitle: 'Reportes Pendientes',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />,
        }}
      />

      {/* ── COMPARTIDAS AUTORIDAD + DOCENTE ── */}
      <Tabs.Screen name="ListadoReportes"
        options={{
          href: (isAutoridad || isDocente) ? undefined : null,
          title: 'Reportes', headerTitle: 'Mis Reportes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={isDocente ? 'documents' : 'document-text'} size={size} color={color} />
          ),
        }}
      />

      {/* ── COMPARTIDAS AUTORIDAD + EMPLEADO ── */}
      <Tabs.Screen name="Buscador"
        options={{
          href: (isAutoridad || isEmpleado) ? undefined : null,
          title: 'Buscador', headerTitle: 'Búsqueda de Usuario/Empleado',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />

      {/* ── CREAR — autoridad + solo SISTEMAS (no mantenimiento) ── */}
      <Tabs.Screen name="CrearMenu"
        options={{
          href: (isAutoridad || isSistemas) ? undefined : null,
          title: 'Crear', headerTitle: 'Crear Usuario/Empleado',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-add" size={size} color={color} />,
        }}
      />

      {/* ── PERFIL — todos ── */}
      <Tabs.Screen name="Profile"
        options={{
          title: 'Perfil', headerTitle: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />

      {/* ── OCULTAS — navegables con router.push() ── */}
      <Tabs.Screen name="UsuarioNuevo"   options={{ href: null, headerTitle: 'Nuevo Usuario' }} />
      <Tabs.Screen name="EmpleadoNuevo"  options={{ href: null, headerTitle: 'Nuevo Empleado' }} /> 
      <Tabs.Screen name="CrearReporte"   options={{ href: null, headerTitle: 'Crear Reporte' }} />

    </Tabs>
  )
}

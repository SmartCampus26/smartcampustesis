import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs, useSegments } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useSesion } from '../../src/context/SesionContext';
import LoadingScreen from '@/src/components/ui/LoadingScreen';

const COLORS = {
  autoridad:     { active: '#1DCDFE', header: '#2F455C' },
  sistemas:      { active: '#1DCDFE', header: '#2F455C' },
  mantenimiento: { active: '#1DCDFE', header: '#2F455C' },
  docente:       { active: '#21D0B2', header: 'transparent' },
}

export default function UnifiedLayout() {
  const { sesion, cargando } = useSesion()
  const segments = useSegments()
  
 // 1. Validaciones de carga y sesión
 if (cargando) return <LoadingScreen color="#1DCDFE" />;
 if (!sesion) return <Redirect href="/" />;
// 2. Determinar el rol y la pantalla actual
const rol = sesion.tipo === 'empleado' ? sesion.data.deptEmpl : sesion.rol;
const pantallaActual = segments[segments.length - 1]; 
const color = COLORS[rol as keyof typeof COLORS] ?? COLORS.docente;

// 3. Variables de permisos (ESTO ES LO QUE FALTABA)
const isAutoridad = rol === 'autoridad';
const isDocente   = rol === 'docente';
const isEmpleado  = rol === 'mantenimiento' || rol === 'sistemas';
const isSistemas  = rol === 'sistemas';

// 4. Mapa de Restricciones (Validación de Seguridad)
const restricciones: Record<string, boolean> = {
  'HomeAutoridad':     isAutoridad,
  'HomeDocente':       isDocente,
  'HomeEmpleado':      isEmpleado,
  'ReasignarEmpleado': isAutoridad,
  'ReportesPendientes':isEmpleado,
  'CrearMenu':         (isAutoridad || isSistemas),
};

// Redirección de seguridad si intenta entrar donde no debe (por ejemplo, con el botón atrás)
if (restricciones[pantallaActual] === false) {
  const homeDestino = 
    isAutoridad ? '/(auth)/HomeAutoridad' :
    isDocente   ? '/(auth)/HomeDocente'   : 
    '/(auth)/HomeEmpleado';

  return <Redirect href={homeDestino as any} />;
}

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
          title: 'Inicio', headerTitle: 'Panel de Coordinadores',
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
          title: 'Inicio', headerTitle: 'Panel de Colaboradores',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />

      {/* ── EXCLUSIVAS AUTORIDAD ── */}
      <Tabs.Screen name="ReasignarEmpleado"
        options={{
          href: isAutoridad ? undefined : null,
          title: 'Reasignar', headerTitle: 'Reasignar Colaborador',
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
          title: 'Buscador', headerTitle: 'Búsqueda de Usuario/Colaborador',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />

      {/* ── CREAR — autoridad + solo SISTEMAS (no mantenimiento) ── */}
      <Tabs.Screen name="CrearMenu"
        options={{
          href: (isAutoridad || isSistemas) ? undefined : null,
          title: 'Crear', headerTitle: 'Crear Usuario/Colaborador',
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
      <Tabs.Screen name="EmpleadoNuevo"  options={{ href: null, headerTitle: 'Nuevo Colaborador' }} />
      <Tabs.Screen name="CrearReporte"   options={{ href: null, headerTitle: 'Crear Reporte' }} />

      {/* ── NUEVA: Previsualización y descarga del PDF General ──
          Accesible por: jefes de área (sistemas/mantenimiento) y autoridad.
          Se navega con router.push('/PdfPreview') desde HomeEmpleado y HomeAutoridad.
      ── */}
      <Tabs.Screen name="PdfPreview" options={{ href: null, headerTitle: 'Informe General PDF' }} />

      {/* ── PDF Resumido — solo autoridad ──
          Tabla resumen de empleados con filtro por departamento.
          Se navega con router.push('/PdfResumidoPreview') desde HomeAutoridad.
      ── */}
      <Tabs.Screen name="PdfResumidoPreview" options={{ href: null, headerTitle: 'Informe Resumido PDF' }} />

      {/* ── PDF Personal — todos los empleados ──
          Previsualización del PDF personal con estadísticas y gráficos.
          Se navega con router.push('/PdfPersonalPreview') desde HomeEmpleado.
      ── */}
      <Tabs.Screen name="PdfPersonalPreview" options={{ href: null, headerTitle: 'Mi Informe PDF' }} />

    </Tabs>
  )
}
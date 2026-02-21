// ===============================
// IMPORTACIONES
// ===============================

// Funciones para obtener y eliminar la sesión almacenada localmente
import { obtenerSesion, eliminarSesion } from '../util/Session'

// Servicio que obtiene todos los reportes desde la base de datos
import { obtenerReportes } from './ReporteService'

// Tipos de base de datos utilizados para tipado fuerte
import { Usuario, Empleado, Reporte } from '../types/Database'


// ─────────────────────────────────────────────────────────────
// TIPOS E INTERFACES
// ─────────────────────────────────────────────────────────────

// Estadísticas calculadas para mostrar en el perfil
export interface ProfileStats {
  total: number        // Total de reportes asociados al usuario/empleado
  pendientes: number   // Reportes en estado "Pendiente"
  enProceso: number    // Reportes en estado "En Proceso"
  resueltos: number    // Reportes en estado "Resuelto"
}

// Configuración visual del badge según el rol
export interface BadgeConfig {
  icon: string   // Nombre del icono (Ionicons)
  label: string  // Texto que se mostrará como etiqueta
}

// Estructura completa del perfil que será consumida por la pantalla ProfileScreen
export interface ProfileData {
  nombre: string          // Nombre completo
  email: string           // Correo electrónico
  rol: string             // Rol o cargo
  depto: string | null    // Departamento (solo empleados)
  esEmpleado: boolean     // Indica si el perfil pertenece a un empleado
  badge: BadgeConfig      // Configuración visual del badge
  stats: ProfileStats     // Estadísticas calculadas dinámicamente
}


// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE BADGES SEGÚN ROL
// ─────────────────────────────────────────────────────────────

// Mapa que asigna icono y etiqueta según el rol del usuario
// Permite centralizar la configuración visual
const BADGE_CONFIG: Record<string, BadgeConfig> = {
  Autoridad: { icon: 'shield-checkmark', label: 'Autoridad' },
  Docente:   { icon: 'school',           label: 'Docente'   },
  Empleado:  { icon: 'settings-outline', label: 'Empleado'  },
}

// Badge por defecto si el rol no está definido en BADGE_CONFIG
const BADGE_DEFAULT: BadgeConfig = {
  icon: 'person-circle-outline',
  label: 'Usuario'
}


// ─────────────────────────────────────────────────────────────
// CARGA Y CONSTRUCCIÓN COMPLETA DEL PERFIL
// ─────────────────────────────────────────────────────────────

// Obtiene la sesión actual, calcula estadísticas
// y construye un objeto ProfileData listo para la interfaz
export async function cargarPerfil(): Promise<ProfileData | null> {

  // 1. Obtener sesión activa
  const sesion = await obtenerSesion()

  // Si no hay sesión, no se puede construir el perfil
  if (!sesion) return null

  // 2. Obtener todos los reportes desde el servicio
  const { data: reportesData } = await obtenerReportes()

  // 3. Filtrar únicamente los reportes que pertenecen al usuario actual
  // Si es usuario → comparar idUser
  // Si es empleado → comparar idEmpl
  const misReportes = (reportesData || []).filter((r: Reporte) =>
    sesion.tipo === 'usuario'
      ? r.idUser === sesion.id
      : r.idEmpl === sesion.id
  )

  // 4. Calcular estadísticas dinámicamente según el estado del reporte
  const stats: ProfileStats = {
    total:      misReportes.length,
    pendientes: misReportes.filter((r: Reporte) => r.estReporte === 'Pendiente').length,
    enProceso:  misReportes.filter((r: Reporte) => r.estReporte === 'En Proceso').length,
    resueltos:  misReportes.filter((r: Reporte) => r.estReporte === 'Resuelto').length,
  }

  // 5. Si la sesión corresponde a un EMPLEADO
  if (sesion.tipo === 'empleado') {

    // Convertir datos genéricos a tipo Empleado
    const emp = sesion.data as Empleado

    // Construir objeto ProfileData específico para empleado
    return {
      nombre:     `${emp.nomEmpl} ${emp.apeEmpl}`.trim(), // Nombre completo
      email:      emp.correoEmpl,
      rol:        emp.cargEmpl,
      depto:      emp.deptEmpl ?? null, // Puede no tener departamento
      esEmpleado: true,
      badge:      BADGE_CONFIG['Empleado'],
      stats,
    }
  }

  // 6. Si la sesión corresponde a un USUARIO normal
  const usr = sesion.data as Usuario

  return {
    nombre:     usr.nomUser,
    email:      usr.correoUser,
    rol:        usr.rolUser,
    depto:      null, // Usuarios no tienen departamento
    esEmpleado: false,
    // Busca badge según rol, si no existe usa el default
    badge: BADGE_CONFIG[usr.rolUser] ?? BADGE_DEFAULT,
    stats,
  }
}


// ─────────────────────────────────────────────────────────────
// CIERRE DE SESIÓN
// ─────────────────────────────────────────────────────────────

// Elimina la sesión almacenada localmente
// El logout de Supabase se maneja en otro servicio
export async function cerrarSesion(): Promise<void> {
  await eliminarSesion()
}
// Importa React y los hooks useState y useEffect.
import React, { useState, useEffect } from 'react'

// Importa componentes visuales de React Native.
import {
  View,               // Contenedor visual (similar a un div)
  Text,               // Texto en pantalla
  StyleSheet,         // Permite crear estilos
  ScrollView,         // Contenedor con scroll vertical
  TouchableOpacity,   // Botón presionable
  ActivityIndicator,  // Indicador de carga (spinner)
  Alert,              // Ventana emergente
} from 'react-native'

// Hook de navegación de Expo Router.
import { useRouter } from 'expo-router'

// Librería de íconos.
import { Ionicons } from '@expo/vector-icons'

// Funciones para manejar sesión del usuario.
import { obtenerSesion, eliminarSesion } from '../../src/util/Session'

// Servicio que permite obtener los reportes desde base de datos.
import { obtenerReportes } from '../../src/services/ReporteService'

// Tipos TypeScript que definen la estructura de datos.
import { Usuario, Empleado, Reporte } from '../../src/types/Database'

// Contexto personalizado para manejar fotos guardadas.
import { useSaved } from '../Camera/context/SavedContext'


// Componente principal del perfil de autoridad.
export default function ProfileAutoridad() {

  // Hook para navegación.
  const router = useRouter()

  // Estado que guarda la información del usuario o empleado logueado.
  const [usuario, setUsuario] = useState<Usuario | Empleado | null>(null)

  // Estado que indica si el perfil pertenece a usuario o empleado.
  const [tipoUsuario, setTipoUsuario] = useState<'usuario' | 'empleado'>('usuario')

  // Estado que controla si la pantalla está cargando.
  const [cargando, setCargando] = useState(true)
  
  // Accede a la función para limpiar fotos guardadas desde el contexto.
  const { clearSavedPhotos } = useSaved()

  // Estado que guarda estadísticas de reportes.
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    resueltos: 0,
  })


  // useEffect que se ejecuta una sola vez al montar el componente.
  useEffect(() => {
    cargarDatos()
  }, [])


  // Función que carga los datos del perfil y estadísticas.
  const cargarDatos = async () => {
    try {

      // Obtiene la sesión guardada.
      const sesion = await obtenerSesion()

      if (sesion) {

        // Guarda datos del usuario en el estado.
        setUsuario(sesion.data)

        // Guarda el tipo (usuario o empleado).
        setTipoUsuario(sesion.tipo)
        
        // Obtiene todos los reportes del sistema.
        const { data: reportesData } = await obtenerReportes()

        // Filtra solo los reportes del usuario actual.
        const misReportes = (reportesData || []).filter(
          (r: Reporte) =>
            sesion.tipo === 'usuario'
              ? r.idUser === sesion.id
              : r.idEmpl === sesion.id
        )

        // Calcula estadísticas según estado del reporte.
        setStats({
          total: misReportes.length,
          pendientes: misReportes.filter((r: Reporte) => r.estReporte === 'Pendiente').length,
          enProceso: misReportes.filter((r: Reporte) => r.estReporte === 'En Proceso').length,
          resueltos: misReportes.filter((r: Reporte) => r.estReporte === 'Resuelto').length,
        })
      }

    } catch (error: any) {
      // Muestra alerta si ocurre error.
      Alert.alert('Error', 'No se pudo cargar el perfil')
    } finally {
      // Siempre se ejecuta al finalizar.
      setCargando(false)
    }
  }


  // Función para cerrar sesión.
  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {

              // Elimina sesión almacenada.
              await eliminarSesion()

              // Limpia fotos guardadas del contexto.
              clearSavedPhotos()

              // Redirige al inicio.
              router.replace('/')

            } catch (error: any) {
              Alert.alert('Error', 'No se pudo cerrar la sesión')
            }
          },
        },
      ]
    )
  }


  // Funciones temporales (placeholders).
  const handleEditarPerfil = () => {
    Alert.alert('Próximamente', 'Función de editar perfil en desarrollo')
  }

  const handleCambiarContrasena = () => {
    Alert.alert('Próximamente', 'Función de cambiar contraseña en desarrollo')
  }

  const handleNotificaciones = () => {
    Alert.alert('Notificaciones', 'Configuración de notificaciones próximamente')
  }

  const handleAyuda = () => {
    Alert.alert('Ayuda y Soporte', 'Contacta al administrador para asistencia (098 467 2753)')
  }

  const handleAcercaDe = () => {
    Alert.alert(
      'Acerca de la App',
      'Sistema de Gestión de Reportes v1.0\n\nDesarrollado para la gestión eficiente de reportes municipales.',
      [{ text: 'OK' }]
    )
  }


  // Si está cargando muestra spinner.
  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }


  // ===============================
  // FUNCIONES AUXILIARES
  // ===============================

  // Obtiene nombre según tipo de usuario.
  const getNombre = () => {
    if (tipoUsuario === 'usuario') {
      return (usuario as Usuario)?.nomUser || 'Usuario'
    }
    const emp = usuario as Empleado
    return `${emp?.nomEmpl || ''} ${emp?.apeEmpl || ''}`.trim()
  }

  // Obtiene correo según tipo.
  const getEmail = () => {
    return tipoUsuario === 'usuario'
      ? (usuario as Usuario)?.correoUser
      : (usuario as Empleado)?.correoEmpl
  }

  // Obtiene rol o cargo según tipo.
  const getRol = () => {
    return tipoUsuario === 'usuario'
      ? (usuario as Usuario)?.rolUser
      : (usuario as Empleado)?.cargEmpl
  }


  // ===============================
  // RENDER PRINCIPAL
  // ===============================

  return (
    <ScrollView style={styles.container}>

      {/* HEADER con avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </View>
        </View>

        {/* Nombre */}
        <Text style={styles.userName}>{getNombre()}</Text>

        {/* Email */}
        <Text style={styles.userEmail}>{getEmail()}</Text>

        {/* Badge de autoridad */}
        <View style={styles.userBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#1DCDFE" />
          <Text style={styles.userBadgeText}>Autoridad</Text>
        </View>
      </View>


      {/* ================= ESTADÍSTICAS ================= */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Mis Estadísticas</Text>

        <View style={styles.statsGrid}>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFA726' }]}>
              {stats.pendientes}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#21D0B2' }]}>
              {stats.enProceso}
            </Text>
            <Text style={styles.statLabel}>En Proceso</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#34F5C5' }]}>
              {stats.resueltos}
            </Text>
            <Text style={styles.statLabel}>Resueltos</Text>
          </View>

        </View>
      </View>
      {/* ================= INFORMACIÓN PERSONAL ================= */}
      <View style={styles.section}>

        {/* Título de la sección */}
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        {/* Tarjeta que contiene los datos */}
        <View style={styles.infoCard}>

          {/* Fila: Nombre completo */}
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#2F455C" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Nombre Completo</Text>
              <Text style={styles.infoValue}>{getNombre()}</Text>
            </View>
          </View>

          {/* Línea divisora visual */}
          <View style={styles.divider} />

          {/* Fila: Correo electrónico */}
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#2F455C" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Correo Electrónico</Text>
              <Text style={styles.infoValue}>{getEmail()}</Text>
            </View>
          </View>

          {/* Línea divisora */}
          <View style={styles.divider} />

          {/* Fila: Cargo o Rol */}
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#2F455C" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Cargo/Rol</Text>
              <Text style={styles.infoValue}>{getRol()}</Text>
            </View>
          </View>

          {/* Si el tipo es empleado, muestra departamento adicional */}
          {tipoUsuario === 'empleado' && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#2F455C" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Departamento</Text>
                  <Text style={styles.infoValue}>
                    {(usuario as Empleado)?.deptEmpl || 'N/A'}
                  </Text>
                </View>
              </View>
            </>
          )}

        </View>
      </View>


      {/* ================= PREFERENCIAS ================= */}
      <View style={styles.section}>

        {/* Título */}
        <Text style={styles.sectionTitle}>Preferencias</Text>
        
        {/* Opción: Notificaciones */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleNotificaciones}
        >
          <View style={styles.menuItemLeft}>

            {/* Ícono con fondo de color */}
            <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="notifications-outline" size={20} color="#FFA726" />
            </View>

            <Text style={styles.menuItemText}>Notificaciones</Text>
          </View>

          {/* Flecha de navegación */}
          <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
        </TouchableOpacity>

      </View>


      {/* ================= SOPORTE ================= */}
      <View style={styles.section}>

        {/* Título */}
        <Text style={styles.sectionTitle}>Soporte</Text>
        
        {/* Opción: Ayuda */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleAyuda}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#E0F7FA' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#00ACC1" />
            </View>
            <Text style={styles.menuItemText}>Ayuda y Soporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
        </TouchableOpacity>

        {/* Opción: Acerca de */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleAcercaDe}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#AB47BC" />
            </View>
            <Text style={styles.menuItemText}>Acerca de</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
        </TouchableOpacity>

      </View>


      {/* ================= BOTÓN CERRAR SESIÓN ================= */}
      <View style={styles.section}>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleCerrarSesion}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </View>


      {/* ================= VERSIÓN ================= */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </View>

      {/* Espacio inferior para evitar que el contenido quede pegado */}
      <View style={styles.bottomSpacer} />

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2F455C',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1DCDFE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  userBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1DCDFE',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1DCDFE',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B9BA8',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E1E8ED',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B9BA8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8B9BA8',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#2F455C',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2F455C',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: '#FFE5E5',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#8B9BA8',
  },
  bottomSpacer: {
    height: 20,
  },
})
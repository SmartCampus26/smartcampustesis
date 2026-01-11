import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { obtenerSesion, eliminarSesion } from '../../src/util/Session'
import { obtenerReportes } from '../../src/services/ReporteService'
import { Usuario, Empleado, Reporte } from '../../src/types/Database'

export default function ProfileAutoridad() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | Empleado | null>(null)
  const [tipoUsuario, setTipoUsuario] = useState<'usuario' | 'empleado'>('usuario')
  const [cargando, setCargando] = useState(true)
  
  // Estadísticas de reportes
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    resueltos: 0,
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const sesion = await obtenerSesion()
      if (sesion) {
        setUsuario(sesion.data)
        setTipoUsuario(sesion.tipo)
        
        // Cargar estadísticas de reportes
        const { data: reportesData } = await obtenerReportes()
        const misReportes = (reportesData || []).filter(
          (r: Reporte) => sesion.tipo === 'usuario' ? r.idUser === sesion.id : r.idEmpl === sesion.id
        )

        setStats({
          total: misReportes.length,
          pendientes: misReportes.filter((r: Reporte) => r.estReporte === 'Pendiente').length,
          enProceso: misReportes.filter((r: Reporte) => r.estReporte === 'En Proceso').length,
          resueltos: misReportes.filter((r: Reporte) => r.estReporte === 'Resuelto').length,
        })
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el perfil')
    } finally {
      setCargando(false)
    }
  }

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
              await eliminarSesion()
              router.replace('/')
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo cerrar la sesión')
            }
          },
        },
      ]
    )
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

  if (cargando) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  // Obtener nombre y email según tipo de usuario
  const getNombre = () => {
    if (tipoUsuario === 'usuario') {
      return (usuario as Usuario)?.nomUser || 'Usuario'
    }
    const emp = usuario as Empleado
    return `${emp?.nomEmpl || ''} ${emp?.apeEmpl || ''}`.trim()
  }

  const getEmail = () => {
    return tipoUsuario === 'usuario'
      ? (usuario as Usuario)?.correoUser
      : (usuario as Empleado)?.correoEmpl
  }

  const getRol = () => {
    return tipoUsuario === 'usuario'
      ? (usuario as Usuario)?.rolUser
      : (usuario as Empleado)?.cargEmpl
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header con Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.userName}>{getNombre()}</Text>
        <Text style={styles.userEmail}>{getEmail()}</Text>
        <View style={styles.userBadge}>
          <Ionicons name="settings-outline" size={14} color="#21C0B2" />
          <Text style={styles.userBadgeText}>Empleado</Text>
        </View>
      </View>

      {/* Estadísticas */}
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

      {/* Información Personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#2F455C" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Nombre Completo</Text>
              <Text style={styles.infoValue}>{getNombre()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#2F455C" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Correo Electrónico</Text>
              <Text style={styles.infoValue}>{getEmail()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#2F455C" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Cargo/Rol</Text>
              <Text style={styles.infoValue}>{getRol()}</Text>
            </View>
          </View>

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


      {/* Preferencias */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleNotificaciones}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="notifications-outline" size={20} color="#FFA726" />
            </View>
            <Text style={styles.menuItemText}>Notificaciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
        </TouchableOpacity>
      </View>

      {/* Soporte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte</Text>
        
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

      {/* Botón de Cerrar Sesión */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleCerrarSesion}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Versión */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </View>

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
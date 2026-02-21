// Iconos de Expo para interfaz visual
import { Ionicons } from '@expo/vector-icons'

// Router para navegación entre pantallas
import { useRouter } from 'expo-router'

// Hooks principales de React
import React, { useEffect, useState } from 'react'

// Componentes base de React Native
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'

// Estilos del perfil
import { profileStyles as s } from '../../src/components/Profilestyles'

// Servicios para cargar perfil y cerrar sesión
import { cargarPerfil, cerrarSesion, ProfileData } from '../../src/services/Profileservice'

// Contexto para limpiar fotos guardadas (solo usuarios)
import { useSaved } from '../Camera/context/SavedContext'

export default function ProfileScreen() {
  const router = useRouter()
  const { clearSavedPhotos } = useSaved()

  // Estado que almacena los datos del perfil
  const [perfil, setPerfil] = useState<ProfileData | null>(null)

  // Estado que controla el indicador de carga
  const [cargando, setCargando] = useState(true)

  // Se ejecuta una sola vez al montar el componente
  // Carga los datos del perfil desde el servicio
  useEffect(() => {
    cargarPerfil()
      .then(setPerfil)
      .catch(() => Alert.alert('Error', 'No se pudo cargar el perfil'))
      .finally(() => setCargando(false))
  }, [])

  // Maneja el proceso de cierre de sesión
  // Muestra una alerta de confirmación antes de proceder
  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            // Cierra sesión en el servicio
            // Si el usuario no es empleado, limpia fotos guardadas
            // Redirige al login
            try {
              await cerrarSesion()
              if (!perfil?.esEmpleado) clearSavedPhotos()
              router.replace('/')
            } catch {
              Alert.alert('Error', 'No se pudo cerrar la sesión')
            }
          },
        },
      ]
    )
  }

  // Si está cargando o aún no hay perfil,
  // muestra un indicador de carga
  if (cargando || !perfil) {
    return (
      <View style={s.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  // Extrae los datos principales del perfil
  const { nombre, email, rol, depto, badge, stats } = perfil

  return (
    <ScrollView style={s.container}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.avatarContainer}>
          <View style={s.avatar}>
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </View>
        </View>
        <Text style={s.userName}>{nombre}</Text>
        <Text style={s.userEmail}>{email}</Text>
        <View style={s.userBadge}>
          <Ionicons name={badge.icon as any} size={14} color="#21C0B2" />
          <Text style={s.userBadgeText}>{badge.label}</Text>
        </View>
      </View>

      {/* ── Estadísticas ── */}
      <View style={s.statsCard}>
        <Text style={s.statsTitle}>Mis Estadísticas</Text>
        <View style={s.statsGrid}>
          <View style={s.statItem}>
            <Text style={s.statNumber}>{stats.total}</Text>
            <Text style={s.statLabel}>Total</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNumber, { color: '#FFA726' }]}>{stats.pendientes}</Text>
            <Text style={s.statLabel}>Pendientes</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNumber, { color: '#21D0B2' }]}>{stats.enProceso}</Text>
            <Text style={s.statLabel}>En Proceso</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNumber, { color: '#34F5C5' }]}>{stats.resueltos}</Text>
            <Text style={s.statLabel}>Resueltos</Text>
          </View>
        </View>
      </View>

      {/* ── Información Personal ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Información Personal</Text>
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Ionicons name="person-outline" size={20} color="#2F455C" />
            <View style={s.infoTextContainer}>
              <Text style={s.infoLabel}>Nombre Completo</Text>
              <Text style={s.infoValue}>{nombre}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#2F455C" />
            <View style={s.infoTextContainer}>
              <Text style={s.infoLabel}>Correo Electrónico</Text>
              <Text style={s.infoValue}>{email}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#2F455C" />
            <View style={s.infoTextContainer}>
              <Text style={s.infoLabel}>Cargo/Rol</Text>
              <Text style={s.infoValue}>{rol}</Text>
            </View>
          </View>
          {depto && ( // Solo muestra el departamento si existe
            <>
              <View style={s.divider} />
              <View style={s.infoRow}>
                <Ionicons name="business-outline" size={20} color="#2F455C" />
                <View style={s.infoTextContainer}>
                  <Text style={s.infoLabel}>Departamento</Text>
                  <Text style={s.infoValue}>{depto}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* ── Soporte ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Soporte</Text>
        <TouchableOpacity style={s.menuItem} onPress={() => Alert.alert('Ayuda y Soporte', 'Contacta al administrador: 098 467 2753')}>
          <View style={s.menuItemLeft}>
            <View style={[s.menuIcon, { backgroundColor: '#E0F7FA' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#00ACC1" />
            </View>
            <Text style={s.menuItemText}>Ayuda y Soporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={() => Alert.alert('Acerca de la App', 'Sistema de Gestión de Reportes v1.0\n\nDesarrollado para la gestión eficiente de reportes municipales.', [{ text: 'OK' }])}>
          <View style={s.menuItemLeft}>
            <View style={[s.menuIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#AB47BC" />
            </View>
            <Text style={s.menuItemText}>Acerca de</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
        </TouchableOpacity>
      </View>

      {/* ── Cerrar Sesión ── */}
      <View style={s.section}>
        <TouchableOpacity style={s.logoutButton} onPress={handleCerrarSesion}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={s.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
 
      <View style={s.versionContainer}>
        <Text style={s.versionText}>Versión 1.0.0</Text>
      </View>
      <View style={s.bottomSpacer} />

    </ScrollView>
  )
  
}
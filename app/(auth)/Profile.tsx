// 👤 Profile.tsx
// Pantalla de perfil del usuario autenticado (usuario o empleado).
// Muestra datos personales, estadísticas de reportes, soporte y opción de cerrar sesión.

// Iconos de Expo para interfaz visual
import { Ionicons } from '@expo/vector-icons'
// Router para navegación entre pantallas
import { useRouter } from 'expo-router'
// Hooks principales de React
import { useEffect, useState } from 'react'
// Alert se mantiene SOLO para la confirmación de cerrar sesión (requiere 2 botones)
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
// Estilos del perfil
import { profileStyles as s } from '../../src/components/Profilestyles'
// Servicios para cargar perfil y cerrar sesión
import { cargarPerfil, cerrarSesion, ProfileData } from '../../src/services/Profileservice'
// Contexto para limpiar fotos guardadas al cerrar sesión (solo usuarios, no empleados)
import { useSaved } from '../Camera/context/SavedContext'
import { Linking } from 'react-native'
// Toast global para notificaciones de error e info
import { useToast } from '../../src/components/ToastContext'
import * as React from 'react';

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Pantalla de perfil.
 * Carga los datos del usuario/empleado autenticado al montar.
 * Maneja el cierre de sesión con confirmación nativa (Alert de 2 botones).
 */
export default function ProfileScreen() {
  const router = useRouter()
  const { clearSavedPhotos } = useSaved()
  const { showToast } = useToast()

  // Estado que almacena los datos del perfil
  const [perfil, setPerfil] = useState<ProfileData | null>(null)
  // Estado que controla el indicador de carga
  const [cargando, setCargando] = useState(true)

  /**
   * Abre WhatsApp con un mensaje predefinido para contactar soporte.
   * Si WhatsApp no está instalado, abre el enlace en el navegador.
   */
  const abrirWhatsApp = () => {
    const mensaje = encodeURIComponent('Hola, tengo una consulta sobre SmartCampus 👋')
    Linking.openURL(`whatsapp://send?phone=593984672753&text=${mensaje}`)
      .catch(() => {
        Linking.openURL(`https://wa.me/593984672753?text=${mensaje}`)
      })
  }

  // Se ejecuta una sola vez al montar el componente
  // Carga los datos del perfil desde el servicio
  useEffect(() => {
    cargarPerfil()
      .then(setPerfil)
      .catch(() => showToast('No se pudo cargar el perfil', 'error'))
      .finally(() => setCargando(false))
  }, [])

  /**
   * Maneja el proceso de cierre de sesión.
   * Usa Alert nativo para la confirmación porque requiere 2 botones (Cancelar / Cerrar Sesión).
   * Los errores de cierre se reportan vía toast global.
   */
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
            try {
              await cerrarSesion()
              // Si el usuario no es empleado, limpiar fotos guardadas de la cámara
              if (!perfil?.esEmpleado) clearSavedPhotos()
              router.replace('/')
            } catch {
              showToast('No se pudo cerrar la sesión', 'error')
            }
          },
        },
      ]
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (cargando || !perfil) {
    return (
      <View style={s.centeredContainer}>
        <ActivityIndicator size="large" color="#1DCDFE" />
      </View>
    )
  }

  // Extrae los datos principales del perfil
  const { nombre, email, rol, depto, badge, stats } = perfil

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <ScrollView style={s.container}>

      {/* ── HEADER con avatar, nombre, email y badge de rol ── */}
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

      {/* ── TARJETA DE ESTADÍSTICAS ── */}
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

      {/* ── INFORMACIÓN PERSONAL ── */}
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
          {/* El departamento solo existe para empleados */}
          {depto && (
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

      {/* ── SECCIÓN DE SOPORTE ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Soporte</Text>

        {/* Abre WhatsApp de soporte */}
        <TouchableOpacity style={s.menuItem} onPress={abrirWhatsApp}>
          <View style={s.menuItemLeft}>
            <View style={[s.menuIcon, { backgroundColor: '#E0F7FA' }]}>
              <Ionicons name="help-circle-outline" size={20} color="#00ACC1" />
            </View>
            <Text style={s.menuItemText}>Ayuda y Soporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
        </TouchableOpacity>

        {/* Muestra info de versión vía toast */}
        <TouchableOpacity style={s.menuItem} onPress={() => showToast('Sistema de Gestión de Reportes v1.0', 'info')}>
          <View style={s.menuItemLeft}>
            <View style={[s.menuIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#AB47BC" />
            </View>
            <Text style={s.menuItemText}>Acerca de</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
        </TouchableOpacity>
      </View>

      {/* ── BOTÓN DE CERRAR SESIÓN ── */}
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
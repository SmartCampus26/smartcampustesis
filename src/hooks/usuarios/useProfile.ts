// ─── useProfile.ts ────────────────────────────────────────────────────────────
// Hook de Profile.tsx.
// Contiene TODA la lógica: carga, estadísticas, menú, WhatsApp y logout.
// La vista solo renderiza lo que este hook retorna — cero lógica en la vista.

import { useCallback, useEffect, useState } from 'react'
import { Linking } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { cargarPerfil, ProfileData } from '../../services/usuario/Profileservice'
import { useSaved }  from '../../context/SavedContext'
import { useSesion } from '../../context/SesionContext'
import { useToast }  from '../../context/ToastContext'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface StatItem {
  key:   keyof ProfileData['stats']
  label: string
  color: string | undefined
}

export interface InfoItem {
  icon:  React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: string
}

export interface MenuItem {
  iconName:  React.ComponentProps<typeof Ionicons>['name']
  iconBg:    string
  iconColor: string
  label:     string
  onPress:   () => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProfile() {
  const { clearSavedPhotos } = useSaved()
  const { cerrarSesion }     = useSesion()
  const { showToast }        = useToast()

  const [perfil, setPerfil]           = useState<ProfileData | null>(null)
  const [cargando, setCargando]       = useState(true)
  const [confirmando, setConfirmando] = useState(false)

  // ── Carga inicial ─────────────────────────────────────────────────────────

  useEffect(() => {
    cargarPerfil()
      .then(setPerfil)
      .catch(() => showToast('No se pudo cargar el perfil', 'error'))
      .finally(() => setCargando(false))
  }, [])

  // ── Acciones ──────────────────────────────────────────────────────────────

  const abrirWhatsApp = useCallback(() => {
    const msg = encodeURIComponent('Hola, tengo una consulta sobre SmartCampus 👋')
    Linking.openURL(`whatsapp://send?phone=593984672753&text=${msg}`)
      .catch(() => Linking.openURL(`https://wa.me/593984672753?text=${msg}`))
  }, [])

  /** Primer toque: activa confirmación. Segundo toque: cierra sesión y navega. */
  const handleCerrarSesion = useCallback(() => {
    if (!confirmando) {
      setConfirmando(true)
      showToast('Toca de nuevo para confirmar cierre de sesión', 'info')
      setTimeout(() => setConfirmando(false), 3000)
      return
    }
    cerrarSesion()
      .then(() => {
        if (!perfil?.esEmpleado) clearSavedPhotos()
        router.replace('/')
      })
      .catch(() => showToast('No se pudo cerrar la sesión', 'error'))
  }, [confirmando, perfil, cerrarSesion, clearSavedPhotos, showToast])

  const abrirYouTube = useCallback(() => {
    Linking.openURL('https://youtu.be/8LFBAI1vJcc')
      .catch(() => showToast('No se pudo abrir el enlace', 'error'))
  }, [showToast])

  // ── Arrays para la vista ──────────────────────────────────────────────────

  const STATS: StatItem[] = [
    { key: 'total',      label: 'Total',      color: undefined  },
    { key: 'pendientes', label: 'Pendientes', color: '#FFA726'  },
    { key: 'enProceso',  label: 'En Proceso', color: '#21D0B2'  },
    { key: 'resueltos',  label: 'Resueltos',  color: '#34F5C5'  },
  ]

  const INFO_ROWS: InfoItem[] = perfil ? [
    { icon: 'person-outline',    label: 'Nombre Completo',    value: perfil.nombre },
    { icon: 'mail-outline',      label: 'Correo Electrónico', value: perfil.email  },
    { icon: 'briefcase-outline', label: 'Cargo/Rol',          value: perfil.rol    },
    ...(perfil.depto ? [{ icon: 'business-outline' as const, label: 'Departamento', value: perfil.depto }] : []),
  ] : []

  const MENU: MenuItem[] = [
    { iconName: 'help-circle-outline',        iconBg: '#E0F7FA', iconColor: '#00ACC1', label: 'Ayuda y Soporte', onPress: abrirWhatsApp  },
    {  iconName:  'logo-youtube' , iconBg:    '#FFEBEE' ,  iconColor: '#E53935' , label:     'Tutorial' ,       onPress: abrirYouTube },
  ]

  return {
    perfil,
    cargando,
    confirmando,
    STATS,
    INFO_ROWS,
    MENU,
    handleCerrarSesion,
  }
}
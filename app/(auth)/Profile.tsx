// 👤 Profile.tsx — solo JSX. Sin lógica, sin funciones inline.
// Lógica → useProfile | Estilos → Profilestyles

import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { profileStyles as s } from '../../src/components/Profilestyles'
import LoadingScreen from '../../src/components/ui/LoadingScreen'
import { useProfile } from '../../src/hooks/usuarios/useProfile'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const {
    perfil, cargando, confirmando,
    STATS, INFO_ROWS, MENU,
    handleCerrarSesion,
  } = useProfile()

  useAndroidBack(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      console.log("No hay historial para volver");
    }
  });

  if (cargando || !perfil) return <LoadingScreen />


  return (
    <ScrollView style={s.container}>

      {/* ── Encabezado: avatar, nombre, email y badge de rol ── */}
      <View style={s.header}>
        <View style={s.avatarContainer}>
          <View style={s.avatar}>
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </View>
        </View>
        <Text style={s.userName}>{perfil.nombre}</Text>
        <Text style={s.userEmail}>{perfil.email}</Text>
        <View style={s.userBadge}>
          <Ionicons name={perfil.badge.icon as any} size={14} color="#21C0B2" />
          <Text style={s.userBadgeText}>{perfil.badge.label}</Text>
        </View>
      </View>

      {/* ── Tarjeta de estadísticas ── */}
      <View style={s.statsCard}>
        <Text style={s.statsTitle}>Mis Estadísticas</Text>
        <View style={s.statsGrid}>
          {STATS.map(({ key, label, color }, i) => (
            <React.Fragment key={key}>
              {i > 0 && <View style={s.statDivider} />}
              <View style={s.statItem}>
                <Text style={[s.statNumber, color ? { color } : undefined]}>
                  {perfil.stats[key]}
                </Text>
                <Text style={s.statLabel}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* ── Información personal ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Información Personal</Text>
        <View style={s.infoCard}>
          {INFO_ROWS.map(({ icon, label, value }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={s.divider} />}
              <View style={s.infoRow}>
                <Ionicons name={icon} size={20} color="#2F455C" />
                <View style={s.infoTextContainer}>
                  <Text style={s.infoLabel}>{label}</Text>
                  <Text style={s.infoValue}>{value}</Text>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* ── Sección de soporte ── */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Soporte</Text>
        {MENU.map(({ iconName, iconBg, iconColor, label, onPress }) => (
          <TouchableOpacity key={label} style={s.menuItem} onPress={onPress}>
            <View style={s.menuItemLeft}>
              <View style={[s.menuIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={iconName} size={20} color={iconColor} />
              </View>
              <Text style={s.menuItemText}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B9BA8" />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Cerrar sesión (doble toque para confirmar) ── */}
      <View style={s.section}>
        <TouchableOpacity
          style={[s.logoutButton, confirmando && { borderColor: '#FF5252', backgroundColor: '#FFF5F5' }]}
          onPress={handleCerrarSesion}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={s.logoutText}>
            {confirmando ? '¿Confirmar cierre?' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={s.versionContainer}>
        <Text style={s.versionText}>Versión 1.0.0</Text>
      </View>
      <View style={s.bottomSpacer} />

    </ScrollView>
  )
}


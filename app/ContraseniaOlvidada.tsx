// app/ContraseniaOlvidada.tsx
// Flujo de recuperación de contraseña: correo → enviado → nueva contraseña.
// Lógica: useRecuperarContrasenia | Estilos: recuperarContraseniaStyles

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as React from 'react'
import { useEffect } from 'react'
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Text, TouchableOpacity, View,
} from 'react-native'
import FormField from '../src/components/ui/FormField'
import { COLORS, recuperarStyles as styles } from '../src/styles/auth/recuperarContraseniaStyles'
import { useRecuperarContrasenia } from '../src/hooks/auth/useRecuperarContrasenia'
import { supabase } from '../src/lib/Supabase'

// ── Indicador de fuerza de contraseña (solo se usa aquí) ──────────────────────

function IndicadorFuerza({ contrasenia }: { contrasenia: string }) {
  if (!contrasenia.length) return null
  let puntos = 0
  if (contrasenia.length >= 6) puntos++
  if (contrasenia.length >= 10) puntos++
  if (/[A-Z]/.test(contrasenia) && /[0-9]/.test(contrasenia)) puntos++
  const etiqueta = ['', 'Débil', 'Media', 'Fuerte'][puntos]
  const colores  = ['#E5E7EB', '#EF4444', '#F59E0B', '#22C55E']
  return (
    <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, marginBottom: 4 }}>
      {[0, 1, 2].map(i => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < puntos ? colores[puntos] : '#E5E7EB' }} />
      ))}
      {puntos > 0 && <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 6 }}>Contraseña: {etiqueta}</Text>}
    </View>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function ContraseniaOlvidada() {
  const h = useRecuperarContrasenia()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) h.setPaso('nuevaContrasenia')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) h.setPaso('nuevaContrasenia')
    })
    return () => subscription.unsubscribe()
  }, [])

  const titulos = { correo: 'Recuperar contraseña', enviado: 'Revisa tu correo', nuevaContrasenia: 'Nueva contraseña' }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{titulos[h.paso]}</Text>
        </View>

        {/* ── PASO 1: ingresar correo ── */}
        {h.paso === 'correo' && <>
          <View style={styles.iconContainer}><Ionicons name="mail" size={44} color={COLORS.primary} /></View>
          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>Ingresa el correo con el que te registraste y te enviaremos un enlace para restablecerla.</Text>
          <Text style={styles.subtitle}>¡A veces pueden encontarlo en Spam!</Text>
          {h.mensajeError && <View style={styles.bannerError}><Ionicons name="alert-circle" size={20} color={COLORS.error} /><Text style={styles.bannerText}>{h.mensajeError}</Text></View>}
          <View style={styles.formContainer}>
            <FormField label="Correo electrónico" placeholder="ejemplo@correo.com" value={h.correo} onChangeText={h.setCorreo} icon="mail-outline" keyboardType="email-address" error={h.errorCorreo} />
            <TouchableOpacity style={[styles.primaryButton, h.cargandoCorreo && styles.primaryButtonDisabled]} onPress={h.enviarCorreo} disabled={h.cargandoCorreo}>
              {h.cargandoCorreo ? <ActivityIndicator color={COLORS.white} /> : <><Text style={styles.primaryButtonText}>Enviar enlace</Text><Ionicons name="send" size={18} color={COLORS.white} /></>}
            </TouchableOpacity>
          </View>
        </>}

        {/* ── PASO 2: correo enviado ── */}
        {h.paso === 'enviado' && <>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}><Ionicons name="checkmark" size={36} color="#FFFFFF" /></View>
            <Text style={styles.successCardTitle}>¡Correo enviado!</Text>
            <Text style={styles.successCardSubtitle}>Revisa tu bandeja de entrada. Enviamos el enlace a:</Text>
            <Text style={styles.successCardEmail}>{h.correo}</Text>
          </View>
          <Text style={styles.subtitle}>Abre el enlace desde tu correo para crear tu nueva contraseña. El enlace expira en 60 minutos.</Text>
          <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>¿No te llegó?</Text><View style={styles.dividerLine} /></View>
          <TouchableOpacity style={styles.secondaryButton} onPress={h.reiniciar}>
            <Ionicons name="refresh" size={18} color={COLORS.navyLight} /><Text style={styles.secondaryButtonText}>Intentar con otro correo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryButton, { marginTop: 8 }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={COLORS.navyLight} /><Text style={styles.secondaryButtonText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </>}

        {/* ── PASO 3: nueva contraseña ── */}
        {h.paso === 'nuevaContrasenia' && <>
          <View style={styles.iconContainer}><Ionicons name="lock-open" size={44} color={COLORS.primary} /></View>
          <Text style={styles.title}>Nueva contraseña</Text>
          <Text style={styles.subtitle}>Elige una contraseña segura para proteger tu cuenta.</Text>
          {h.mensajeError && <View style={styles.bannerError}><Ionicons name="alert-circle" size={20} color={COLORS.error} /><Text style={styles.bannerText}>{h.mensajeError}</Text></View>}
          {h.mensajeExito && <View style={styles.bannerSuccess}><Ionicons name="checkmark-circle" size={20} color={COLORS.success} /><Text style={styles.bannerText}>{h.mensajeExito}</Text></View>}
          {!h.mensajeExito && <View style={styles.formContainer}>
            <FormField label="Nueva contraseña" placeholder="Mínimo 6 caracteres" value={h.nuevaContrasenia} onChangeText={h.setNuevaContrasenia} icon="lock-closed-outline" isPassword error={h.errorNueva} />
            <IndicadorFuerza contrasenia={h.nuevaContrasenia} />
            <FormField label="Confirmar contraseña" placeholder="Repite tu contraseña" value={h.confirmaContrasenia} onChangeText={h.setConfirmaContrasenia} icon="lock-closed-outline" isPassword error={h.errorConfirma} />
            <TouchableOpacity style={[styles.primaryButton, h.cargandoNueva && styles.primaryButtonDisabled]} onPress={h.guardarContrasenia} disabled={h.cargandoNueva}>
              {h.cargandoNueva ? <ActivityIndicator color={COLORS.white} /> : <><Text style={styles.primaryButtonText}>Guardar contraseña</Text><Ionicons name="checkmark-circle" size={18} color={COLORS.white} /></>}
            </TouchableOpacity>
          </View>}
        </>}

      </ScrollView>
    </KeyboardAvoidingView>
  )
}
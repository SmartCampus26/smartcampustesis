import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS, recuperarStyles as styles } from '../src/components/recuperarContraseniaStyles'
import { supabase } from '../src/lib/Supabase'
import {
  actualizarContrasenia,
  enviarCorreoRecuperacion,
  validarContrasenia,
  validarCorreo,
  verificarCorreoExiste,
} from '../src/services/auth/RecuperarContraseniaService'

// ─────────────────────────────────────────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────────────────────────────────────────
type Paso = 'correo' | 'enviado' | 'nuevaContrasenia'

interface EstadoContrasenia {
  valor: string
  oculta: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Calcula fuerza de contraseña: 0-3 */
const calcularFuerza = (pass: string): 0 | 1 | 2 | 3 => {
  if (pass.length === 0) return 0
  let puntos = 0
  if (pass.length >= 6) puntos++
  if (pass.length >= 10) puntos++
  if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) puntos++
  return Math.min(puntos, 3) as 0 | 1 | 2 | 3
}

const etiquetaFuerza: Record<1 | 2 | 3, string> = {
  1: 'Débil',
  2: 'Media',
  3: 'Fuerte',
}

const colorFuerza = (fuerza: number, idx: number, colors: typeof COLORS) => {
  if (idx >= fuerza) return styles.strengthBar
  if (fuerza === 1) return [styles.strengthBar, styles.strengthBarWeak]
  if (fuerza === 2) return [styles.strengthBar, styles.strengthBarMedium]
  return [styles.strengthBar, styles.strengthBarActive]
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: Indicador de fuerza
// ─────────────────────────────────────────────────────────────────────────────
const IndicadorFuerza: React.FC<{ contrasenia: string }> = ({ contrasenia }) => {
  const fuerza = calcularFuerza(contrasenia)
  if (contrasenia.length === 0) return null

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBarRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={colorFuerza(fuerza, i, COLORS)} />
        ))}
      </View>
      {fuerza > 0 && (
        <Text style={styles.strengthLabel}>
          Contraseña: {etiquetaFuerza[fuerza as 1 | 2 | 3]}
        </Text>
      )}
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponente: Campo de texto con ícono
// ─────────────────────────────────────────────────────────────────────────────
interface CampoTextoProps {
  label: string
  placeholder: string
  value: string
  onChangeText: (t: string) => void
  icono: keyof typeof Ionicons.glyphMap
  error?: string | null
  secureTextEntry?: boolean
  mostrarToggle?: boolean
  onToggleSecure?: () => void
  keyboardType?: 'default' | 'email-address'
  autoCapitalize?: 'none' | 'sentences'
}

const CampoTexto: React.FC<CampoTextoProps> = ({
  label, placeholder, value, onChangeText,
  icono, error, secureTextEntry, mostrarToggle,
  onToggleSecure, keyboardType = 'default', autoCapitalize = 'none',
}) => {
  const [focused, setFocused] = useState(false)

  const wrapperStyle = [
    styles.inputWrapper,
    focused && styles.inputWrapperFocused,
    error ? styles.inputWrapperError : null,
  ]

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={wrapperStyle}>
        <Ionicons name={icono} size={20} color={error ? COLORS.error : COLORS.gray} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {mostrarToggle && (
          <TouchableOpacity style={styles.eyeButton} onPress={onToggleSecure}>
            <Ionicons
              name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pantalla principal
// ─────────────────────────────────────────────────────────────────────────────
export default function ContraseniaOlvidada() {
  // ── Estado de navegación entre pasos ──
  const [paso, setPaso] = useState<Paso>('correo')

  // ── Paso 1: correo ──
  const [correo, setCorreo] = useState('')
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null)
  const [cargandoCorreo, setCargandoCorreo] = useState(false)

  // ── Paso 3: nueva contraseña ──
  const [nueva, setNueva] = useState<EstadoContrasenia>({ valor: '', oculta: true })
  const [confirma, setConfirma] = useState<EstadoContrasenia>({ valor: '', oculta: true })
  const [errorNueva, setErrorNueva] = useState<string | null>(null)
  const [errorConfirma, setErrorConfirma] = useState<string | null>(null)
  const [cargandoNueva, setCargandoNueva] = useState(false)

  // ── Feedback global ──
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  // ── Escuchar evento de Supabase Auth (cuando llega el token del link) ──
  useEffect(() => {
      // 1️⃣ Verificar si YA hay una sesión de recovery activa
  //    (el token llegó antes de que este componente montara)
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      console.log('✅ Sesión de recovery ya activa al montar')
      setPaso('nuevaContrasenia')
    }
  })

  // 2️⃣ Escuchar si llega después de montar
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔔 Auth event:', event)
    if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
      setPaso('nuevaContrasenia')
      setMensajeError(null)
      setMensajeExito(null)
    }
  })

  return () => subscription.unsubscribe()
}, [])


  // ─────────────────────────────────────────────────────────────────────
  // Paso 1 → enviar correo
  // ─────────────────────────────────────────────────────────────────────
  const handleEnviarCorreo = async () => {
    setMensajeError(null)
    setMensajeExito(null)

    // Validar formato
    const errFmt = validarCorreo(correo)
    if (errFmt) { setErrorCorreo(errFmt); return }
    setErrorCorreo(null)

    setCargandoCorreo(true)
    try {
      // Verificar que el correo exista en la BD
      const { existe } = await verificarCorreoExiste(correo)
      if (!existe) {
        setErrorCorreo('No encontramos una cuenta con ese correo.')
        return
      }

      // Enviar correo de recuperación vía Supabase Auth
      await enviarCorreoRecuperacion(correo)
      setPaso('enviado')
    } catch (err: any) {
      setMensajeError(err.message || 'Ocurrió un error. Intenta nuevamente.')
    } finally {
      setCargandoCorreo(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Paso 3 → guardar nueva contraseña
  // ─────────────────────────────────────────────────────────────────────
  const handleGuardarContrasenia = async () => {
    setMensajeError(null)
    setMensajeExito(null)
    setErrorNueva(null)
    setErrorConfirma(null)

    const errVal = validarContrasenia(nueva.valor, confirma.valor)
    if (errVal) {
      // Determinar a qué campo asignar el error
      if (errVal.includes('coinciden')) setErrorConfirma(errVal)
      else setErrorNueva(errVal)
      return
    }

    setCargandoNueva(true)
    try {
      await actualizarContrasenia(nueva.valor)
      setMensajeExito('¡Contraseña actualizada! Ya puedes iniciar sesión con tu nueva contraseña.')
      // Esperar 2s y redirigir al login
      setTimeout(() => {
        router.replace('/')
      }, 2500)
    } catch (err: any) {
      setMensajeError(err.message || 'No se pudo actualizar la contraseña.')
    } finally {
      setCargandoNueva(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────

  const BannerError = () =>
    mensajeError ? (
      <View style={styles.bannerError}>
        <Ionicons name="alert-circle" size={20} color={COLORS.error} />
        <Text style={styles.bannerText}>{mensajeError}</Text>
      </View>
    ) : null

  const BannerExito = () =>
    mensajeExito ? (
      <View style={styles.bannerSuccess}>
        <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
        <Text style={styles.bannerText}>{mensajeExito}</Text>
      </View>
    ) : null

  // ─────────────────────────────────────────────────────────────────────
  // PASO 1: ingresar correo
  // ─────────────────────────────────────────────────────────────────────
  const renderPasoCorreo = () => (
    <>
      <View style={styles.iconContainer}>
        <Ionicons name="mail" size={44} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
      <Text style={styles.subtitle}>
        Ingresa el correo con el que te registraste y te enviaremos un enlace para restablecerla.
      </Text>
      
      <Text style={styles.subtitle}>
      ¡A veces pueden encontarlo en Spam!.
      </Text>

      <BannerError />

      <View style={styles.formContainer}>
        <CampoTexto
          label="Correo electrónico"
          placeholder="ejemplo@correo.com"
          value={correo}
          onChangeText={(t) => { setCorreo(t); setErrorCorreo(null) }}
          icono="mail-outline"
          error={errorCorreo}
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[styles.primaryButton, cargandoCorreo && styles.primaryButtonDisabled]}
          onPress={handleEnviarCorreo}
          disabled={cargandoCorreo}
        >
          {cargandoCorreo ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Enviar enlace</Text>
              <Ionicons name="send" size={18} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        ¿Recordaste tu contraseña?{' '}
        <Text style={styles.footerLink} onPress={() => router.back()}>
          Inicia sesión
        </Text>
      </Text>
    </>
  )

  // ─────────────────────────────────────────────────────────────────────
  // PASO 2: correo enviado (esperando que el usuario abra el link)
  // ─────────────────────────────────────────────────────────────────────
  const renderPasoEnviado = () => (
    <>
      <View style={styles.successCard}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={36} color={COLORS.white} />
        </View>
        <Text style={styles.successCardTitle}>¡Correo enviado!</Text>
        <Text style={styles.successCardSubtitle}>
          Revisa tu bandeja de entrada. Enviamos el enlace a:
        </Text>
        <Text style={styles.successCardEmail}>{correo}</Text>
      </View>

      <Text style={styles.subtitle}>
        Abre el enlace desde tu correo para crear tu nueva contraseña. El enlace expira en 60 minutos.
      </Text>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>¿No te llegó?</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          setCorreo('')
          setMensajeError(null)
          setPaso('correo')
        }}
      >
        <Ionicons name="refresh" size={18} color={COLORS.navyLight} />
        <Text style={styles.secondaryButtonText}>Intentar con otro correo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, { marginTop: 8 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.navyLight} />
        <Text style={styles.secondaryButtonText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </>
  )

  // ─────────────────────────────────────────────────────────────────────
  // PASO 3: ingresar nueva contraseña
  // ─────────────────────────────────────────────────────────────────────
  const renderPasoNuevaContrasenia = () => (
    <>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-open" size={44} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>Nueva contraseña</Text>
      <Text style={styles.subtitle}>
        Elige una contraseña segura para proteger tu cuenta.
      </Text>

      <BannerError />
      <BannerExito />

      {!mensajeExito && (
        <View style={styles.formContainer}>
          <View>
            <CampoTexto
              label="Nueva contraseña"
              placeholder="Mínimo 6 caracteres"
              value={nueva.valor}
              onChangeText={(t) => { setNueva(prev => ({ ...prev, valor: t })); setErrorNueva(null) }}
              icono="lock-closed-outline"
              error={errorNueva}
              secureTextEntry={nueva.oculta}
              mostrarToggle
              onToggleSecure={() => setNueva(prev => ({ ...prev, oculta: !prev.oculta }))}
            />
            <IndicadorFuerza contrasenia={nueva.valor} />
          </View>

          <CampoTexto
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={confirma.valor}
            onChangeText={(t) => { setConfirma(prev => ({ ...prev, valor: t })); setErrorConfirma(null) }}
            icono="lock-closed-outline"
            error={errorConfirma}
            secureTextEntry={confirma.oculta}
            mostrarToggle
            onToggleSecure={() => setConfirma(prev => ({ ...prev, oculta: !prev.oculta }))}
          />

          <TouchableOpacity
            style={[styles.primaryButton, cargandoNueva && styles.primaryButtonDisabled]}
            onPress={handleGuardarContrasenia}
            disabled={cargandoNueva}
          >
            {cargandoNueva ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Guardar contraseña</Text>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </>
  )

  // ─────────────────────────────────────────────────────────────────────
  // RENDER PRINCIPAL
  // ─────────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header con botón back */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {paso === 'correo' && 'Recuperar contraseña'}
            {paso === 'enviado' && 'Revisa tu correo'}
            {paso === 'nuevaContrasenia' && 'Nueva contraseña'}
          </Text>
        </View>

        {/* Contenido según paso actual */}
        {paso === 'correo' && renderPasoCorreo()}
        {paso === 'enviado' && renderPasoEnviado()}
        {paso === 'nuevaContrasenia' && renderPasoNuevaContrasenia()}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
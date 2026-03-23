// 🔐 app/index.tsx
// Pantalla de inicio de sesión de SmartCampus.
// Permite autenticarse como Usuario (docente / coordinador)
// o como Colaborador (mantenimiento / sistemas).
// Redirige al home correspondiente según el rol de la sesión.

// React y hook useState para manejar el estado del componente
import { useState } from 'react'
// Componentes nativos de React Native para construir la interfaz
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
// Navegación y redirección entre pantallas
import { router } from 'expo-router'
// Servicio personalizado de autenticación
import { loginPersonalizado } from '../src/services/AuthService'
// Tipo de datos de sesión
import { Sesion } from '../src/types/Database'
// Librería de íconos
import { Ionicons } from '@expo/vector-icons'
// Toast global para notificaciones (reemplaza Alert)
import { useToast } from '../src/components/ToastContext'
import * as React from 'react';
import { useSesion } from './Camera/context/SesionContext'

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Pantalla de login.
 * Permite seleccionar el tipo de cuenta (usuario o colaborador)
 * antes de ingresar credenciales.
 * Redirige a HomeAutoridad, HomeDocente o HomeEmpleado según el rol.
 */
export default function LoginScreen() {
  const { showToast } = useToast()
  const { iniciarSesion } = useSesion()   

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [correo, setCorreo]               = useState('')
  const [contrasena, setContrasena]       = useState('')
  const [tipoUsuario, setTipoUsuario]     = useState<'usuario' | 'empleado'>('usuario')
  const [cargando, setCargando]           = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  // ── Login ─────────────────────────────────────────────────────────────────

  /**
   * Valida los campos, autentica al usuario y redirige según el rol.
   * Flujo:
   *   1. Valida que correo y contraseña no estén vacíos
   *   2. Llama a loginPersonalizado con el tipo seleccionado
   *   3. Según el rol/tipo de la sesión, redirige a la pantalla correspondiente
   *   4. Muestra toast de bienvenida o de error
   */
  const handleLogin = async () => {
    if (!correo.trim() || !contrasena.trim()) {
      showToast('Por favor completa todos los campos', 'error')
      return
    }

    setCargando(true)
    try {
      const sesion: Sesion = await loginPersonalizado(correo, contrasena, tipoUsuario)
      await iniciarSesion(sesion)

      if (sesion.tipo === 'usuario') {
        if (sesion.rol === 'autoridad') {
          showToast(`Bienvenido, ${sesion.data.nomUser}`, 'success')
          router.replace('/(auth)/HomeAutoridad')
        } else if (sesion.rol === 'docente') {
          showToast(`Bienvenido, ${sesion.data.nomUser}`, 'success')
          router.replace('/(auth)/HomeDocente')
        } else {
          throw new Error('Rol de usuario no reconocido')
        }
      } else if (sesion.tipo === 'empleado') {
        showToast(`Bienvenido, ${sesion.data.nomEmpl}`, 'success')
        router.replace('/(auth)/HomeEmpleado')
      }
    } catch (error: any) {
      showToast(error.message || 'Credenciales incorrectas', 'error')
    } finally {
      setCargando(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo de la app */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo_tesis.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Accede a tu cuenta</Text>

        {/* ── SELECTOR DE TIPO DE USUARIO ──────────────────────────────────
            Determina si el login se procesa como usuario o como empleado.
            Afecta la tabla de BD consultada en el servicio. ── */}
        <View style={styles.tipoUsuarioContainer}>
          <TouchableOpacity
            style={[styles.tipoBoton, tipoUsuario === 'usuario' && styles.tipoBotonActivo]}
            onPress={() => setTipoUsuario('usuario')}
          >
            <Ionicons
              name="people"
              size={20}
              color={tipoUsuario === 'usuario' ? '#FFFFFF' : '#2F455C'}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.tipoTexto, tipoUsuario === 'usuario' && styles.tipoTextoActivo]}>
              Usuario
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tipoBoton, tipoUsuario === 'empleado' && styles.tipoBotonActivo]}
            onPress={() => setTipoUsuario('empleado')}
          >
            <Ionicons
              name="briefcase"
              size={20}
              color={tipoUsuario === 'empleado' ? '#FFFFFF' : '#2F455C'}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.tipoTexto, tipoUsuario === 'empleado' && styles.tipoTextoActivo]}>
              Colaborador
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── FORMULARIO ── */}
        <View style={styles.formContainer}>

          {/* Campo de correo electrónico */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#8B9BA8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#8B9BA8"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Campo de contraseña con toggle de visibilidad */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B9BA8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#8B9BA8"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry={!mostrarContrasena}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setMostrarContrasena(!mostrarContrasena)}
              >
                <Ionicons
                  name={mostrarContrasena ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#8B9BA8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Enlace de recuperación de contraseña ── */}
          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() => router.push('/ContraseniaOlvidada')}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón de inicio de sesión */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Badge informativo sobre el tipo de acceso seleccionado */}
        <View style={styles.infoContainer}>
          <View style={styles.infoBadge}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#8B9BA8"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.infoText}>
              {tipoUsuario === 'usuario'
                ? 'Acceso para autoridades y docentes'
                : 'Acceso para personal de mantenimiento y/o sistemas'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2F455C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B9BA8',
    textAlign: 'center',
    marginBottom: 32,
  },
  tipoUsuarioContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 4,
  },
  tipoBoton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tipoBotonActivo: {
    backgroundColor: '#21D0B2',
    shadowColor: '#21D0B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tipoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F455C',
  },
  tipoTextoActivo: {
    color: '#FFFFFF',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2F455C',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  // ── Enlace de contraseña olvidada ──
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 20,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  forgotText: {
    fontSize: 14,
    color: '#21D0B2',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#21D0B2',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#21D0B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#8B9BA8',
    textAlign: 'center',
  },
})
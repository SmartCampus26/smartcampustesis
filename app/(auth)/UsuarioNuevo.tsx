// 👤 UsuarioNuevo.tsx
// Pantalla para registrar un nuevo usuario del sistema (docente o coordinador).
// Permite ingresar datos personales, seleccionar rol, y crear la cuenta
// en Supabase Auth + tabla usuario.

// React y hook para manejar estado del formulario
import { useState } from 'react'
// Componentes nativos para la interfaz y control del teclado
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
// Íconos de Ionicons usados en inputs y botones
import { Ionicons } from '@expo/vector-icons'
// Íconos de Lucide para el toggle de contraseña
import { Eye, EyeOff } from 'lucide-react-native'
// Router de Expo para navegación entre pantallas
import { router } from 'expo-router'
// Lógica de creación de usuario, tipo del formulario, valor inicial y validaciones
import {
  crearUsuario,
  NuevoUsuarioData,
  USUARIO_INICIAL,
  validarUsuario,
} from '../../src/services/UsuarioServices'
// Estilos
import { usuarioNuevoStyles as styles } from '../../src/components/usuarioNuevoStyles'
// Toast global para notificaciones
import { useToast } from '../../src/components/ToastContext'
import * as React from 'react'

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Pantalla de registro de nuevo usuario (docente o coordinador).
 * Al crear exitosamente, Supabase envía un enlace de verificación al correo
 * y la app navega de vuelta automáticamente tras 4 segundos.
 */
export default function UsuarioNuevo() {
  const { showToast } = useToast()

  // ── Estado del formulario ─────────────────────────────────────────────────
  // Se inicializa con USUARIO_INICIAL para garantizar valores por defecto limpios
  const [nuevoUsuario, setNuevoUsuario] = useState<NuevoUsuarioData>(USUARIO_INICIAL)
  // Controla el indicador de carga mientras se procesa la solicitud
  const [cargando, setCargando] = useState(false)
  // Controla la visibilidad del campo de contraseña
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  /**
   * Retorna una función que actualiza un campo específico del formulario.
   * Usa currying para mantener el handler limpio en los TextInput.
   * @param campo - Nombre del campo a actualizar
   */
  const set = (campo: keyof NuevoUsuarioData) => (valor: string) =>
    setNuevoUsuario(prev => ({ ...prev, [campo]: valor }))

  // ── Crear usuario ─────────────────────────────────────────────────────────

  /**
   * Valida el formulario y crea el usuario en Supabase.
   * Flujo:
   *   1. Valida campos → muestra error si falla
   *   2. Llama al servicio de creación
   *   3. Muestra toast de éxito y vuelve atrás tras 4 segundos
   *   4. En caso de error, muestra toast con el mensaje recibido
   */
  const handleCrear = async () => {
    const error = validarUsuario(nuevoUsuario)
    if (error) {
      showToast(error, 'error')
      return
    }

    setCargando(true)
    try {
      await crearUsuario(nuevoUsuario)
      showToast(
        'Usuario registrado. Se envió un enlace de verificación a ' + nuevoUsuario.correoUser,
        'success',
        4000
      )
      setTimeout(() => router.back(), 4000)
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error')
      } else {
        showToast('Ocurrió un error inesperado', 'error')
      }
    } finally {
      setCargando(false)
    }
  }

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="person-add" size={50} color="#1DCDFE" />
          <Text style={styles.title}>Nuevo Usuario</Text>
          <Text style={styles.subtitle}>
            Completa la información del docente o coordinador
          </Text>
        </View>

        <View style={styles.form}>

          {/* ── Nombre ── */}
          <Campo label="Nombre *" icon="person-outline" placeholder="Ej: Juan Carlos"
            value={nuevoUsuario.nomUser} onChangeText={set('nomUser')} />

          {/* ── Apellido ── */}
          <Campo label="Apellido *" icon="person-outline" placeholder="Ej: Pérez García"
            value={nuevoUsuario.apeUser} onChangeText={set('apeUser')} />

          {/* ── Correo electrónico ── */}
          <Campo label="Correo Electrónico *" icon="mail-outline" placeholder="correo@ejemplo.com"
            value={nuevoUsuario.correoUser} onChangeText={set('correoUser')}
            keyboardType="email-address" autoCapitalize="none" />

          {/* ── Contraseña con toggle de visibilidad ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry={!mostrarContrasena}
                value={nuevoUsuario.contraUser}
                onChangeText={set('contraUser')}
              />
              {/* Botón para mostrar u ocultar la contraseña */}
              <TouchableOpacity onPress={() => setMostrarContrasena(prev => !prev)}>
                {mostrarContrasena
                  ? <EyeOff size={20} color="#6B7280" />
                  : <Eye size={20} color="#6B7280" />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Teléfono (opcional) ── */}
          <Campo label="Teléfono (Opcional)" icon="call-outline" placeholder="Ej: 0987654321"
            value={nuevoUsuario.tlfUser} onChangeText={set('tlfUser')}
            keyboardType="phone-pad" maxLength={10} />

          {/* ── Selector de rol ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rol del Usuario *</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, nuevoUsuario.rolUser === 'docente' && styles.roleButtonActive]}
                onPress={() => set('rolUser')('docente')}
              >
                <Ionicons name="school" size={24} color={nuevoUsuario.rolUser === 'docente' ? '#FFF' : '#1DCDFE'} />
                <Text style={[styles.roleButtonText, nuevoUsuario.rolUser === 'docente' && styles.roleButtonTextActive]}>
                  Docente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, nuevoUsuario.rolUser === 'autoridad' && styles.roleButtonActive]}
                onPress={() => set('rolUser')('autoridad')}
              >
                <Ionicons name="shield-checkmark" size={24} color={nuevoUsuario.rolUser === 'autoridad' ? '#FFF' : '#21D0B2'} />
                <Text style={[styles.roleButtonText, nuevoUsuario.rolUser === 'autoridad' && styles.roleButtonTextActive]}>
                  Coordinador
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Botones de acción ── */}
          <TouchableOpacity
            style={[styles.submitButton, cargando && styles.submitButtonDisabled]}
            onPress={handleCrear}
            disabled={cargando}
          >
            <Text style={styles.submitButtonText}>
              {cargando ? 'Creando Usuario...' : 'Crear Usuario'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/**
 * Campo de texto reutilizable con ícono y label.
 * Acepta todas las props de TextInput además de `label` e `icon`.
 *
 * @param label - Texto del label superior
 * @param icon  - Nombre del ícono de Ionicons a mostrar a la izquierda
 */
function Campo({ label, icon, ...props }: {
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  [key: string]: any
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color="#6B7280" />
        <TextInput style={styles.input} {...props} />
      </View>
    </View>
  )
}
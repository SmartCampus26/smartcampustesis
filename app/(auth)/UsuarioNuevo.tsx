// React y hook para manejar estado del formulario
import React, { useState, useEffect } from 'react'
// Componentes nativos para la interfaz del usuario y control del teclado
import {
  Alert,
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
// Lógica de creación de usuario y validaciones
import {
  NuevoUsuarioData, USUARIO_INICIAL,
  validarUsuario, crearUsuario, esDepartamentoSistemas,
} from '../../src/services/UsuarioServices'
// Estilos
import { usuarioNuevoStyles as styles } from '../../src/components/usuarioNuevoStyles'

//COMPONENTE
/**
 * Pantalla para registrar un nuevo usuario (docente o autoridad)
 * Permite ingresar datos personales y guardarlos en la base de datos
 */
export default function UsuarioNuevo() {
  // Estado que almacena los datos del nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState<NuevoUsuarioData>(USUARIO_INICIAL)
  // Estado para controlar el indicador de carga
  const [cargando, setCargando] = useState(false)
  // Estado para controlar la visibilidad de la contraseña
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  // Verifica al montar que el empleado sea del departamento Sistemas
  useEffect(() => {
    esDepartamentoSistemas().then(esSistemas => {
      if (!esSistemas) {
        Alert.alert(
          'Acceso denegado',
          'Solo el departamento de Sistemas puede crear usuarios.',
          [{ text: 'Volver', onPress: () => router.back() }]
        )
      }
    })
  }, [])

  const set = (campo: keyof NuevoUsuarioData) => (valor: string) =>
    setNuevoUsuario(prev => ({ ...prev, [campo]: valor }))

  // Función que valida los datos y registra el usuario en Supabase
  const handleCrear = async () => {
    const error = validarUsuario(nuevoUsuario)
    if (error) return Alert.alert('Campos incompletos', error)

    setCargando(true)
    try {
      await crearUsuario(nuevoUsuario)
      Alert.alert(
        '¡Listo!',
        'Usuario registrado. Se ha enviado un enlace de verificación a ' + nuevoUsuario.correoUser,
        [{ text: 'Entendido', onPress: () => router.back() }]
      )
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado')
      }
    } finally {
      setCargando(false)
    }
  }

  //RENDER PRINCIPAL
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="person-add" size={50} color="#1DCDFE" />
          <Text style={styles.title}>Nuevo Usuario</Text>
          <Text style={styles.subtitle}>
            Completa la información del docente o autoridad
          </Text>
        </View>

        <View style={styles.form}>

          {/* Nombre */}
          <Campo label="Nombre *" icon="person-outline" placeholder="Ej: Juan Carlos"
            value={nuevoUsuario.nomUser} onChangeText={set('nomUser')} />

          {/* Apellido */}
          <Campo label="Apellido *" icon="person-outline" placeholder="Ej: Pérez García"
            value={nuevoUsuario.apeUser} onChangeText={set('apeUser')} />

          {/* Correo */}
          <Campo label="Correo Electrónico *" icon="mail-outline" placeholder="correo@ejemplo.com"
            value={nuevoUsuario.correoUser} onChangeText={set('correoUser')}
            keyboardType="email-address" autoCapitalize="none" />

          {/* Contraseña con toggle de visibilidad */}
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
              {/* Botón para mostrar/ocultar contraseña */}
              <TouchableOpacity onPress={() => setMostrarContrasena(prev => !prev)}>
                {mostrarContrasena
                  ? <EyeOff size={20} color="#6B7280" />
                  : <Eye size={20} color="#6B7280" />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Teléfono */}
          <Campo label="Teléfono (Opcional)" icon="call-outline" placeholder="Ej: 0987654321"
            value={nuevoUsuario.tlfUser} onChangeText={set('tlfUser')}
            keyboardType="phone-pad" maxLength={10} />

          {/* Rol */}
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
                  Autoridad
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botones */}
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

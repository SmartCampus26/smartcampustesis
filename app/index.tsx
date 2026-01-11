// Pantalla de inicio de sesión para usuarios y empleados
// Permite autenticar, validar credenciales y redirigir según rol y tipo de usuario

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router' 
import { loginPersonalizado } from '../src/services/AuthService'
import { Sesion } from '../src/types/Database'
import { Ionicons } from '@expo/vector-icons'

// Estados del formulario y control de la interfaz
export default function LoginScreen() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState<'usuario' | 'empleado'>('usuario')
  const [cargando, setCargando] = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  // Función que gestiona el proceso de inicio de sesión
  const handleLogin = async () => {

    // Validación de campos vacíos
    if (!correo.trim() || !contrasena.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    setCargando(true)

    try {
      // Llamada al servicio de autenticación personalizada
      const sesion: Sesion = await loginPersonalizado(correo, contrasena, tipoUsuario)
      
      // Acceso total para super administrador
      if (sesion.tipo === 'usuario' && sesion.rol === 'super_admin') {
        Alert.alert('Acceso Total', 'Bienvenida Emily - Administrador del Sistema')
        router.replace('/maxAutoridad/MenuSuperAutoridad')
        return
      }
      
      // Redirección según tipo y rol del usuario
      if (sesion.tipo === 'usuario') {
        if (sesion.rol === 'autoridad') {
          Alert.alert('Bienvenido', `Hola ${sesion.data.nomUser}`)
          router.replace('/autoridad/HomeAutoridad')
        } else if (sesion.rol === 'docente') {
          Alert.alert('Bienvenido', `Hola ${sesion.data.nomUser}`)
          router.replace('/docente/HomeDocente')
        } else {
          throw new Error('Rol de usuario no reconocido')
        }
      } else if (sesion.tipo === 'empleado') {
        Alert.alert('Bienvenido', `Hola ${sesion.data.nomEmpl}`)
        router.replace('/empleado/HomeEmpleado')
      }
    } catch (error: any) {
      // Manejo de errores de autenticación
      Alert.alert('Error de autenticación', error.message || 'Credenciales incorrectas')
    } finally {
      setCargando(false)
    }
  }

  return (
    // Ajusta la vista cuando aparece el teclado
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
         {/* Logo de la aplicación */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo_tesis.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Título principal */}
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Accede a tu cuenta</Text>

        {/* Selector del tipo de usuario */}
        <View style={styles.tipoUsuarioContainer}>
          <TouchableOpacity
            style={[
              styles.tipoBoton,
              tipoUsuario === 'usuario' && styles.tipoBotonActivo
            ]}
            onPress={() => setTipoUsuario('usuario')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={tipoUsuario === 'usuario' ? '#FFFFFF' : '#2F455C'} 
              style={{ marginRight: 8 }}
            />
            <Text style={[
              styles.tipoTexto,
              tipoUsuario === 'usuario' && styles.tipoTextoActivo
            ]}>
              Usuario
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tipoBoton,
              tipoUsuario === 'empleado' && styles.tipoBotonActivo
            ]}
            onPress={() => setTipoUsuario('empleado')}
          >
            <Ionicons 
              name="briefcase" 
              size={20} 
              color={tipoUsuario === 'empleado' ? '#FFFFFF' : '#2F455C'} 
              style={{ marginRight: 8 }}
            />
            <Text style={[
              styles.tipoTexto,
              tipoUsuario === 'empleado' && styles.tipoTextoActivo
            ]}>
              Empleado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario de inicio de sesión */}
        <View style={styles.formContainer}>
          {/* Campo de correo */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color="#8B9BA8" 
                style={styles.inputIcon}
              />
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
            
          {/* Campo de contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color="#8B9BA8" 
                style={styles.inputIcon}
              />
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

        {/* Información según el tipo de usuario */}
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
                : 'Acceso para personal administrativo'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  loginButton: {
    backgroundColor: '#21D0B2',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#21D0B2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
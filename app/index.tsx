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

export default function LoginScreen() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [tipoUsuario, setTipoUsuario] = useState<'usuario' | 'empleado'>('usuario')
  const [cargando, setCargando] = useState(false)

  const handleLogin = async () => {
    if (!correo.trim() || !contrasena.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    setCargando(true)
    try {
      const sesion: Sesion = await loginPersonalizado(correo, contrasena, tipoUsuario)
      
      // Si es super admin (Emily), tiene acceso total
      if (sesion.tipo === 'usuario' && sesion.rol === 'super_admin') {
        Alert.alert('Acceso Total', 'Bienvenida Emily - Administrador del Sistema')
        router.replace('/maxAutoridad/MenuSuperAutoridad') // CAMBIO AQUÍ
        return
      }
      
      // Redirigir según el tipo y rol normal
      if (sesion.tipo === 'usuario') {
        if (sesion.rol === 'autoridad') {
          Alert.alert('Bienvenido', `Hola ${sesion.data.nomUser}`)
          router.replace('/autoridad/HomeAutoridad') // CAMBIO AQUÍ
        } else if (sesion.rol === 'docente') {
          Alert.alert('Bienvenido', `Hola ${sesion.data.nomUser}`)
          router.replace('/docente/HomeDocente') // CAMBIO AQUÍ
        } else {
          throw new Error('Rol de usuario no reconocido')
        }
      } else if (sesion.tipo === 'empleado') {
        Alert.alert('Bienvenido', `Hola ${sesion.data.nomEmpl}`)
        router.replace('/empleado/HomeEmpleado') // CAMBIO AQUÍ
      }
    } catch (error: any) {
      Alert.alert('Error de autenticación', error.message || 'Credenciales incorrectas')
    } finally {
      setCargando(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo o Imagen */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo_tesis.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Título */}
        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Accede a tu cuenta</Text>

        {/* Selector de tipo de usuario */}
        <View style={styles.tipoUsuarioContainer}>
          <TouchableOpacity
            style={[
              styles.tipoBoton,
              tipoUsuario === 'usuario' && styles.tipoBotonActivo
            ]}
            onPress={() => setTipoUsuario('usuario')}
          >
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
            <Text style={[
              styles.tipoTexto,
              tipoUsuario === 'empleado' && styles.tipoTextoActivo
            ]}>
              Empleado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#8B9BA8"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {tipoUsuario === 'usuario' 
              ? 'Acceso para autoridades y docentes' 
              : 'Acceso para personal administrativo'}
          </Text>
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
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tipoBotonActivo: {
    backgroundColor: '#1DCDFE',
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
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2F455C',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  loginButton: {
    backgroundColor: '#21D0B2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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
  infoText: {
    fontSize: 13,
    color: '#8B9BA8',
    textAlign: 'center',
  },
})
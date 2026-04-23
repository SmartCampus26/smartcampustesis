// 🔐 app/index.tsx
// Pantalla de inicio de sesión de SmartCampus.
// Lógica: useLogin | Estilos: src/styles/auth/loginStyles.ts

import * as React from 'react'
import { useState } from 'react'
import {
  ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSesion } from '../src/context/SesionContext'
import { useToast } from '../src/context/ToastContext'
import { useLogin } from '../src/hooks/auth/useLogin'
import { styles } from '../src/styles/auth/loginStyles'

export default function LoginScreen() {
  const { showToast } = useToast()
  const { iniciarSesion } = useSesion()
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const { correo, setCorreo, contrasena, setContrasena, tipoUsuario, setTipoUsuario, cargando, login } = useLogin()

  const handleLogin = async () => {
    const sesion = await login()
    if (!sesion) { showToast('Credenciales incorrectas o campos vacíos', 'error'); return }

    await iniciarSesion(sesion)

    if (sesion.tipo === 'usuario') {
      if (sesion.rol === 'autoridad') {
        showToast(`Bienvenido, ${sesion.data.nomUser}`, 'success')
        router.replace('/(auth)/HomeAutoridad')
      } else if (sesion.rol === 'docente') {
        showToast(`Bienvenido, ${sesion.data.nomUser}`, 'success')
        router.replace('/(auth)/HomeDocente')
      }
    } else if (sesion.tipo === 'empleado') {
      showToast(`Bienvenido, ${sesion.data.nomEmpl}`, 'success')
      router.replace('/(auth)/HomeEmpleado')
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/logo_tesis.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Iniciar Sesión</Text>
        <Text style={styles.subtitle}>Accede a tu cuenta</Text>

        {/* Selector tipo usuario */}
        <View style={styles.tipoUsuarioContainer}>
          {(['usuario', 'empleado'] as const).map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={[styles.tipoBoton, tipoUsuario === tipo && styles.tipoBotonActivo]}
              onPress={() => setTipoUsuario(tipo)}
            >
              <Ionicons
                name={tipo === 'usuario' ? 'people' : 'briefcase'}
                size={20}
                color={tipoUsuario === tipo ? '#FFFFFF' : '#2F455C'}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.tipoTexto, tipoUsuario === tipo && styles.tipoTextoActivo]}>
                {tipo === 'usuario' ? 'Usuario' : 'Colaborador'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#8B9BA8" style={styles.inputIcon} />
              <TextInput
                style={styles.input} placeholder="ejemplo@correo.com" placeholderTextColor="#8B9BA8"
                value={correo} onChangeText={setCorreo} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B9BA8" style={styles.inputIcon} />
              <TextInput
                style={styles.input} placeholder="••••••••" placeholderTextColor="#8B9BA8"
                value={contrasena} onChangeText={setContrasena} secureTextEntry={!mostrarContrasena} autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setMostrarContrasena(v => !v)}>
                <Ionicons name={mostrarContrasena ? 'eye-off-outline' : 'eye-outline'} size={22} color="#8B9BA8" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotContainer} onPress={() => router.push('/ContraseniaOlvidada')}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={cargando}>
            {cargando
              ? <ActivityIndicator color="#FFFFFF" />
              : <><Text style={styles.loginButtonText}>Iniciar Sesión</Text><Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} /></>
            }
          </TouchableOpacity>
        </View>

        {/* Badge informativo */}
        <View style={styles.infoContainer}>
          <View style={styles.infoBadge}>
            <Ionicons name="information-circle-outline" size={16} color="#8B9BA8" style={{ marginRight: 6 }} />
            <Text style={styles.infoText}>
              {tipoUsuario === 'usuario' ? 'Acceso para autoridades y docentes' : 'Acceso para personal de mantenimiento y/o sistemas'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}
import { useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { styles } from '../src/styles/auth/verifyEmailStyles'

/**
 * Pantalla que aparece cuando el usuario abre el link
 * de verificación de correo enviado por Supabase.
 * _layout.tsx detecta el evento y redirige aquí.
 */
export default function VerificarCorreo() {
  useEffect(() => {
    // Redirigir al login automáticamente después de 4 segundos
    const timer = setTimeout(() => {
      router.replace('/')
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>

      {/* Ícono de éxito */}
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark" size={52} color="#FFFFFF" />
      </View>

      {/* Textos */}
      <Text style={styles.title}>¡Felicidades!</Text>
      <Text style={styles.subtitle}>Su cuenta ha sido creada con éxito</Text>
      <Text style={styles.description}>
        Tu correo ha sido verificado correctamente.{'\n'}
        Ya puedes iniciar sesión con tu cuenta.
      </Text>

      {/* Indicador de redirección automática */}
      <View style={styles.autoRedirectBadge}>
        <Ionicons name="time-outline" size={16} color="#21D0B2" />
        <Text style={styles.autoRedirectText}>
          Serás redirigido al inicio de sesión automáticamente...
        </Text>
      </View>

      {/* Botón manual por si no redirige */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/')}
      >
        <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>Ir al inicio de sesión</Text>
      </TouchableOpacity>

    </View>
  )
}
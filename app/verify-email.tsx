import { useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#21D0B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#21D0B2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2F455C',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#21D0B2',
    textAlign: 'center',
    marginBottom: 16,
  },

  description: {
    fontSize: 15,
    color: '#8B9BA8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  autoRedirectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F9F7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginBottom: 32,
  },

  autoRedirectText: {
    fontSize: 13,
    color: '#21D0B2',
    fontWeight: '500',
  },

  button: {
    backgroundColor: '#2F455C',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#2F455C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
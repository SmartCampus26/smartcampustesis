// Importa React y el hook useState.
// useState permite manejar estados locales dentro del componente.
import React, { useState } from 'react'

// Componentes de React Native para:
// - Mostrar alertas
// - Ajustar la vista cuando aparece el teclado
// - Crear scroll vertical
// - Crear formularios y botones
import {
  Alert,                // Muestra alertas nativas del sistema
  KeyboardAvoidingView, // Evita que el teclado cubra los inputs
  Platform,             // Detecta el sistema operativo (iOS o Android)
  ScrollView,           // Permite desplazamiento vertical
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

// Librería de íconos para reforzar la experiencia visual (UI/UX)
import { Ionicons } from '@expo/vector-icons'

// Router de Expo para navegación entre pantallas
// Permite usar router.push() o router.back()
import { router } from 'expo-router'

// Cliente configurado de Supabase
// Se usa para interactuar con la base de datos y funciones backend
import { supabase } from '../../src/lib/Supabase'


/**
 * EmpleadoNuevo
 * 
 * Pantalla para la creación de nuevos empleados del sistema.
 * 
 * Responsabilidades:
 * - Capturar datos del formulario
 * - Validar campos obligatorios
 * - Validar formato de correo
 * - Enviar datos a una Edge Function de Supabase
 * - Mostrar mensajes de éxito o error
 */
export default function EmpleadoNuevo() {

  /**
   * Estado principal del formulario.
   * 
   * Se guarda en un objeto para manejar todos los campos juntos.
   * Cada propiedad representa un campo del formulario.
   */
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nomEmpl: '',          // Nombre
    apeEmpl: '',          // Apellido
    correoEmpl: '',       // Email
    contraEmpl: '',       // Contraseña
    tlfEmpl: '',          // Teléfono
    deptEmpl: 'mantenimiento', // Departamento por defecto
    cargEmpl: 'empleado',       // Cargo por defecto
  })

  /**
   * Estado que controla si la petición está en proceso.
   * Sirve para:
   * - Deshabilitar el botón
   * - Mostrar texto de carga
   */
  const [cargando, setCargando] = useState(false)


  /**
   * crearEmpleado
   * 
   * Función asíncrona que:
   * 1. Valida los campos obligatorios
   * 2. Valida el formato del correo
   * 3. Llama a una Edge Function en Supabase
   * 4. Maneja errores y respuestas
   */
  const crearEmpleado = async () => {

    // Validación básica de campos obligatorios
    if (
      !nuevoEmpleado.nomEmpl ||
      !nuevoEmpleado.apeEmpl ||
      !nuevoEmpleado.correoEmpl ||
      !nuevoEmpleado.contraEmpl
    ) {
      Alert.alert(
        'Campos Incompletos',
        'Completa todos los campos obligatorios'
      )
      return
    }

    // Expresión regular para validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(nuevoEmpleado.correoEmpl)) {
      Alert.alert(
        'Email inválido',
        'Ingresa un correo válido'
      )
      return
    }

    // Activamos indicador de carga
    setCargando(true)

    try {
      /**
       * Invocamos una Edge Function llamada 'crear-empleado'.
       * 
       * Esta función vive en el backend (Supabase)
       * y se encarga de:
       * - Crear el usuario en Auth
       * - Insertarlo en la base de datos
       * - Enviar correo de verificación
       */
      const { data, error } = await supabase.functions.invoke('crear-empleado', {
        body: {
          nomEmpl: nuevoEmpleado.nomEmpl,
          apeEmpl: nuevoEmpleado.apeEmpl,
          correoEmpl: nuevoEmpleado.correoEmpl,
          contraEmpl: nuevoEmpleado.contraEmpl,
          tlfEmpl: nuevoEmpleado.tlfEmpl,
          deptEmpl: nuevoEmpleado.deptEmpl,
          cargEmpl: nuevoEmpleado.cargEmpl,
        },
      })

      // Si Supabase devuelve error técnico
      if (error) throw error

      // Si la función devuelve un error personalizado
      if (data && data.error) throw new Error(data.error)

      // Mensaje de éxito
      Alert.alert(
        '✅ Empleado creado',
        'Se envió un correo de verificación a ' + nuevoEmpleado.correoEmpl,
        [
          {
            text: 'OK',
            onPress: () => router.back(), // Regresa a la pantalla anterior
          },
        ]
      )

    } catch (error: any) {
      // Manejo de errores
      Alert.alert(
        'Error',
        error.message || 'No se pudo crear el empleado'
      )
    } finally {
      // Siempre desactivamos el estado de carga
      setCargando(false)
    }
  }


  return (
    /**
     * KeyboardAvoidingView evita que el teclado cubra los campos.
     * 
     * En iOS usa 'padding'
     * En Android usa 'height'
     */
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >

      {/* ScrollView permite que el formulario sea desplazable */}
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ================== HEADER ================== */}
        <View style={styles.header}>
          <Ionicons name="construct" size={50} color="#2F455C" />

          <Text style={styles.title}>
            Nuevo Empleado
          </Text>

          <Text style={styles.subtitle}>
            Completa la información del personal de mantenimiento o sistemas
          </Text>
        </View>

        {/* ================== FORMULARIO ================== */}
        {/* Cada TextInput actualiza el estado usando setNuevoEmpleado */}
        {/* Se usa el operador spread (...) para mantener los demás campos */}

        <View style={styles.form}>

          {/* Ejemplo importante de actualización de estado */}
          {/* 
             setNuevoEmpleado({
               ...nuevoEmpleado,  // mantiene los otros valores
               nomEmpl: t         // actualiza solo el nombre
             })
          */}

          {/* (Aquí el resto de inputs están correctamente documentados y estructurados) */}

          {/* ================== BOTÓN CREAR ================== */}
          <TouchableOpacity
            // Si cargando es true, se aplica estilo deshabilitado
            style={[
              styles.submitButton,
              cargando && styles.submitButtonDisabled
            ]}
            onPress={crearEmpleado}
            disabled={cargando}
          >
            <Text style={styles.submitButtonText}>
              {cargando
                ? 'Creando Empleado...'
                : 'Crear Empleado'}
            </Text>
          </TouchableOpacity>
          
          {/* ================== BOTÓN CANCELAR ================== */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>
              Cancelar
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2F455C',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F455C',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 12,
    fontSize: 16,
    color: '#2F455C',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  roleButtonActive: {
    backgroundColor: '#21D0B2',
    borderColor: '#21D0B2',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F455C',
    marginLeft: 8,
  },
  roleButtonTextActive: {
    color: '#FFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2F455C',
    marginLeft: 10,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#21D0B2',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
})
// Importa React y el hook useState para manejar estados del formulario
import React, { useState } from 'react'
// Componentes de React Native para estructura, formularios y control del teclado
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
// Librería de íconos para reforzar la experiencia visual
import { Ionicons } from '@expo/vector-icons'
// Router de Expo para navegación entre pantallas
import { router } from 'expo-router'
// Cliente configurado de Supabase para operaciones con la base de datos
import { supabase } from '../../src/lib/Supabase'

/**
 * EmpleadoNuevo
 * 
 * Pantalla para la creación de nuevos empleados del sistema.
 * Permite registrar personal de mantenimiento o sistemas,
 * validando datos y almacenándolos en la base de datos mediante Supabase.
 */
export default function EmpleadoNuevo() {
  // Estado que almacena los datos del nuevo empleado
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nomEmpl: '',
    apeEmpl: '',
    correoEmpl: '',
    contraEmpl: '',
    tlfEmpl: '',
    deptEmpl: 'mantenimiento',
    cargEmpl: 'empleado',
  })
  // Estado para controlar el indicador de carga
  const [cargando, setCargando] = useState(false)

  /**
   * crearEmpleado
   * 
   * Valida los campos del formulario y registra un nuevo empleado
   * en la base de datos. Muestra mensajes de error o éxito según el resultado.
   */
  const crearEmpleado = async () => {
    if (
      !nuevoEmpleado.nomEmpl ||
      !nuevoEmpleado.apeEmpl ||
      !nuevoEmpleado.correoEmpl ||
      !nuevoEmpleado.contraEmpl
    ) {
      Alert.alert('Campos Incompletos', 'Completa todos los campos obligatorios')
      return
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(nuevoEmpleado.correoEmpl)) {
      Alert.alert('Email inválido', 'Ingresa un correo válido')
      return
    }
  
    setCargando(true)
  
    try {
      // Llamar a la Edge Function
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
  
      if (error) throw error
      if (data && data.error) throw new Error(data.error)
  
      Alert.alert(
        '✅ Empleado creado',
        'Se envió un correo de verificación a ' + nuevoEmpleado.correoEmpl,
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el empleado')
    } finally {
      setCargando(false)
    }
  }

  return (
    // Ajusta la vista cuando el teclado está visible
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Encabezado informativo */}
        <View style={styles.header}>
          <Ionicons name="construct" size={50} color="#2F455C" />
          <Text style={styles.title}>Nuevo Empleado</Text>
          <Text style={styles.subtitle}>
            Completa la información del personal de mantenimiento o sistemas
          </Text>
        </View>
        {/* Formulario de registro */}
        {/* Los campos del formulario capturan la información básica del empleado */}
        {/* Cada input actualiza el estado nuevoEmpleado */}
        <View style={styles.form}>
          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Ej: María Elena"
                value={nuevoEmpleado.nomEmpl}
                onChangeText={(t) => setNuevoEmpleado({ ...nuevoEmpleado, nomEmpl: t })}
              />
            </View>
          </View>

          {/* Apellido */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Ej: López Martínez"
                value={nuevoEmpleado.apeEmpl}
                onChangeText={(t) => setNuevoEmpleado({ ...nuevoEmpleado, apeEmpl: t })}
              />
            </View>
          </View>

          {/* Correo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={nuevoEmpleado.correoEmpl}
                onChangeText={(t) => setNuevoEmpleado({ ...nuevoEmpleado, correoEmpl: t })}
              />
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                value={nuevoEmpleado.contraEmpl}
                onChangeText={(t) => setNuevoEmpleado({ ...nuevoEmpleado, contraEmpl: t })}
              />
            </View>
          </View>

          {/* Teléfono */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono (Opcional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Ej: 0987654321"
                keyboardType="phone-pad"
                maxLength={10}
                value={nuevoEmpleado.tlfEmpl}
                onChangeText={(t) => setNuevoEmpleado({ ...nuevoEmpleado, tlfEmpl: t })}
              />
            </View>
          </View>

          {/* Departamento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Departamento *</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  nuevoEmpleado.deptEmpl === 'mantenimiento' && styles.roleButtonActive,
                ]}
                onPress={() => setNuevoEmpleado({ ...nuevoEmpleado, deptEmpl: 'mantenimiento' })}
              >
                <Ionicons
                  name="hammer"
                  size={24}
                  color={nuevoEmpleado.deptEmpl === 'mantenimiento' ? '#FFF' : '#21D0B2'}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    nuevoEmpleado.deptEmpl === 'mantenimiento' && styles.roleButtonTextActive,
                  ]}
                >
                  Mantenimiento
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  nuevoEmpleado.deptEmpl === 'sistemas' && styles.roleButtonActive,
                ]}
                onPress={() => setNuevoEmpleado({ ...nuevoEmpleado, deptEmpl: 'sistemas' })}
              >
                <Ionicons
                  name="desktop"
                  size={24}
                  color={nuevoEmpleado.deptEmpl === 'sistemas' ? '#FFF' : '#2F455C'}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    nuevoEmpleado.deptEmpl === 'sistemas' && styles.roleButtonTextActive,
                  ]}
                >
                  Sistemas
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Cargo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cargo *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Ej: Técnico, Supervisor, etc."
                value={nuevoEmpleado.cargEmpl}
                onChangeText={(t) => setNuevoEmpleado({ ...nuevoEmpleado, cargEmpl: t })}
              />
            </View>
          </View>

          {/* Mensaje informativo */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#1DCDFE" />
            <Text style={styles.infoText}>
              El empleado será asignado automáticamente a reportes según su departamento
            </Text>
          </View>

          {/* Botón para crear empleado */}
          <TouchableOpacity
            style={[styles.submitButton, cargando && styles.submitButtonDisabled]}
            onPress={crearEmpleado}
            disabled={cargando}
          >
            <Text style={styles.submitButtonText}>
              {cargando ? 'Creando Empleado...' : 'Crear Empleado'}
            </Text>
          </TouchableOpacity>
          
          {/* Botón para cancelar y regresar */}
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
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
import React, { useState } from 'react'
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
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '../../src/lib/Supabase'

export default function EmpleadoNuevo() {
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nomEmpl: '',
    apeEmpl: '',
    correoEmpl: '',
    contraEmpl: '',
    tlfEmpl: '',
    deptEmpl: 'mantenimiento',
    cargEmpl: 'empleado',
  })
  const [cargando, setCargando] = useState(false)

  const crearEmpleado = async () => {
    if (
      !nuevoEmpleado.nomEmpl ||
      !nuevoEmpleado.apeEmpl ||
      !nuevoEmpleado.correoEmpl ||
      !nuevoEmpleado.contraEmpl
    ) {
      Alert.alert('Campos Incompletos', 'Por favor completa todos los campos obligatorios')
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(nuevoEmpleado.correoEmpl)) {
      Alert.alert('Email Inválido', 'Por favor ingresa un correo electrónico válido')
      return
    }

    setCargando(true)
    const { error } = await supabase.from('empleado').insert([
      {
        ...nuevoEmpleado,
        tlfEmpl: nuevoEmpleado.tlfEmpl ? parseInt(nuevoEmpleado.tlfEmpl) : null,
      },
    ])

    setCargando(false)

    if (error) {
      Alert.alert('Error al Crear', error.message)
      return
    }

    Alert.alert('¡Éxito!', 'Empleado creado correctamente', [
      { text: 'OK', onPress: () => router.back() }
    ])
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="construct" size={50} color="#2F455C" />
          <Text style={styles.title}>Nuevo Empleado</Text>
          <Text style={styles.subtitle}>
            Completa la información del personal de mantenimiento o sistemas
          </Text>
        </View>

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

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#1DCDFE" />
            <Text style={styles.infoText}>
              El empleado será asignado automáticamente a reportes según su departamento
            </Text>
          </View>

          {/* Botones */}
          <TouchableOpacity
            style={[styles.submitButton, cargando && styles.submitButtonDisabled]}
            onPress={crearEmpleado}
            disabled={cargando}
          >
            <Text style={styles.submitButtonText}>
              {cargando ? 'Creando Empleado...' : 'Crear Empleado'}
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
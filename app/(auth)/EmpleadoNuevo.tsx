import React, { useState } from 'react'
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
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { styles } from '../../src/components/empleadoNuevoStyles'
import {
  NuevoEmpleadoForm,
  validarEmpleado,
  crearEmpleadoDB,
} from '../../src/services/EmpleadoNuevoService'

export default function EmpleadoNuevo() {
  const [nuevoEmpleado, setNuevoEmpleado] = useState<NuevoEmpleadoForm>({
    nomEmpl: '',
    apeEmpl: '',
    correoEmpl: '',
    contraEmpl: '',
    tlfEmpl: '',
    deptEmpl: 'mantenimiento',
    cargEmpl: 'empleado',
  })
  const [cargando, setCargando] = useState(false)

  const set = (campo: keyof NuevoEmpleadoForm, valor: string) =>
    setNuevoEmpleado((prev) => ({ ...prev, [campo]: valor }))

  const handleCrear = async () => {
    const error = validarEmpleado(nuevoEmpleado)
    if (error) { Alert.alert('Campos Incompletos', error); return }

    setCargando(true)
    try {
      await crearEmpleadoDB(nuevoEmpleado)
      Alert.alert(
        '✅ Empleado creado',
        'Se envió un correo de verificación a ' + nuevoEmpleado.correoEmpl,
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear el empleado')
    } finally {
      setCargando(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
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
                onChangeText={(t) => set('nomEmpl', t)}
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
                onChangeText={(t) => set('apeEmpl', t)}
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
                onChangeText={(t) => set('correoEmpl', t)}
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
                onChangeText={(t) => set('contraEmpl', t)}
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
                onChangeText={(t) => set('tlfEmpl', t)}
              />
            </View>
          </View>

          {/* Departamento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Departamento *</Text>
            <View style={styles.roleContainer}>
              {(['mantenimiento', 'sistemas'] as const).map((dep) => (
                <TouchableOpacity
                  key={dep}
                  style={[styles.roleButton, nuevoEmpleado.deptEmpl === dep && styles.roleButtonActive]}
                  onPress={() => set('deptEmpl', dep)}
                >
                  <Ionicons
                    name={dep === 'mantenimiento' ? 'hammer' : 'desktop'}
                    size={24}
                    color={nuevoEmpleado.deptEmpl === dep ? '#FFF' : dep === 'mantenimiento' ? '#21D0B2' : '#2F455C'}
                  />
                  <Text style={[styles.roleButtonText, nuevoEmpleado.deptEmpl === dep && styles.roleButtonTextActive]}>
                    {dep === 'mantenimiento' ? 'Mantenimiento' : 'Sistemas'}
                  </Text>
                </TouchableOpacity>
              ))}
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
                onChangeText={(t) => set('cargEmpl', t)}
              />
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#1DCDFE" />
            <Text style={styles.infoText}>
              El empleado será asignado automáticamente a reportes según su departamento
            </Text>
          </View>

          {/* Botones */}
          <TouchableOpacity
            style={[styles.submitButton, cargando && styles.submitButtonDisabled]}
            onPress={handleCrear}
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
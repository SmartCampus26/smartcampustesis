// 👷 EmpleadoNuevo.tsx
// Pantalla para registrar un nuevo colaborador (personal de mantenimiento o sistemas).
// Permite ingresar datos personales, asignar departamento y cargo,
// y crear la cuenta en Supabase Auth + tabla empleado.

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import * as React from 'react'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { styles } from '../../src/components/empleadoNuevoStyles'
import { useToast } from '../../src/components/ToastContext'
import { useSesion } from '../../src/context/SesionContext'
import {
  crearEmpleadoDB,
  NuevoEmpleadoForm,
  validarEmpleado,
} from '../../src/services/empleado/EmpleadoNuevoService'


// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Pantalla de registro de nuevo colaborador.
 * Al crear exitosamente, Supabase envía un correo de verificación
 * y la app navega de vuelta automáticamente tras 4 segundos.
 */
export default function EmpleadoNuevo() {
  const { showToast } = useToast()
  const { sesion, refrescarSesion } = useSesion() 

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [nuevoEmpleado, setNuevoEmpleado] = useState<NuevoEmpleadoForm>({
    nomEmpl:   '',
    apeEmpl:   '',
    correoEmpl: '',
    contraEmpl: '',
    tlfEmpl:   '',
    deptEmpl:  'mantenimiento',
    cargEmpl:  'colaborador',
  })
  const [cargando, setCargando]               = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  /**
   * Actualiza un campo individual del formulario sin mutar el resto.
   * @param campo - Clave del campo a actualizar
   * @param valor - Nuevo valor del campo
   */
  const set = (campo: keyof NuevoEmpleadoForm, valor: string) =>
    setNuevoEmpleado((prev) => ({ ...prev, [campo]: valor }))

  // ── Crear colaborador ─────────────────────────────────────────────────────

  /**
   * Valida el formulario y crea el colaborador en Supabase.
   * Si la validación falla, muestra un toast de error.
   * Si la creación es exitosa, muestra un toast de éxito
   * y vuelve atrás automáticamente tras 4 segundos.
   */
  const handleCrear = async () => {
    const error = validarEmpleado(nuevoEmpleado)
    if (error) { showToast(error, 'error'); return }

    setCargando(true)
    try {
      await crearEmpleadoDB(nuevoEmpleado)
      await refrescarSesion()  // ← resincroniza el contexto con AsyncStorage
      showToast('Colaborador creado. Se envió un correo de verificación a ' + nuevoEmpleado.correoEmpl, 'success', 4000)
      setTimeout(() => router.replace('/(auth)/CrearMenu'), 4000)
    } catch (err: any) {
      showToast(err.message || 'No se pudo crear el colaborador', 'error')
    } finally {
      setCargando(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="construct" size={50} color="#2F455C" />
          <Text style={styles.title}>Nuevo Colaborador</Text>
          <Text style={styles.subtitle}>
            Completa la información del personal de mantenimiento o sistemas
          </Text>
        </View>

        <View style={styles.form}>

          {/* ── Nombre ── */}
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

          {/* ── Apellido ── */}
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

          {/* ── Correo electrónico ── */}
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

          {/* ── Contraseña con toggle de visibilidad ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry={!mostrarContrasena}
                value={nuevoEmpleado.contraEmpl}
                onChangeText={(t) => set('contraEmpl', t)}
              />
              {/* Botón para alternar visibilidad de contraseña */}
              <TouchableOpacity onPress={() => setMostrarContrasena(prev => !prev)}>
                {mostrarContrasena
                  ? <EyeOff size={20} color="#6B7280" />
                  : <Eye size={20} color="#6B7280" />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Teléfono (opcional) ── */}
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

          {/* ── Selector de departamento ── */}
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

          {/* ── Selector de cargo ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cargo *</Text>
            <View style={styles.roleContainer}>
              {(['colaborador', 'jefe'] as const).map((cargo) => (
                <TouchableOpacity
                  key={cargo}
                  style={[styles.roleButton, nuevoEmpleado.cargEmpl === cargo && styles.roleButtonActive]}
                  onPress={() => set('cargEmpl', cargo)}
                >
                  <Ionicons
                    name={cargo === 'jefe' ? 'shield-checkmark' : 'person'}
                    size={24}
                    color={nuevoEmpleado.cargEmpl === cargo ? '#FFF' : cargo === 'jefe' ? '#21D0B2' : '#2F455C'}
                  />
                  <Text style={[styles.roleButtonText, nuevoEmpleado.cargEmpl === cargo && styles.roleButtonTextActive]}>
                    {cargo === 'jefe' ? 'Jefe' : 'Colaborador'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Nota informativa ── */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#1DCDFE" />
            <Text style={styles.infoText}>
              El reporte será asignado directamente al jefe de cada departamento.
            </Text>
          </View>

          {/* ── Botones de acción ── */}
          <TouchableOpacity
            style={[styles.submitButton, cargando && styles.submitButtonDisabled]}
            onPress={handleCrear}
            disabled={cargando}
          >
            <Text style={styles.submitButtonText}>
              {cargando ? 'Creando Colaborador...' : 'Crear Colaborador'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace('/(auth)/CrearMenu')}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
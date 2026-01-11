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

export default function UsuarioNuevo() {
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nomUser: '',
    apeUser: '',
    correoUser: '',
    contraUser: '',
    tlfUser: '',
    rolUser: 'docente',
  })
  const [cargando, setCargando] = useState(false)

  const crearUsuario = async () => {
    if (
      !nuevoUsuario.nomUser ||
      !nuevoUsuario.apeUser ||
      !nuevoUsuario.correoUser ||
      !nuevoUsuario.contraUser
    ) {
      Alert.alert('Campos Incompletos', 'Por favor completa todos los campos obligatorios')
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(nuevoUsuario.correoUser)) {
      Alert.alert('Email Inválido', 'Por favor ingresa un correo electrónico válido')
      return
    }

    setCargando(true)
    const { error } = await supabase.from('usuario').insert([
      {
        ...nuevoUsuario,
        tlfUser: nuevoUsuario.tlfUser ? parseInt(nuevoUsuario.tlfUser) : null,
        fec_reg_user: new Date().toISOString(),
      },
    ])

    setCargando(false)

    if (error) {
      Alert.alert('Error al Crear', error.message)
      return
    }

    Alert.alert('¡Éxito!', 'Usuario creado correctamente', [
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
          <Ionicons name="person-add" size={50} color="#1DCDFE" />
          <Text style={styles.title}>Nuevo Usuario</Text>
          <Text style={styles.subtitle}>
            Completa la información del docente o autoridad
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
                placeholder="Ej: Juan Carlos"
                value={nuevoUsuario.nomUser}
                onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, nomUser: t })}
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
                placeholder="Ej: Pérez García"
                value={nuevoUsuario.apeUser}
                onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, apeUser: t })}
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
                value={nuevoUsuario.correoUser}
                onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, correoUser: t })}
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
                value={nuevoUsuario.contraUser}
                onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, contraUser: t })}
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
                value={nuevoUsuario.tlfUser}
                onChangeText={(t) => setNuevoUsuario({ ...nuevoUsuario, tlfUser: t })}
              />
            </View>
          </View>

          {/* Rol */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rol del Usuario *</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  nuevoUsuario.rolUser === 'docente' && styles.roleButtonActive,
                ]}
                onPress={() => setNuevoUsuario({ ...nuevoUsuario, rolUser: 'docente' })}
              >
                <Ionicons
                  name="school"
                  size={24}
                  color={nuevoUsuario.rolUser === 'docente' ? '#FFF' : '#1DCDFE'}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    nuevoUsuario.rolUser === 'docente' && styles.roleButtonTextActive,
                  ]}
                >
                  Docente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  nuevoUsuario.rolUser === 'autoridad' && styles.roleButtonActive,
                ]}
                onPress={() => setNuevoUsuario({ ...nuevoUsuario, rolUser: 'autoridad' })}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={nuevoUsuario.rolUser === 'autoridad' ? '#FFF' : '#21D0B2'}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    nuevoUsuario.rolUser === 'autoridad' && styles.roleButtonTextActive,
                  ]}
                >
                  Autoridad
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botones */}
          <TouchableOpacity
            style={[styles.submitButton, cargando && styles.submitButtonDisabled]}
            onPress={crearUsuario}
            disabled={cargando}
          >
            <Text style={styles.submitButtonText}>
              {cargando ? 'Creando Usuario...' : 'Crear Usuario'}
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
    backgroundColor: '#1DCDFE',
    borderColor: '#1DCDFE',
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
  submitButton: {
    backgroundColor: '#1DCDFE',
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
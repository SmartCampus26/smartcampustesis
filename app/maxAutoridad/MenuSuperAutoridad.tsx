import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../src/lib/Supabase'

export default function MenuSuperAdmin() {
  const [modalVisible, setModalVisible] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nomUser: '',
    apeUser: '',
    correoUser: '',
    contraUser: '',
    tlfUser: '',
    rolUser: 'docente', // por defecto
  })
  const [cargando, setCargando] = useState(false)

  const crearUsuario = async () => {
    // Validaciones
    if (!nuevoUsuario.nomUser.trim() || 
        !nuevoUsuario.apeUser.trim() || 
        !nuevoUsuario.correoUser.trim() || 
        !nuevoUsuario.contraUser.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios')
      return
    }

    setCargando(true)
    try {
      const { data, error } = await supabase
        .from('usuario')
        .insert([
          {
            nomUser: nuevoUsuario.nomUser,
            apeUser: nuevoUsuario.apeUser,
            correoUser: nuevoUsuario.correoUser,
            contraUser: nuevoUsuario.contraUser,
            tlfUser: nuevoUsuario.tlfUser ? parseInt(nuevoUsuario.tlfUser) : null,
            rolUser: nuevoUsuario.rolUser,
            fec_reg_user: new Date().toISOString(),
          }
        ])

      if (error) {
        console.error('Error al crear usuario:', error)
        Alert.alert('Error', 'No se pudo crear el usuario: ' + error.message)
        return
      }

      Alert.alert('Éxito', 'Usuario creado correctamente')
      setModalVisible(false)
      // Limpiar formulario
      setNuevoUsuario({
        nomUser: '',
        apeUser: '',
        correoUser: '',
        contraUser: '',
        tlfUser: '',
        rolUser: 'docente',
      })
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear usuario')
    } finally {
      setCargando(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administrador</Text>
        <Text style={styles.subtitle}>Emily Ojeda - Acceso Total</Text>
      </View>

      {/* Sección: Navegar a Perfiles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Navegar a Perfiles</Text>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.autoridadButton]}
          onPress={() => router.push('/autoridad/HomeAutoridad')}
        >
          <Text style={styles.navButtonText}>Vista Autoridad</Text>
          <Text style={styles.navButtonDesc}>Gestión y supervisión</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, styles.docenteButton]}
          onPress={() => router.push('/docente/HomeDocente')}
        >
          <Text style={styles.navButtonText}>Vista Docente</Text>
          <Text style={styles.navButtonDesc}>Reportes y seguimiento</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, styles.empleadoButton]}
          onPress={() => router.push('/empleado/HomeEmpleado')}
        >
          <Text style={styles.navButtonText}>Vista Empleado</Text>
          <Text style={styles.navButtonDesc}>Gestión de mantenimiento</Text>
        </TouchableOpacity>
      </View>

      {/* Sección: Gestión de Usuarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Gestión de Usuarios</Text>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Crear Nuevo Usuario</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            'Cerrar Sesión',
            '¿Estás segura de que deseas cerrar sesión?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Cerrar Sesión', 
                style: 'destructive',
                onPress: () => router.replace('/')
              }
            ]
          )
        }}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Modal para Crear Usuario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Crear Nuevo Usuario</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Juan"
                  value={nuevoUsuario.nomUser}
                  onChangeText={(text) => setNuevoUsuario({...nuevoUsuario, nomUser: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pérez"
                  value={nuevoUsuario.apeUser}
                  onChangeText={(text) => setNuevoUsuario({...nuevoUsuario, apeUser: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Correo Electrónico *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@uets.edu.ec"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={nuevoUsuario.correoUser}
                  onChangeText={(text) => setNuevoUsuario({...nuevoUsuario, correoUser: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry
                  value={nuevoUsuario.contraUser}
                  onChangeText={(text) => setNuevoUsuario({...nuevoUsuario, contraUser: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0987654321"
                  keyboardType="phone-pad"
                  value={nuevoUsuario.tlfUser}
                  onChangeText={(text) => setNuevoUsuario({...nuevoUsuario, tlfUser: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Rol *</Text>
                <View style={styles.rolContainer}>
                  <TouchableOpacity
                    style={[
                      styles.rolButton,
                      nuevoUsuario.rolUser === 'autoridad' && styles.rolButtonActive
                    ]}
                    onPress={() => setNuevoUsuario({...nuevoUsuario, rolUser: 'autoridad'})}
                  >
                    <Text style={[
                      styles.rolButtonText,
                      nuevoUsuario.rolUser === 'autoridad' && styles.rolButtonTextActive
                    ]}>
                      Autoridad
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rolButton,
                      nuevoUsuario.rolUser === 'docente' && styles.rolButtonActive
                    ]}
                    onPress={() => setNuevoUsuario({...nuevoUsuario, rolUser: 'docente'})}
                  >
                    <Text style={[
                      styles.rolButtonText,
                      nuevoUsuario.rolUser === 'docente' && styles.rolButtonTextActive
                    ]}>
                      Docente
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={crearUsuario}
                  disabled={cargando}
                >
                  <Text style={styles.saveButtonText}>
                    {cargando ? 'Creando...' : 'Crear Usuario'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#2F455C',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#21D0B2',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 16,
  },
  navButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  autoridadButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  docenteButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  empleadoButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 4,
  },
  navButtonDesc: {
    fontSize: 14,
    color: '#8B9BA8',
  },
  createButton: {
    backgroundColor: '#21D0B2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
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
    paddingVertical: 12,
    fontSize: 16,
    color: '#2F455C',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  rolContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rolButton: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E8ED',
  },
  rolButtonActive: {
    backgroundColor: '#21D0B2',
    borderColor: '#21D0B2',
  },
  rolButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2F455C',
  },
  rolButtonTextActive: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  cancelButtonText: {
    color: '#2F455C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#21D0B2',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
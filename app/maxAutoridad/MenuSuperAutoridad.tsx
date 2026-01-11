// Importa React y hook para manejar estados (formularios, modales, carga, etc.)
import React, { useState } from 'react'

// Importa componentes visuales de React Native
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
// Navegación entre pantalla
import { router } from 'expo-router'
// Conexión a la base de datos Supabase
import { supabase } from '../../src/lib/Supabase'

// Componente del menú del Super Administrador
export default function MenuSuperAdmin() {
  // Controla la visibilidad de los modales
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false)
  const [modalEmpleadoVisible, setModalEmpleadoVisible] = useState(false)
  
  // ESTADOS PARA FORMULARIO USUARIO
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nomUser: '',
    apeUser: '',
    correoUser: '',
    contraUser: '',
    tlfUser: '',
    rolUser: 'docente', // por defecto
  })

  // ESTADOS PARA FORMULARIO EMPLEADO
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nomEmpl: '',
    apeEmpl: '',
    correoEmpl: '',
    contraEmpl: '',
    tlfEmpl: '',
    deptEmpl: 'mantenimiento', // por defecto
    cargEmpl: 'empleado', // por defecto
  })

  // ESTADOS DE CARGA
  const [cargandoUsuario, setCargandoUsuario] = useState(false)
  const [cargandoEmpleado, setCargandoEmpleado] = useState(false)

  // FUNCIÓN: CREAR USUARIO
  const crearUsuario = async () => {
    // Validaciones
    if (!nuevoUsuario.nomUser.trim() || 
        !nuevoUsuario.apeUser.trim() || 
        !nuevoUsuario.correoUser.trim() || 
        !nuevoUsuario.contraUser.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios')
      return
    }

    
    setCargandoUsuario(true)
    try {
      // Inserta el usuario en la base de datos
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
      
      // Mensaje de éxito y limpieza del formulario
      Alert.alert('Éxito', 'Usuario creado correctamente')
      setModalUsuarioVisible(false)
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
      setCargandoUsuario(false)
    }
  }

  // FUNCIÓN: CREAR EMPLEADO
  const crearEmpleado = async () => {
    // Validación de campos obligatorios
    if (!nuevoEmpleado.nomEmpl.trim() || 
        !nuevoEmpleado.apeEmpl.trim() || 
        !nuevoEmpleado.correoEmpl.trim() || 
        !nuevoEmpleado.contraEmpl.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios')
      return
    }

    setCargandoEmpleado(true)
    try {
      // Inserta el empleado en la base de datos
      const { data, error } = await supabase
        .from('empleado')
        .insert([
          {
            nomEmpl: nuevoEmpleado.nomEmpl,
            apeEmpl: nuevoEmpleado.apeEmpl,
            correoEmpl: nuevoEmpleado.correoEmpl,
            contraEmpl: nuevoEmpleado.contraEmpl,
            tlfEmpl: nuevoEmpleado.tlfEmpl ? parseInt(nuevoEmpleado.tlfEmpl) : null,
            deptEmpl: nuevoEmpleado.deptEmpl,
            cargEmpl: nuevoEmpleado.cargEmpl,
          }
        ])

      if (error) {
        console.error('Error al crear empleado:', error)
        Alert.alert('Error', 'No se pudo crear el empleado: ' + error.message)
        return
      }

      // Mensaje de éxito y limpieza del formulario
      Alert.alert('Éxito', 'Empleado creado correctamente')
      setModalEmpleadoVisible(false)
      // Limpiar formulario
      setNuevoEmpleado({
        nomEmpl: '',
        apeEmpl: '',
        correoEmpl: '',
        contraEmpl: '',
        tlfEmpl: '',
        deptEmpl: 'mantenimiento',
        cargEmpl: 'empleado',
      })
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear empleado')
    } finally {
      setCargandoEmpleado(false)
    }
  }

  // INTERFAZ DE USUARIO
  return (
    <ScrollView style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administrador</Text>
        <Text style={styles.subtitle}>Emily Ojeda - Acceso Total</Text>
      </View>

      {/* NAVEGACIÓN ENTRE PERFILES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Navegar a Perfiles</Text>
        
        {/* Botón vista Autoridad */}
        <TouchableOpacity 
          style={[styles.navButton, styles.autoridadButton]}
          onPress={() => router.push('/autoridad/HomeAutoridad')}
        >
          <Text style={styles.navButtonText}>Vista Autoridad</Text>
          <Text style={styles.navButtonDesc}>Gestión y supervisión</Text>
        </TouchableOpacity>

        {/* Botón vista Docente */}
        <TouchableOpacity 
          style={[styles.navButton, styles.docenteButton]}
          onPress={() => router.push('/docente/HomeDocente')}
        >
          <Text style={styles.navButtonText}>Vista Docente</Text>
          <Text style={styles.navButtonDesc}>Reportes y seguimiento</Text>
        </TouchableOpacity>

        {/* Botón vista Empleado */}
        <TouchableOpacity 
          style={[styles.navButton, styles.empleadoButton]}
          onPress={() => router.push('/empleado/HomeEmpleado')}
        >
          <Text style={styles.navButtonText}>Vista Empleado</Text>
          <Text style={styles.navButtonDesc}>Gestión de mantenimiento</Text>
        </TouchableOpacity>

        {/* Botón listado general */}
        <TouchableOpacity 
          style={[styles.navButton, styles.listadoButton]}
          onPress={() => router.push('/maxAutoridad/ListadoMaxAutoridad')}
        >
          <Text style={styles.navButtonText}>Listado</Text>
          <Text style={styles.navButtonDesc}>Visualizar personal registrado</Text>
        </TouchableOpacity>
      </View>

      {/* BOTONES DE CREACIÓN */}
      {/* Sección: Gestión de Usuarios y Empleados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Gestión de Personal</Text>
        
        {/* Abrir modal para crear usuario */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setModalUsuarioVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Crear Nuevo Usuario</Text>
          <Text style={styles.createButtonDesc}>(Autoridades y Docentes)</Text>
        </TouchableOpacity>

        {/* Abrir modal para crear empleado */}
        <TouchableOpacity 
          style={[styles.createButton, styles.createEmpleadoButton]}
          onPress={() => setModalEmpleadoVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Crear Nuevo Empleado</Text>
          <Text style={styles.createButtonDesc}>(Personal de Mantenimiento/Sistemas)</Text>
        </TouchableOpacity>
      </View>

      {/* BOTÓN CERRAR SESIÓN */}
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

      {/* MODAL: CREAR USUARIO */}
      {/* Contiene formulario para registrar autoridades y docentes */}
      <Modal
        animationType="slide" // Animación del modal
        transparent={true} // Fondo transparente
        visible={modalUsuarioVisible} // Controla si el modal se muestra
        onRequestClose={() => setModalUsuarioVisible(false)}
      >
        {/* Contenido del formulario */}
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {/* TÍTULO DEL FORMULARIO */}
              <Text style={styles.modalTitle}>Crear Nuevo Usuario</Text>

              {/* CAMPO: NOMBRE */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Juan"
                  value={nuevoUsuario.nomUser}
                  onChangeText={(text) => setNuevoUsuario({...nuevoUsuario, nomUser: text})}
                />
              </View>
              
              {/* CAMPO: APELLIDO */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pérez"
                  value={nuevoUsuario.apeUser}
                  onChangeText={(text) => setNuevoUsuario({...nuevoUsuario, apeUser: text})}
                />
              </View>

              {/* CAMPO: CORREO */}
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

              {/* CAMPO: CONTRASEÑA */}
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

              {/* CAMPO: TELÉFONO */}
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

              {/* SELECCIÓN DE ROL */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Rol *</Text>
                {/* Botones de selección */}
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
              
              {/* Botones de selección */}
              <View style={styles.modalButtons}>
                {/* Cancelar */}
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalUsuarioVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                {/* Guardar */}
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={crearUsuario}
                  disabled={cargandoUsuario}
                >
                  <Text style={styles.saveButtonText}>
                    {cargandoUsuario ? 'Creando...' : 'Crear Usuario'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL: CREAR EMPLEADO */}
      {/* Contiene formulario para registrar empleados */}
      <Modal
        animationType="slide"  // Animación del modal
        transparent={true} // Fondo transparente
        visible={modalEmpleadoVisible}  // Controla si el modal se muestra
        onRequestClose={() => setModalEmpleadoVisible(false)}
      >
        {/* Contenido del formulario */}
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {/* TÍTULO */}
              <Text style={styles.modalTitle}>Crear Nuevo Empleado</Text>
              
              {/* CAMPOS DE TEXTO */}
              {/* Nombre, Apellido, Correo, Contraseña, Teléfono */}
              {/* Todos controlados con estado */}

              {/* SELECCIÓN DE DEPARTAMENTO */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Carlos"
                  value={nuevoEmpleado.nomEmpl}
                  onChangeText={(text) => setNuevoEmpleado({...nuevoEmpleado, nomEmpl: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ramírez"
                  value={nuevoEmpleado.apeEmpl}
                  onChangeText={(text) => setNuevoEmpleado({...nuevoEmpleado, apeEmpl: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Correo Electrónico *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@uets.edu.ec"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={nuevoEmpleado.correoEmpl}
                  onChangeText={(text) => setNuevoEmpleado({...nuevoEmpleado, correoEmpl: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry
                  value={nuevoEmpleado.contraEmpl}
                  onChangeText={(text) => setNuevoEmpleado({...nuevoEmpleado, contraEmpl: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0987654321"
                  keyboardType="phone-pad"
                  value={nuevoEmpleado.tlfEmpl}
                  onChangeText={(text) => setNuevoEmpleado({...nuevoEmpleado, tlfEmpl: text})}
                />
              </View>
              
              {/* SELECCIÓN DE DEPARTAMENTO */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Departamento *</Text>
                <View style={styles.rolContainer}>
                  <TouchableOpacity
                    style={[
                      styles.rolButton,
                      nuevoEmpleado.deptEmpl === 'mantenimiento' && styles.rolButtonActive
                    ]}
                    onPress={() => setNuevoEmpleado({...nuevoEmpleado, deptEmpl: 'mantenimiento'})}
                  >
                    <Text style={[
                      styles.rolButtonText,
                      nuevoEmpleado.deptEmpl === 'mantenimiento' && styles.rolButtonTextActive
                    ]}>
                      Mantenimiento
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rolButton,
                      nuevoEmpleado.deptEmpl === 'sistemas' && styles.rolButtonActive
                    ]}
                    onPress={() => setNuevoEmpleado({...nuevoEmpleado, deptEmpl: 'sistemas'})}
                  >
                    <Text style={[
                      styles.rolButtonText,
                      nuevoEmpleado.deptEmpl === 'sistemas' && styles.rolButtonTextActive
                    ]}>
                      Sistemas
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* SELECCIÓN DE CARGO */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cargo *</Text>
                <View style={styles.rolContainer}>
                  <TouchableOpacity
                    style={[
                      styles.rolButton,
                      nuevoEmpleado.cargEmpl === 'empleado' && styles.rolButtonActive
                    ]}
                    onPress={() => setNuevoEmpleado({...nuevoEmpleado, cargEmpl: 'empleado'})}
                  >
                    <Text style={[
                      styles.rolButtonText,
                      nuevoEmpleado.cargEmpl === 'empleado' && styles.rolButtonTextActive
                    ]}>
                      Empleado
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rolButton,
                      nuevoEmpleado.cargEmpl === 'jefe' && styles.rolButtonActive
                    ]}
                    onPress={() => setNuevoEmpleado({...nuevoEmpleado, cargEmpl: 'jefe'})}
                  >
                    <Text style={[
                      styles.rolButtonText,
                      nuevoEmpleado.cargEmpl === 'jefe' && styles.rolButtonTextActive
                    ]}>
                      Jefe
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* BOTONES */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalEmpleadoVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={crearEmpleado}
                  disabled={cargandoEmpleado}
                >
                  <Text style={styles.saveButtonText}>
                    {cargandoEmpleado ? 'Creando...' : 'Crear Empleado'}
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
  listadoButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#9B59B6',
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
    marginBottom: 12,
  },
  createEmpleadoButton: {
    backgroundColor: '#FFD93D',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButtonDesc: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
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
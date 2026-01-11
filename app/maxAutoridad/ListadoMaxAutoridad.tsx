// Importa React y hooks para manejar estado y efectos
import React, { useState, useEffect } from 'react'

// Importa componentes visuales de React Native
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
// Navegación entre pantallas
import { router } from 'expo-router'
// Conexión a la base de datos Supabase
import { supabase } from '../../src/lib/Supabase'
// Tipos de datos
import { Usuario, Empleado } from '../../src/types/Database'

// Tipo para controlar los filtros
type TipoPersonal = 'todos' | 'usuarios' | 'empleados'

// Componente principal
export default function ListadoMaxAutoridad() {
  // Estados para almacenar datos y controlar la interfaz de Usuario
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<TipoPersonal>('todos')
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)

  // Se ejecuta una sola vez al cargar la pantalla
  useEffect(() => {
    cargarDatos()
  }, [])

  // Función para cargar usuarios y empleados desde Supabase
  const cargarDatos = async () => {
    try {
      // Obtener usuarios
      const { data: dataUsuarios, error: errorUsuarios } = await supabase
        .from('usuario')
        .select('*')
        .order('nomUser', { ascending: true })

      if (errorUsuarios) {
        console.error('Error al cargar usuarios:', errorUsuarios)
      } else {
        setUsuarios(dataUsuarios || [])
      }

      // Obtener empleados
      const { data: dataEmpleados, error: errorEmpleados } = await supabase
        .from('empleado')
        .select('*')
        .order('nomEmpl', { ascending: true })

      if (errorEmpleados) {
        console.error('Error al cargar empleados:', errorEmpleados)
      } else {
        setEmpleados(dataEmpleados || [])
      }
    } catch (error) {
      console.error('Error general:', error)
      Alert.alert('Error', 'No se pudieron cargar los datos')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  
  // Refresca los datos al deslizar hacia abajo
  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }

  // Elimina un usuario con confirmación
  const eliminarUsuario = (id: number, nombre: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás segura de eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('usuario')
                .delete()
                .eq('idUser', id)

              if (error) {
                Alert.alert('Error', 'No se pudo eliminar el usuario')
                return
              }

              Alert.alert('Éxito', 'Usuario eliminado correctamente')
              cargarDatos()
            } catch (error) {
              Alert.alert('Error', 'Ocurrió un error al eliminar')
            }
          }
        }
      ]
    )
  }

  // Elimina un empleado con confirmación
  const eliminarEmpleado = (id: number, nombre: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás segura de eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('empleado')
                .delete()
                .eq('idEmpl', id)

              if (error) {
                Alert.alert('Error', 'No se pudo eliminar el empleado')
                return
              }

              Alert.alert('Éxito', 'Empleado eliminado correctamente')
              cargarDatos()
            } catch (error) {
              Alert.alert('Error', 'Ocurrió un error al eliminar')
            }
          }
        }
      ]
    )
  }

  // Filtra usuarios según texto de búsqueda
  const usuariosFiltrados = usuarios.filter(usuario => {
    const terminoBusqueda = busqueda.toLowerCase() 
    return (
      usuario.nomUser.toLowerCase().includes(terminoBusqueda) ||
      usuario.apeUser.toLowerCase().includes(terminoBusqueda) ||
      usuario.correoUser.toLowerCase().includes(terminoBusqueda) ||
      usuario.rolUser.toLowerCase().includes(terminoBusqueda) ||
      usuario.idUser.toString().includes(terminoBusqueda)
    )
  })

  // Filtra empleados según el texto de búsqueda
  const empleadosFiltrados = empleados.filter(empleado => {
    const terminoBusqueda = busqueda.toLowerCase()
    return (
      empleado.nomEmpl.toLowerCase().includes(terminoBusqueda) ||
      empleado.apeEmpl.toLowerCase().includes(terminoBusqueda) ||
      empleado.correoEmpl.toLowerCase().includes(terminoBusqueda) ||
      empleado.deptEmpl.toLowerCase().includes(terminoBusqueda) ||
      empleado.cargEmpl.toLowerCase().includes(terminoBusqueda) ||
      empleado.idEmpl.toString().includes(terminoBusqueda)
    )
  })

  // Función que renderiza la tarjeta visual de un usuario
  const renderUsuario = (usuario: Usuario) => (
    // Contenedor principal de la tarjeta del usuario
    <View key={usuario.idUser} style={[styles.card, styles.usuarioCard]}>
      {/* Encabezado de la tarjeta */}
      <View style={styles.cardHeader}>
        {/* Lado izquierdo: nombre y rol */}
        <View style={styles.cardHeaderLeft}>
          {/* Nombre completo del usuario */}
          <Text style={styles.cardName}>
            {usuario.nomUser} {usuario.apeUser}
          </Text>
          {/* Etiqueta que muestra el rol del usuario */}
          <View style={[
            styles.badge,
            usuario.rolUser === 'autoridad' ? styles.badgeAutoridad : styles.badgeDocente
          ]}>
            <Text style={styles.badgeText}>
              {usuario.rolUser === 'autoridad' ? '👔 Autoridad' : '📚 Docente'}
            </Text>
          </View>
        </View>
        {/* Botón para eliminar usuario */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarUsuario(usuario.idUser, `${usuario.nomUser} ${usuario.apeUser}`)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Cuerpo de la tarjeta con información adicional */}
      <View style={styles.cardBody}>
        {/* Correo */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Correo:</Text>
          <Text style={styles.infoValue}>{usuario.correoUser}</Text>
        </View>
        {/* Teléfono */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Teléfono:</Text>
          <Text style={styles.infoValue}>{usuario.tlfUser || 'No registrado'}</Text>
        </View>
        {/* Fecha de registro */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Registro:</Text>
          <Text style={styles.infoValue}>
            {usuario.fec_reg_user ? new Date(usuario.fec_reg_user).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        {/* ID */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🆔 ID:</Text>
          <Text style={styles.infoValue}>{usuario.idUser}</Text>
        </View>
      </View>
    </View>
  )

  // Función que renderiza la tarjeta visual de un empleado
  const renderEmpleado = (empleado: Empleado) => (
    // Contenedor principal de la tarjeta del empleado
    <View key={empleado.idEmpl} style={[styles.card, styles.empleadoCard]}>
      {/* Encabezado de la tarjeta */}
      <View style={styles.cardHeader}>
        {/* Lado izquierdo: nombre y cargos */}
        <View style={styles.cardHeaderLeft}>
          {/* Nombre completo del empleado */}
          <Text style={styles.cardName}>
            {empleado.nomEmpl} {empleado.apeEmpl}
          </Text>
          {/* Contenedor de etiquetas */}
          <View style={styles.badgeContainer}>
            {/* Departamento */}
            <View style={[styles.badge, styles.badgeDepartamento]}>
              <Text style={styles.badgeText}>
                {empleado.deptEmpl === 'mantenimiento' ? '🔧 Mantenimiento' : '💻 Sistemas'}
              </Text>
            </View>
            {/* Cargo */}
            <View style={[
              styles.badge,
              empleado.cargEmpl === 'jefe' ? styles.badgeJefe : styles.badgeEmpleado
            ]}>
              <Text style={styles.badgeText}>
                {empleado.cargEmpl === 'jefe' ? '👨‍💼 Jefe' : '👷 Empleado'}
              </Text>
            </View>
          </View>
        </View>
        {/* Botón para eliminar empleado */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarEmpleado(empleado.idEmpl, `${empleado.nomEmpl} ${empleado.apeEmpl}`)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      
      {/* Cuerpo de la tarjeta */}
      <View style={styles.cardBody}>
        {/* Correo */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Correo:</Text>
          <Text style={styles.infoValue}>{empleado.correoEmpl}</Text>
        </View>
        {/* Teléfono */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Teléfono:</Text>
          <Text style={styles.infoValue}>{empleado.tlfEmpl || 'No registrado'}</Text>
        </View>
        {/* ID */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🆔 ID:</Text>
          <Text style={styles.infoValue}>{empleado.idEmpl}</Text>
        </View>
      </View>
    </View>
  )

  // Muestra un indicador visual mientras los datos se están cargando
  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#21D0B2" />
        <Text style={styles.loadingText}>Cargando personal...</Text>
      </View>
    )
  }

  // Cantidad de usuarios luego del filtro de búsqueda
  const totalUsuarios = usuariosFiltrados.length
  // Cantidad de empleados luego del filtro de búsqueda
  const totalEmpleados = empleadosFiltrados.length
  // Total general de personas 
  const totalGeneral = totalUsuarios + totalEmpleados

  // Interfaz principal de la pantalla
  return (
    <View style={styles.container}>
      {/* ===== ENCABEZADO ===== */}
      <View style={styles.header}>
        {/* Botón para regresar a la pantalla anterior */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        {/* Título principal */}
        <Text style={styles.title}>Listado de Personal</Text>
        {/* Muestra el total de personas */}
        <Text style={styles.subtitle}>Total: {totalGeneral} personas</Text>
      </View>

      {/* ===== BARRA DE BÚSQUEDA ===== */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, correo, rol..."
          placeholderTextColor="#8B9BA8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* ===== FILTROS ===== */}
      <View style={styles.filterContainer}>
        {/* Filtro: Todos */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroActivo === 'todos' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroActivo('todos')}
        >
          <Text style={[
            styles.filterButtonText,
            filtroActivo === 'todos' && styles.filterButtonTextActive
          ]}>
            Todos ({totalGeneral})
          </Text>
        </TouchableOpacity>
        {/* Filtro: Usuarios */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroActivo === 'usuarios' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroActivo('usuarios')}
        >
          <Text style={[
            styles.filterButtonText,
            filtroActivo === 'usuarios' && styles.filterButtonTextActive
          ]}>
            Usuarios ({totalUsuarios})
          </Text>
        </TouchableOpacity>
        {/* Filtro: Empleados */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtroActivo === 'empleados' && styles.filterButtonActive
          ]}
          onPress={() => setFiltroActivo('empleados')}
        >
          <Text style={[
            styles.filterButtonText,
            filtroActivo === 'empleados' && styles.filterButtonTextActive
          ]}>
            Empleados ({totalEmpleados})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== LISTA DE PERSONAL ===== */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
      >
        {/* Mostrar usuarios según el filtro */}
        {(filtroActivo === 'todos' || filtroActivo === 'usuarios') && (
          <>
            {usuariosFiltrados.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>
                  👥 Usuarios ({usuariosFiltrados.length})
                </Text>

                {/* Renderiza cada usuario */}
                {usuariosFiltrados.map(renderUsuario)}
              </>
            ) : busqueda !== '' && filtroActivo === 'usuarios' ? (
              <Text style={styles.noResults}>No se encontraron usuarios</Text>
            ) : null}
          </>
        )}

        {/* Mostrar empleados según el filtro */}
        {(filtroActivo === 'todos' || filtroActivo === 'empleados') && (
          <>
            {empleadosFiltrados.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>
                  🔧 Empleados ({empleadosFiltrados.length})
                </Text>
                {empleadosFiltrados.map(renderEmpleado)}
              </>
            ) : busqueda !== '' && filtroActivo === 'empleados' ? (
              <Text style={styles.noResults}>No se encontraron empleados</Text>
            ) : null}
          </>
        )}

        {/* Mensaje cuando no hay resultados */}
        {totalGeneral === 0 && busqueda !== '' && (
          <Text style={styles.noResults}>No se encontraron resultados</Text>
        )}

        {/* Espacio inferior */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B9BA8',
  },
  header: {
    backgroundColor: '#2F455C',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#21D0B2',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B9BA8',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2F455C',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E8ED',
  },
  filterButtonActive: {
    backgroundColor: '#21D0B2',
    borderColor: '#21D0B2',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F455C',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F455C',
    marginTop: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usuarioCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  empleadoCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD93D',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F455C',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeAutoridad: {
    backgroundColor: '#FF6B6B20',
  },
  badgeDocente: {
    backgroundColor: '#4ECDC420',
  },
  badgeDepartamento: {
    backgroundColor: '#FFD93D20',
  },
  badgeJefe: {
    backgroundColor: '#9B59B620',
  },
  badgeEmpleado: {
    backgroundColor: '#95A5A620',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F455C',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B9BA8',
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#2F455C',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8B9BA8',
    marginTop: 40,
  },
})
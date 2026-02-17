// Importa React y hooks para manejar estado y ciclo de vida del componente
import React, { useState, useEffect } from 'react'
// Componentes de React Native para la interfaz del usuario, formularios, carga y refresco
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
// Router de Expo para navegación entre pantallas
import { router } from 'expo-router'
// Cliente Supabase configurado para consultas a la base de datos
import { supabase } from '../../src/lib/Supabase'
// Tipos de datos para usuarios y empleados
import { Usuario, Empleado } from '../../src/types/Database'

// Tipo para controlar el filtro activo del listado
type TipoPersonal = 'todos' | 'usuarios' | 'empleados'

/**
 * ListadoMaxAutoridad
 * 
 * Pantalla destinada a la máxima autoridad del sistema.
 * Permite visualizar, buscar, filtrar y eliminar usuarios y empleados,
 * obteniendo la información directamente desde la base de datos.
 */
export default function ListadoMaxAutoridad() {
  // Estados para almacenar usuarios y empleados
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  // Estados para búsqueda, filtros y control de carga
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<TipoPersonal>('todos')
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)

  /**
   * useEffect
   * 
   * Carga los datos al montar la pantalla.
   */
  useEffect(() => {
    cargarDatos()
  }, [])

  /**
   * cargarDatos
   * 
   * Obtiene usuarios y empleados desde Supabase,
   * ordenándolos alfabéticamente
   */
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

  /**
   * onRefresh
   * 
   * Recarga los datos al hacer pull-to-refresh
   */
  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }

  /**
   * eliminarUsuario
   * 
   * Elimina un usuario del sistema previa confirmación
   */
  const eliminarUsuario = (id: string, nombre: string) => {
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

  /**
   * eliminarEmpleado
   * 
   * Elimina un empleado del sistema previa confirmación
   */
  const eliminarEmpleado = (id: string, nombre: string) => {
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

  // Filtrado de usuarios según término de búsqueda
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

  // Filtrado de empleados según término de búsqueda
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

  // Renderizado de tarjeta de usuario
  const renderUsuario = (usuario: Usuario) => (
    <View key={usuario.idUser} style={[styles.card, styles.usuarioCard]}>
    {/* Información del usuario */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardName}>
            {usuario.nomUser} {usuario.apeUser}
          </Text>
          <View style={[
            styles.badge,
            usuario.rolUser === 'autoridad' ? styles.badgeAutoridad : styles.badgeDocente
          ]}>
            <Text style={styles.badgeText}>
              {usuario.rolUser === 'autoridad' ? '👔 Autoridad' : '📚 Docente'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarUsuario(usuario.idUser, `${usuario.nomUser} ${usuario.apeUser}`)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Correo:</Text>
          <Text style={styles.infoValue}>{usuario.correoUser}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Teléfono:</Text>
          <Text style={styles.infoValue}>{usuario.tlfUser || 'No registrado'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Registro:</Text>
          <Text style={styles.infoValue}>
            {usuario.fec_reg_user ? new Date(usuario.fec_reg_user).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🆔 ID:</Text>
          <Text style={styles.infoValue}>{usuario.idUser}</Text>
        </View>
      </View>
    </View>
  )

  // Renderizado de tarjeta de empleado
  const renderEmpleado = (empleado: Empleado) => (
    <View key={empleado.idEmpl} style={[styles.card, styles.empleadoCard]}>
      {/* Información del empleado */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardName}>
            {empleado.nomEmpl} {empleado.apeEmpl}
          </Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, styles.badgeDepartamento]}>
              <Text style={styles.badgeText}>
                {empleado.deptEmpl === 'mantenimiento' ? '🔧 Mantenimiento' : '💻 Sistemas'}
              </Text>
            </View>
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
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarEmpleado(empleado.idEmpl, `${empleado.nomEmpl} ${empleado.apeEmpl}`)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Correo:</Text>
          <Text style={styles.infoValue}>{empleado.correoEmpl}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Teléfono:</Text>
          <Text style={styles.infoValue}>{empleado.tlfEmpl || 'No registrado'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🆔 ID:</Text>
          <Text style={styles.infoValue}>{empleado.idEmpl}</Text>
        </View>
      </View>
    </View>
  )

  // Indicador de carga inicia
  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#21D0B2" />
        <Text style={styles.loadingText}>Cargando personal...</Text>
      </View>
    )
  }

  // Total de usuarios luego de aplicar el filtro de búsqueda
  const totalUsuarios = usuariosFiltrados.length
  // Total de empleados luego de aplicar el filtro de búsqueda
  const totalEmpleados = empleadosFiltrados.length
  // Total general de personas
  const totalGeneral = totalUsuarios + totalEmpleados

  /**
   * Render principal del componente
   * 
   * Incluye:
   * - Encabezado con botón de retorno y contador total
   * - Barra de búsqueda
   * - Filtros por tipo de personal
   * - Listado dinámico con refresco manual
   */
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Botón para regresar a la pantalla anterior */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        {/* Título principal de la pantalla */}
        <Text style={styles.title}>Listado de Personal</Text>
        {/* Contador total de personas */}
        <Text style={styles.subtitle}>Total: {totalGeneral} personas</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, correo, rol..."
          placeholderTextColor="#8B9BA8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Filtros */}
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

      {/* Lista de personal */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
      >
        {/* Mostrar usuarios */}
        {(filtroActivo === 'todos' || filtroActivo === 'usuarios') && (
          <>
            {usuariosFiltrados.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>
                  👥 Usuarios ({usuariosFiltrados.length})
                </Text>
                {usuariosFiltrados.map(renderUsuario)}
              </>
            ) : busqueda !== '' && filtroActivo === 'usuarios' ? (
              <Text style={styles.noResults}>No se encontraron usuarios</Text>
            ) : null}
          </>
        )}

        {/* Mostrar empleados */}
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

        {/* Mensaje general cuando no hay resultados */}
        {totalGeneral === 0 && busqueda !== '' && (
          <Text style={styles.noResults}>No se encontraron resultados</Text>
        )}

        {/* Espaciado inferior para scroll */}
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
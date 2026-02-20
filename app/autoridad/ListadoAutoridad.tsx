// ===============================
// IMPORTACIONES
// ===============================

// React y hooks:
// useState → Manejo de estado reactivo
// useEffect → Ejecutar efectos secundarios (ej: cargar datos al iniciar)
import React, { useState, useEffect } from 'react'

// Componentes visuales de React Native
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl, // Permite actualizar la lista deslizando hacia abajo
} from 'react-native'

// Router para navegación entre pantallas
import { router } from 'expo-router'

// Cliente Supabase para consultas a base de datos
import { supabase } from '../../src/lib/Supabase'

// Tipos TypeScript que definen la estructura de Usuario y Empleado
import { Usuario, Empleado } from '../../src/types/Database'


// Tipo personalizado que controla el filtro activo
type TipoPersonal = 'todos' | 'usuarios' | 'empleados'


export default function ListadoMaxAutoridad() {

  // ===============================
  // ESTADOS
  // ===============================

  // Lista completa de usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  // Lista completa de empleados
  const [empleados, setEmpleados] = useState<Empleado[]>([])

  // Texto ingresado en la barra de búsqueda
  const [busqueda, setBusqueda] = useState('')

  // Controla qué filtro está activo (todos / usuarios / empleados)
  const [filtroActivo, setFiltroActivo] = useState<TipoPersonal>('todos')

  // Controla pantalla de carga inicial
  const [cargando, setCargando] = useState(true)

  // Controla animación de refrescar (pull to refresh)
  const [refrescando, setRefrescando] = useState(false)


  // ===============================
  // EFECTO INICIAL
  // ===============================

  /**
   * useEffect con dependencia vacía []
   * Se ejecuta una sola vez cuando el componente se monta.
   * Llama a la función cargarDatos().
   */
  useEffect(() => {
    cargarDatos()
  }, [])


  // ===============================
  // FUNCIÓN: CARGAR DATOS
  // ===============================

  /**
   * Consulta la base de datos en Supabase:
   * 1️⃣ Obtiene todos los usuarios
   * 2️⃣ Obtiene todos los empleados
   * 3️⃣ Ordena los resultados por nombre ascendente
   */
  const cargarDatos = async () => {
    try {

      // =====================
      // Cargar USUARIOS
      // =====================
      const { data: dataUsuarios, error: errorUsuarios } = await supabase
        .from('usuario')
        .select('*')
        .order('nomUser', { ascending: true })

      if (errorUsuarios) {
        console.error('Error al cargar usuarios:', errorUsuarios)
      } else {
        // Si no hay error, guardamos los datos en el estado
        setUsuarios(dataUsuarios || [])
      }

      // =====================
      // Cargar EMPLEADOS
      // =====================
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
      // Siempre se ejecuta, haya error o no
      setCargando(false)
      setRefrescando(false)
    }
  }


  // ===============================
  // REFRESH MANUAL
  // ===============================

  /**
   * Se ejecuta cuando el usuario desliza hacia abajo.
   * Activa estado de refrescando y vuelve a cargar datos.
   */
  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }


  // ===============================
  // ELIMINAR USUARIO
  // ===============================

  /**
   * Muestra confirmación antes de eliminar.
   * Si el usuario confirma:
   * - Ejecuta DELETE en Supabase
   * - Vuelve a cargar datos
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

              // Recargar lista después de eliminar
              cargarDatos()

            } catch (error) {
              Alert.alert('Error', 'Ocurrió un error al eliminar')
            }
          }
        }
      ]
    )
  }


  // ===============================
  // ELIMINAR EMPLEADO
  // ===============================

  /**
   * Mismo proceso que eliminarUsuario,
   * pero aplicado a la tabla "empleado".
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


  // ===============================
  // FILTROS POR BÚSQUEDA
  // ===============================

  /**
   * Filtrado dinámico en memoria.
   * Convierte todo a minúsculas para hacer búsqueda case-insensitive.
   */
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

  // =====================================================
// FUNCIÓN: renderUsuario
// =====================================================

// Función que recibe un objeto tipo Usuario
// y devuelve el componente visual (card) para mostrarlo en pantalla
const renderUsuario = (usuario: Usuario) => (

    // Contenedor principal de la tarjeta
    // key → obligatorio cuando se renderiza dentro de un .map()
    // style → combina estilos base de card + estilo específico de usuario
    <View key={usuario.idUser} style={[styles.card, styles.usuarioCard]}>

      {/* ================= HEADER DE LA TARJETA ================= */}
      <View style={styles.cardHeader}>

        {/* Parte izquierda del header (nombre + badge) */}
        <View style={styles.cardHeaderLeft}>

          {/* Nombre completo del usuario */}
          <Text style={styles.cardName}>
            {usuario.nomUser} {usuario.apeUser}
          </Text>

          {/* Badge dinámico según el rol */}
          <View style={[
            styles.badge,

            // Si el rol es "autoridad" aplica estilo autoridad
            // Caso contrario aplica estilo docente
            usuario.rolUser === 'autoridad'
              ? styles.badgeAutoridad
              : styles.badgeDocente
          ]}>

            {/* Texto dinámico según rol */}
            <Text style={styles.badgeText}>
              {usuario.rolUser === 'autoridad'
                ? '👔 Autoridad'
                : '📚 Docente'}
            </Text>
          </View>
        </View>

        {/* Botón de eliminar */}
        <TouchableOpacity
          style={styles.deleteButton}

          // Al presionar ejecuta eliminarUsuario()
          // Se envía id y nombre completo
          onPress={() =>
            eliminarUsuario(
              usuario.idUser,
              `${usuario.nomUser} ${usuario.apeUser}`
            )
          }
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* ================= CUERPO DE LA TARJETA ================= */}
      <View style={styles.cardBody}>

        {/* Correo */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Correo:</Text>
          <Text style={styles.infoValue}>{usuario.correoUser}</Text>
        </View>

        {/* Teléfono */}
        {/* Si no existe, muestra "No registrado" */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Teléfono:</Text>
          <Text style={styles.infoValue}>
            {usuario.tlfUser || 'No registrado'}
          </Text>
        </View>

        {/* Fecha de registro */}
        {/* Convierte string a Date y la formatea */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Registro:</Text>
          <Text style={styles.infoValue}>
            {usuario.fec_reg_user
              ? new Date(usuario.fec_reg_user).toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>

        {/* ID del usuario */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🆔 ID:</Text>
          <Text style={styles.infoValue}>{usuario.idUser}</Text>
        </View>

      </View>
    </View>
  )

    // Función que renderiza la tarjeta visual de un empleado.
    const renderEmpleado = (empleado: Empleado) => (

      // Contenedor principal de la tarjeta del empleado.
      // key → obligatorio cuando se usa dentro de un .map()
      <View key={empleado.idEmpl} style={[styles.card, styles.empleadoCard]}>
  
        {/* Header de la tarjeta */}
        <View style={styles.cardHeader}>
  
          {/* Parte izquierda del header */}
          <View style={styles.cardHeaderLeft}>
  
            {/* Nombre completo del empleado */}
            <Text style={styles.cardName}>
              {empleado.nomEmpl} {empleado.apeEmpl}
            </Text>
  
            {/* Contenedor de badges */}
            <View style={styles.badgeContainer}>
  
              {/* Badge del departamento */}
              <View style={[styles.badge, styles.badgeDepartamento]}>
                <Text style={styles.badgeText}>
                  {/* Muestra ícono y texto según el departamento */}
                  {empleado.deptEmpl === 'mantenimiento'
                    ? '🔧 Mantenimiento'
                    : '💻 Sistemas'}
                </Text>
              </View>
  
              {/* Badge del cargo */}
              <View style={[
                styles.badge,
                empleado.cargEmpl === 'jefe'
                  ? styles.badgeJefe
                  : styles.badgeEmpleado
              ]}>
                <Text style={styles.badgeText}>
                  {/* Texto dinámico según cargo */}
                  {empleado.cargEmpl === 'jefe'
                    ? '👨‍💼 Jefe'
                    : '👷 Empleado'}
                </Text>
              </View>
  
            </View>
          </View>
  
          {/* Botón de eliminar empleado */}
          <TouchableOpacity
            style={styles.deleteButton}
  
            // Ejecuta eliminarEmpleado enviando id y nombre completo
            onPress={() =>
              eliminarEmpleado(
                empleado.idEmpl,
                `${empleado.nomEmpl} ${empleado.apeEmpl}`
              )
            }
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
  
          {/* Teléfono (si no existe muestra texto por defecto) */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Teléfono:</Text>
            <Text style={styles.infoValue}>
              {empleado.tlfEmpl || 'No registrado'}
            </Text>
          </View>
  
          {/* ID del empleado */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🆔 ID:</Text>
            <Text style={styles.infoValue}>{empleado.idEmpl}</Text>
          </View>
  
        </View>
      </View>
    )
  
  
    // Si el estado "cargando" es true, muestra pantalla de carga.
    if (cargando) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#21D0B2" />
          <Text style={styles.loadingText}>Cargando personal...</Text>
        </View>
      )
    }
  
  
    // Calcula totales después del filtrado.
    const totalUsuarios = usuariosFiltrados.length
    const totalEmpleados = empleadosFiltrados.length
    const totalGeneral = totalUsuarios + totalEmpleados
  
  
    // ===============================
    // RENDER PRINCIPAL
    // ===============================
  
    return (
  
      // Contenedor principal de toda la pantalla.
      <View style={styles.container}>
  
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
  
          {/* Botón para volver atrás */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()} // Navega a la pantalla anterior
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
  
          {/* Título principal */}
          <Text style={styles.title}>Listado de Personal</Text>
  
          {/* Subtítulo con total general */}
          <Text style={styles.subtitle}>
            Total: {totalGeneral} personas
          </Text>
        </View>
  
  
        {/* ================= BARRA DE BÚSQUEDA ================= */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, correo, rol..."
            placeholderTextColor="#8B9BA8"
            value={busqueda}               // Valor actual del estado
            onChangeText={setBusqueda}     // Actualiza estado al escribir
          />
        </View>
  
  
        {/* ================= FILTROS ================= */}
        <View style={styles.filterContainer}>
  
          {/* Filtro TODOS */}
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
  
  
          {/* Filtro USUARIOS */}
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
  
  
          {/* Filtro EMPLEADOS */}
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
  
  
        {/* ================= LISTA CON SCROLL ================= */}
        <ScrollView
          style={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refrescando} // Muestra animación si es true
              onRefresh={onRefresh}    // Ejecuta función al deslizar
            />
          }
        >
  
          {/* ================= MOSTRAR USUARIOS ================= */}
          {(filtroActivo === 'todos' || filtroActivo === 'usuarios') && (
            <>
              {usuariosFiltrados.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>
                    👥 Usuarios ({usuariosFiltrados.length})
                  </Text>
  
                  {/* Renderiza cada usuario usando .map() */}
                  {usuariosFiltrados.map(renderUsuario)}
                </>
              ) : busqueda !== '' && filtroActivo === 'usuarios' ? (
                <Text style={styles.noResults}>
                  No se encontraron usuarios
                </Text>
              ) : null}
            </>
          )}
  
  
          {/* ================= MOSTRAR EMPLEADOS ================= */}
          {(filtroActivo === 'todos' || filtroActivo === 'empleados') && (
            <>
              {empleadosFiltrados.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>
                    🔧 Empleados ({empleadosFiltrados.length})
                  </Text>
  
                  {/* Renderiza cada empleado */}
                  {empleadosFiltrados.map(renderEmpleado)}
                </>
              ) : busqueda !== '' && filtroActivo === 'empleados' ? (
                <Text style={styles.noResults}>
                  No se encontraron empleados
                </Text>
              ) : null}
            </>
          )}
  
  
          {/* Si no hay resultados generales */}
          {totalGeneral === 0 && busqueda !== '' && (
            <Text style={styles.noResults}>
              No se encontraron resultados
            </Text>
          )}
  
          {/* Espacio inferior extra */}
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
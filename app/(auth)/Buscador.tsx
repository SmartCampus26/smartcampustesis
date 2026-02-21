// ===============================
// IMPORTACIONES
// ===============================

// Importa React y los hooks useEffect (ejecuta código al montar el componente)
// y useState (manejo de estados)
import React, { useEffect, useState } from 'react'

// Componentes visuales de React Native
import {
  ActivityIndicator,   // Spinner de carga
  Alert,               // Ventanas emergentes de alerta
  RefreshControl,      // Control para refrescar con gesto pull-to-refresh
  ScrollView,          // Contenedor con scroll vertical
  Text,                // Texto
  TextInput,           // Campo de entrada
  TouchableOpacity,    // Botón táctil
  View,                // Contenedor base
} from 'react-native'

// Tipos de datos definidos en tu proyecto
import { Empleado, Usuario } from '../../src/types/Database'

// Funciones del servicio Buscadorservice:
// - Obtener usuarios
// - Obtener empleados
// - Eliminar usuario
// - Eliminar empleado
// - Filtrar usuarios
// - Filtrar empleados
import {
  fetchUsuarios,
  fetchEmpleados,
  eliminarUsuarioDB,
  eliminarEmpleadoDB,
  filtrarUsuarios,
  filtrarEmpleados,
} from '../../src/services/Buscadorservice'

// Importa los estilos personalizados
import { styles } from '../../src/components/Buscadorstyles'


// ===============================
// TIPO DE FILTRO
// ===============================

// Define los posibles filtros disponibles
type TipoPersonal = 'todos' | 'usuarios' | 'empleados'


// ===============================
// COMPONENTE PRINCIPAL
// ===============================

export default function ListadoMaxAutoridad() {

  // ===============================
  // ESTADOS
  // ===============================

  // Lista completa de usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  // Lista completa de empleados
  const [empleados, setEmpleados] = useState<Empleado[]>([])

  // Texto de búsqueda
  const [busqueda, setBusqueda] = useState('')

  // Filtro activo actual
  const [filtroActivo, setFiltroActivo] = useState<TipoPersonal>('todos')

  // Estado de carga inicial
  const [cargando, setCargando] = useState(true)

  // Estado para refresh (pull-to-refresh)
  const [refrescando, setRefrescando] = useState(false)


  // ===============================
  // useEffect → Se ejecuta al montar
  // ===============================

  useEffect(() => {
    cargarDatos()
  }, [])


  // ===============================
  // FUNCIÓN PARA CARGAR DATOS
  // ===============================

  const cargarDatos = async () => {
    try {
      // Obtiene usuarios desde la base de datos
      setUsuarios(await fetchUsuarios())

      // Obtiene empleados desde la base de datos
      setEmpleados(await fetchEmpleados())
    } catch {
      // Si ocurre error muestra alerta
      Alert.alert('Error', 'No se pudieron cargar los datos')
    } finally {
      // Finaliza estados de carga
      setCargando(false)
      setRefrescando(false)
    }
  }


  // ===============================
  // FUNCIÓN PARA REFRESCAR
  // ===============================

  const onRefresh = () => {
    setRefrescando(true)
    cargarDatos()
  }


  // ===============================
  // CONFIRMAR ELIMINACIÓN
  // ===============================

  const confirmarEliminar = (nombre: string, onConfirm: () => void) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás segura de eliminar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
      ]
    )
  }


  // ===============================
  // ELIMINAR USUARIO
  // ===============================

  const eliminarUsuario = (id: string, nombre: string) => {
    confirmarEliminar(nombre, async () => {
      try {
        await eliminarUsuarioDB(id)
        Alert.alert('Éxito', 'Usuario eliminado correctamente')
        cargarDatos()
      } catch {
        Alert.alert('Error', 'No se pudo eliminar el usuario')
      }
    })
  }


  // ===============================
  // ELIMINAR EMPLEADO
  // ===============================

  const eliminarEmpleado = (id: string, nombre: string) => {
    confirmarEliminar(nombre, async () => {
      try {
        await eliminarEmpleadoDB(id)
        Alert.alert('Éxito', 'Empleado eliminado correctamente')
        cargarDatos()
      } catch {
        Alert.alert('Error', 'No se pudo eliminar el empleado')
      }
    })
  }


  // ===============================
  // FILTRADO DE DATOS
  // ===============================

  const usuariosFiltrados = filtrarUsuarios(usuarios, busqueda)
  const empleadosFiltrados = filtrarEmpleados(empleados, busqueda)

  const totalUsuarios = usuariosFiltrados.length
  const totalEmpleados = empleadosFiltrados.length
  const totalGeneral = totalUsuarios + totalEmpleados


  // ===============================
  // RENDER DE USUARIO
  // ===============================

  const renderUsuario = (usuario: Usuario) => (
    <View key={usuario.idUser} style={[styles.card, styles.usuarioCard]}>

      {/* Encabezado */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardName}>
            {usuario.nomUser} {usuario.apeUser}
          </Text>

          {/* Badge de rol */}
          <View style={[
            styles.badge,
            usuario.rolUser === 'autoridad' ? styles.badgeAutoridad : styles.badgeDocente
          ]}>
            <Text style={styles.badgeText}>
              {usuario.rolUser === 'autoridad' ? '👔 Autoridad' : '📚 Docente'}
            </Text>
          </View>
        </View>

        {/* Botón eliminar */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => eliminarUsuario(usuario.idUser, `${usuario.nomUser} ${usuario.apeUser}`)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Cuerpo de la tarjeta */}
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


  // ===============================
  // RENDER DE EMPLEADO
  // ===============================

  const renderEmpleado = (empleado: Empleado) => (
    <View key={empleado.idEmpl} style={[styles.card, styles.empleadoCard]}>

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


  // ===============================
  // SI ESTÁ CARGANDO
  // ===============================

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#21D0B2" />
        <Text style={styles.loadingText}>Cargando personal...</Text>
      </View>
    )
  }


  // ===============================
  // RENDER PRINCIPAL
  // ===============================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Listado de Personal</Text>
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

      {/* Filtros dinámicos */}
      <View style={styles.filterContainer}>
        {(['todos', 'usuarios', 'empleados'] as TipoPersonal[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filtroActivo === f && styles.filterButtonActive]}
            onPress={() => setFiltroActivo(f)}
          >
            <Text style={[styles.filterButtonText, filtroActivo === f && styles.filterButtonTextActive]}>
              {f === 'todos'
                ? `Todos (${totalGeneral})`
                : f === 'usuarios'
                ? `Usuarios (${totalUsuarios})`
                : `Empleados (${totalEmpleados})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista con scroll y pull-to-refresh */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
      >

        {/* Usuarios */}
        {(filtroActivo === 'todos' || filtroActivo === 'usuarios') && (
          <>
            {usuariosFiltrados.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>👥 Usuarios ({usuariosFiltrados.length})</Text>
                {usuariosFiltrados.map(renderUsuario)}
              </>
            ) : busqueda !== '' && filtroActivo === 'usuarios' ? (
              <Text style={styles.noResults}>No se encontraron usuarios</Text>
            ) : null}
          </>
        )}

        {/* Empleados */}
        {(filtroActivo === 'todos' || filtroActivo === 'empleados') && (
          <>
            {empleadosFiltrados.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>🔧 Empleados ({empleadosFiltrados.length})</Text>
                {empleadosFiltrados.map(renderEmpleado)}
              </>
            ) : busqueda !== '' && filtroActivo === 'empleados' ? (
              <Text style={styles.noResults}>No se encontraron empleados</Text>
            ) : null}
          </>
        )}

        {/* Sin resultados generales */}
        {totalGeneral === 0 && busqueda !== '' && (
          <Text style={styles.noResults}>No se encontraron resultados</Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}
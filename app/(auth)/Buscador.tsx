// 👥 ListadoMaxAutoridad.tsx
// Pantalla de gestión de personal para la máxima autoridad.
// Permite visualizar, buscar, filtrar y eliminar usuarios y empleados.

import * as React from 'react'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { styles } from '../../src/components/Buscadorstyles'
import { useToast } from '../../src/components/ToastContext'
import {
  eliminarEmpleadoDB,
  eliminarUsuarioDB,
  fetchEmpleados,
  fetchUsuarios,
  filtrarEmpleados,
  filtrarUsuarios,
} from '../../src/services/admin/Buscadorservice'
import { Empleado, Usuario } from '../../src/types/Database'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Opciones del filtro principal de la lista */
type TipoPersonal = 'todos' | 'usuarios' | 'empleados'

/** Datos necesarios para mostrar el modal de confirmación */
interface ConfirmData {
  visible: boolean
  nombre: string
  onConfirm: () => void
}

// ─── Modal confirmación ───────────────────────────────────────────────────────

/**
 * Modal de confirmación antes de eliminar un registro.
 * Muestra el nombre del elemento a eliminar y dos acciones: cancelar o confirmar.
 */
function ConfirmModal({
  visible,
  nombre,
  onConfirm,
  onCancel,
}: ConfirmData & { onCancel: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Confirmar eliminación</Text>
          <Text style={styles.modalMessage}>
            ¿Estás segura de eliminar a{' '}
            <Text style={styles.modalBold}>{nombre}</Text>?
          </Text>
          <View style={styles.modalRow}>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={onCancel}>
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnDelete} onPress={onConfirm}>
              <Text style={styles.modalBtnDeleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Pantalla principal de gestión de personal.
 * Carga usuarios y empleados desde Supabase, permite buscar por texto,
 * filtrar por tipo y eliminar registros con confirmación.
 */
export default function ListadoMaxAutoridad() {

  // ── Toast global ─────────────────────────────────────────────────────────────
  const { showToast } = useToast()

  // ── Estado de datos ──────────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<TipoPersonal>('todos')
  const [cargando, setCargando] = useState(true)
  const [refrescando, setRefrescando] = useState(false)

  // ── Estado del modal de confirmación ────────────────────────────────────────
  const [confirm, setConfirm] = useState<ConfirmData>({
    visible: false,
    nombre: '',
    onConfirm: () => {},
  })

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /** Abre el modal de confirmación con el nombre y la acción a ejecutar */
  const openConfirm = (nombre: string, onConfirm: () => void) =>
    setConfirm({ visible: true, nombre, onConfirm })

  /** Cierra el modal de confirmación sin ejecutar ninguna acción */
  const closeConfirm = () => setConfirm((p) => ({ ...p, visible: false }))

  // ── Carga de datos ────────────────────────────────────────────────────────────

  useEffect(() => { cargarDatos() }, [])

  /**
   * Carga usuarios y empleados desde Supabase.
   * Maneja los estados de carga y refresco.
   */
  const cargarDatos = async () => {
    try {
      setUsuarios(await fetchUsuarios())
      setEmpleados(await fetchEmpleados())
    } catch {
      showToast('No se pudieron cargar los datos', 'error')
    } finally {
      setCargando(false)
      setRefrescando(false)
    }
  }

  /** Activa el estado de refresco y recarga los datos */
  const onRefresh = () => { setRefrescando(true); cargarDatos() }

  // ── Eliminación ───────────────────────────────────────────────────────────────

  /**
   * Solicita confirmación y elimina un usuario por su ID.
   * Muestra toast de éxito o error según el resultado.
   */
  const eliminarUsuario = (id: string, nombre: string) => {
    openConfirm(nombre, async () => {
      closeConfirm()
      try {
        await eliminarUsuarioDB(id)
        showToast('Usuario eliminado correctamente', 'success')
        cargarDatos()
      } catch {
        showToast('No se pudo eliminar el usuario', 'error')
      }
    })
  }

  /**
   * Solicita confirmación y elimina un empleado por su ID.
   * Muestra toast de éxito o error según el resultado.
   */
  const eliminarEmpleado = (id: string, nombre: string) => {
    openConfirm(nombre, async () => {
      closeConfirm()
      try {
        await eliminarEmpleadoDB(id)
        showToast('Empleado eliminado correctamente', 'success')
        cargarDatos()
      } catch {
        showToast('No se pudo eliminar el empleado', 'error')
      }
    })
  }

  // ── Filtros ───────────────────────────────────────────────────────────────────

  // Listas filtradas según el texto de búsqueda actual
  const usuariosFiltrados = filtrarUsuarios(usuarios, busqueda)
  const empleadosFiltrados = filtrarEmpleados(empleados, busqueda)
  const totalUsuarios = usuariosFiltrados.length
  const totalEmpleados = empleadosFiltrados.length
  const totalGeneral = totalUsuarios + totalEmpleados

  // ── Renders de tarjetas ───────────────────────────────────────────────────────

  /**
   * Renderiza la tarjeta de un usuario con sus datos y botón de eliminación.
   * Muestra: nombre, rol, correo, teléfono, fecha de registro e ID.
   */
  const renderUsuario = (usuario: Usuario) => (
    <View key={usuario.idUser} style={[styles.card, styles.usuarioCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardName}>
            {usuario.nomUser} {usuario.apeUser}
          </Text>
          <View style={[
            styles.badge,
            usuario.rolUser === 'autoridad' ? styles.badgeAutoridad : styles.badgeDocente,
          ]}>
            <Text style={styles.badgeText}>
              {usuario.rolUser === 'autoridad' ? '👔 Coordinador' : '📚 Docente'}
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
            {usuario.fec_reg_user
              ? new Date(usuario.fec_reg_user).toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🆔 ID:</Text>
          <Text style={styles.infoValue}>{usuario.idUser}</Text>
        </View>
      </View>
    </View>
  )

  /**
   * Renderiza la tarjeta de un empleado con sus datos y botón de eliminación.
   * Muestra: nombre, departamento, cargo, correo, teléfono e ID.
   */
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
              empleado.cargEmpl === 'jefe' ? styles.badgeJefe : styles.badgeEmpleado,
            ]}>
              <Text style={styles.badgeText}>
                {empleado.cargEmpl === 'jefe' ? '👨‍💼 Jefe' : '👷 Colaborador'}
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

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#21D0B2" />
        <Text style={styles.loadingText}>Cargando personal...</Text>
      </View>
    )
  }

  // ── Render principal ──────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* Encabezado con título y total */}
      <View style={styles.header}>
        <Text style={styles.title}>Listado de Personal</Text>
        <Text style={styles.subtitle}>Total: {totalGeneral} personas</Text>
      </View>

      {/* Campo de búsqueda por texto */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, correo, rol..."
          placeholderTextColor="#8B9BA8"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Filtros: Todos / Usuarios / Colaboradores */}
      <View style={styles.filterContainer}>
        {(['todos', 'usuarios', 'empleados'] as TipoPersonal[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filtroActivo === f && styles.filterButtonActive]}
            onPress={() => setFiltroActivo(f)}
          >
            <Text style={[
              styles.filterButtonText,
              filtroActivo === f && styles.filterButtonTextActive,
            ]}>
              {f === 'todos'
                ? `Todos (${totalGeneral})`
                : f === 'usuarios'
                ? `Usuarios (${totalUsuarios})`
                : `Colaboradores (${totalEmpleados})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista principal con pull-to-refresh */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
      >
        {/* Sección de usuarios */}
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

        {/* Sección de colaboradores */}
        {(filtroActivo === 'todos' || filtroActivo === 'empleados') && (
          <>
            {empleadosFiltrados.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>🔧 Colaboradores ({empleadosFiltrados.length})</Text>
                {empleadosFiltrados.map(renderEmpleado)}
              </>
            ) : busqueda !== '' && filtroActivo === 'empleados' ? (
              <Text style={styles.noResults}>No se encontraron colaboradores</Text>
            ) : null}
          </>
        )}

        {/* Sin resultados globales */}
        {totalGeneral === 0 && busqueda !== '' && (
          <Text style={styles.noResults}>No se encontraron resultados</Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        visible={confirm.visible}
        nombre={confirm.nombre}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />

    </View>
  )
}
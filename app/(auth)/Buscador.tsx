// 👥 Buscador.tsx
// Gestión de personal. Eliminación solo disponible para autoridades.
// Sin estilos propios — solo orquestación de componentes.

import * as React from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import ListHeader from '../../src/components/usuarios/ListHeader'
import PersonaCard from '../../src/components/usuarios/PersonaCard'
import FilterChips from '../../src/components/ui/FilterChips'
import FormField from '../../src/components/ui/FormField'
import ConfirmModal from '../../src/components/ui/ConfirmModal'
import EmptyState from '../../src/components/ui/EmptyState'
import LoadingScreen from '../../src/components/ui/LoadingScreen'
import { useToast } from '../../src/context/ToastContext'
import { useBuscador } from '../../src/hooks/usuarios/useBuscador'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'
import { router } from 'expo-router'

type TipoPersonal = 'todos' | 'usuarios' | 'empleados'

export default function Buscador() {
  const { showToast } = useToast()
  const {
    usuariosFiltrados, empleadosFiltrados,
    busqueda, setBusqueda,
    filtroActivo, setFiltroActivo,
    cargando, refrescando, onRefresh,
    eliminarUsuario, eliminarEmpleado,
    esAutoridad,
  } = useBuscador()

  useAndroidBack(() => {
    if (router.canGoBack()) {
      router.back()
    }
  })

  const [confirm, setConfirm] = React.useState({
    visible: false, titulo: '', mensaje: '', onConfirm: () => {},
  })
  const openConfirm = (titulo: string, mensaje: string, onConfirm: () => void) =>
    setConfirm({ visible: true, titulo, mensaje, onConfirm })
  const closeConfirm = () => setConfirm(p => ({ ...p, visible: false }))

  if (cargando) return <LoadingScreen />

  const totalGeneral = usuariosFiltrados.length + empleadosFiltrados.length

  const FILTROS = [
    { key: 'todos',     label: `Todos (${totalGeneral})` },
    { key: 'usuarios',  label: `Usuarios (${usuariosFiltrados.length})` },
    { key: 'empleados', label: `Colaboradores (${empleadosFiltrados.length})` },
  ]

  const handleEliminarUsuario = (id: string, nombre: string) =>
    openConfirm('Confirmar eliminación', `¿Eliminar a ${nombre}?`, async () => {
      closeConfirm()
      try { await eliminarUsuario(id); showToast('Usuario eliminado', 'success') }
      catch { showToast('No se pudo eliminar', 'error') }
    })

  const handleEliminarEmpleado = (id: string, nombre: string) =>
    openConfirm('Confirmar eliminación', `¿Eliminar a ${nombre}?`, async () => {
      closeConfirm()
      try { await eliminarEmpleado(id); showToast('Colaborador eliminado', 'success') }
      catch { showToast('No se pudo eliminar', 'error') }
    })

  return (
    <>
      <ListHeader
        title="Listado de Personal"
        subtitle={`Total: ${totalGeneral} personas`}
      />

      <FormField
        label="Buscar"
        hideLabel
        placeholder="Buscar por nombre, correo, rol..."
        value={busqueda}
        onChangeText={setBusqueda}
        onClear={() => setBusqueda('')}
        icon="search-outline"
      />

      {/* horizontal={false} para que los chips se muestren en fila sin scroll */}
      <FilterChips
        chips={FILTROS}
        selected={filtroActivo}
        onSelect={(k) => setFiltroActivo(k as TipoPersonal)}
        horizontal={false}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {(filtroActivo === 'todos' || filtroActivo === 'usuarios') &&
            usuariosFiltrados.map(u => (
              <PersonaCard
                key={u.idUser}
                tipo="usuario"
                nombre={`${u.nomUser} ${u.apeUser}`}
                rol={u.rolUser}
                correo={u.correoUser}
                telefono={u.tlfUser}
                fechaRegistro={u.fec_reg_user}
                id={u.idUser}
                // Eliminar solo disponible para autoridades
                onEliminar={esAutoridad
                  ? () => handleEliminarUsuario(u.idUser, `${u.nomUser} ${u.apeUser}`)
                  : undefined
                }
              />
            ))
          }
          {(filtroActivo === 'todos' || filtroActivo === 'empleados') &&
            empleadosFiltrados.map(e => (
              <PersonaCard
                key={e.idEmpl}
                tipo="empleado"
                nombre={`${e.nomEmpl} ${e.apeEmpl}`}
                departamento={e.deptEmpl}
                cargo={e.cargEmpl}
                correo={e.correoEmpl}
                telefono={e.tlfEmpl}
                id={e.idEmpl}
                // Eliminar solo disponible para autoridades
                onEliminar={esAutoridad
                  ? () => handleEliminarEmpleado(e.idEmpl, `${e.nomEmpl} ${e.apeEmpl}`)
                  : undefined
                }
              />
            ))
          }
          {totalGeneral === 0 && busqueda !== '' && (
            <EmptyState
              icon="search"
              title="Sin resultados"
              subtitle="Intenta con otros términos de búsqueda"
            />
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={confirm.visible}
        titulo={confirm.titulo}
        mensaje={confirm.mensaje}
        labelConfirmar="Eliminar"
        accentColor="#e63946"
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </>
  )
}
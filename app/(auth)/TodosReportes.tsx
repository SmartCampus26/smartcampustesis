// 📋 TodosReportes.tsx — sin estilos propios, solo orquestación.

import * as React from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import StatCard from '../../src/components/dashboard/StatCard'
import StatsContainer from '../../src/components/dashboard/StatsContainer'
import ReporteDetalleModal from '../../src/components/reportes/ReporteDetalleModal'
import ReporteCard from '../../src/components/reportes/ReporteCard'
import SectionContainer from '../../src/components/layout/SectionContainer'
import FilterChips from '../../src/components/ui/FilterChips'
import FormField from '../../src/components/ui/FormField'
import EmptyState from '../../src/components/ui/EmptyState'
import LoadingScreen from '../../src/components/ui/LoadingScreen'
import ConfirmModal from '../../src/components/ui/ConfirmModal'
import ListHeader from '../../src/components/usuarios/ListHeader'
import { useToast } from '../../src/context/ToastContext'
import { useTodosReportes } from '../../src/hooks/reportes/useTodosReportes'
import { getStatusColor, getPriorityColor } from '../../src/styles/tokens'
import { Reporte } from '../../src/types/Database'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'
import { router } from 'expo-router'

// Solo filtros de rol — igual que el diseño original
const CHIPS_ROL = [
  { key: 'todos',     label: 'Todos' },
  { key: 'docente',   label: '🎓 Docentes' },
  { key: 'autoridad', label: '🛡️ Coordinadores' },
]

export default function TodosReportes() {
  const { showToast } = useToast()
  const {
    reportes, usuarios, reportesFiltrados,
    busqueda, setBusqueda,
    filtroRol, setFiltroRol,
    cargando, error,
    handleEliminar,
  } = useTodosReportes()

  useAndroidBack(() => {
    if (router.canGoBack()) {
      router.back()
    }
  })

  const [reporteSeleccionado, setReporteSeleccionado] = React.useState<Reporte | null>(null)
  const [modalVisible, setModalVisible]               = React.useState(false)
  const [confirm, setConfirm] = React.useState({ visible: false, id: '' })

  if (cargando) return <LoadingScreen color="#1DCDFE" />
  if (error)    showToast(error, 'error')

  const totalDocentes      = usuarios.filter(u => u.rolUser === 'docente').length
  const totalCoordinadores = usuarios.filter(u => u.rolUser === 'autoridad').length
  const subtitulo          = `Mostrando ${reportesFiltrados.length} de ${reportes.length} reportes`

  const confirmarEliminacion = (id: string) => setConfirm({ visible: true, id })
  const ejecutarEliminacion  = async () => {
    setConfirm(p => ({ ...p, visible: false }))
    try { await handleEliminar(confirm.id); showToast('Reporte eliminado', 'success') }
    catch (err: any) { showToast(err.message || 'Error al eliminar', 'error') }
  }



  return (
    <>
      {/* Header */}
      <ListHeader title="Todos los Reportes" />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} tintColor="#1DCDFE" />
        }
      >
        {/* Stats: Total, Docentes, Coordinadores */}
        <StatsContainer row>
          <StatCard
            value={reportes.length}
            label="Total Reportes"
            color="#1DCDFE"
            iconName="document-text"
          />
          <StatCard
            value={totalDocentes}
            label="Docentes"
            color="#21D0B2"
            iconName="school"
          />
          <StatCard
            value={totalCoordinadores}
            label="Coordinadores"
            color="#34F5C5"
            iconName="shield-checkmark"
          />
        </StatsContainer>

        {/* Búsqueda */}
        <FormField
          label="Buscar"
          hideLabel
          placeholder="Buscar por descripción o usuario..."
          value={busqueda}
          onChangeText={setBusqueda}
          onClear={() => setBusqueda('')}
          icon="search-outline"
        />

        {/* Chips de rol */}
        <FilterChips
          chips={CHIPS_ROL}
          selected={filtroRol}
          onSelect={setFiltroRol}
        />

        {/* Lista */}
        <SectionContainer
          title={subtitulo}
          padded
        >
          {reportesFiltrados.length === 0
            ? (
                <EmptyState
                  icon="document-text-outline"
                  title="No hay reportes"
                  subtitle={busqueda ? 'Intenta con otros términos' : 'No hay reportes disponibles'}
                />
              )
            : reportesFiltrados.map(r => (
                <ReporteCard
                  key={r.idReporte}
                  id={r.idReporte}
                  descripcion={r.descriReporte ?? ''}
                  estado={r.estReporte ?? ''}
                  statusColor={getStatusColor(r.estReporte ?? '')}
                  fecha={r.fecReporte ?? ''}
                  prioridad={r.prioReporte}
                  priorityColor={getPriorityColor(r.prioReporte ?? '')}
                  onPress={() => { setReporteSeleccionado(r as any); setModalVisible(true) }}
                  onDelete={() => confirmarEliminacion(r.idReporte)}
                />
              ))
          }
        </SectionContainer>
      </ScrollView>

      <ReporteDetalleModal
        visible={modalVisible}
        reporte={reporteSeleccionado}
        onClose={() => setModalVisible(false)}
      />

      <ConfirmModal
        visible={confirm.visible}
        titulo="Eliminar reporte"
        mensaje="¿Estás seguro? Esta acción no se puede deshacer."
        labelConfirmar="Eliminar"
        accentColor="#e63946"
        onConfirm={ejecutarEliminacion}
        onCancel={() => setConfirm(p => ({ ...p, visible: false }))}
      />
    </>
  )
}

function handleCancelar(): void {
  throw new Error('Function not implemented.')
}

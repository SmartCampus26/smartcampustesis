// 📋 ListadoReportes.tsx — sin estilos propios, solo orquestación.

import { useLocalSearchParams, useRouter } from 'expo-router'
import * as React from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import FilterChips from '../../src/components/ui/FilterChips'
import EmptyState from '../../src/components/ui/EmptyState'
import FormField from '../../src/components/ui/FormField'
import LoadingScreen from '../../src/components/ui/LoadingScreen'
import ListHeader from '../../src/components/usuarios/ListHeader'
import ReporteCard from '../../src/components/reportes/ReporteCard'
import ReporteDetalleModal from '../../src/components/reportes/ReporteDetalleModal'
import SectionContainer from '../../src/components/layout/SectionContainer'
import { useToast } from '../../src/context/ToastContext'
import { useListadoReportes } from '../../src/hooks/reportes/useListadoReportes'
import { getStatusColor, getPriorityColor } from '../../src/styles/tokens'
import { Reporte } from '../../src/types/Database'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'
import { router } from 'expo-router'

// Keys en minúsculas — coinciden con FiltroEstado del service
// que compara con r.estReporte.toLowerCase()
const FILTROS = [
  { key: 'todos',      label: 'Todos',      dotColor: undefined },
  { key: 'pendiente',  label: 'Pendientes', dotColor: '#FFA726' },
  { key: 'en proceso', label: 'En Proceso', dotColor: '#4A90D9' },
  { key: 'resuelto',   label: 'Resueltos',  dotColor: '#5CB85C' },
]

export default function ListadoReportes() {
  const router = useRouter();
  const { showToast } = useToast()
  const { filtro: filtroParam } = useLocalSearchParams<{ filtro?: string }>()

  // Param vacío o ausente → 'todos'
  const filtroInicial = filtroParam?.trim() || undefined

  const {
    reportes, reportesFiltrados,
    filtroEstado, setFiltroEstado,
    busqueda, setBusqueda,
    cargando, refrescando, error, onRefresh,
  } = useListadoReportes(filtroInicial)

  const [reporteSeleccionado, setReporteSeleccionado] = React.useState<Reporte | null>(null)
  const [modalVisible, setModalVisible]               = React.useState(false)

  // Sincroniza el chip activo cuando cambia el param de navegación
  const handleBack = React.useCallback(() => {
    if (modalVisible) {
      setModalVisible(false); // Cierra el modal si está abierto
    } else {
      router.back(); // Si no hay modal, regresa a la pantalla anterior
    }
  }, [modalVisible, router]);

  // 3. MUEVE EL HOOK AQUÍ (Antes de los "if cargando")
  useAndroidBack(handleBack);

  React.useEffect(() => {
    setFiltroEstado(filtroInicial ?? 'todos')
  }, [filtroParam])

  if (cargando) return <LoadingScreen color="#1DCDFE" />
  if (error)    showToast(error, 'error')

  // Subtítulo dinámico del header
  const subtitulo = filtroEstado === 'todos'
    ? `${reportes.length} reportes en total`
    : `${reportesFiltrados.length} reporte${reportesFiltrados.length !== 1 ? 's' : ''} ${filtroEstado}`


  return (
    <>
      {/* Header con título y conteo */}
      <ListHeader title="Mis Reportes" subtitle={subtitulo} />

      {/* Barra de búsqueda */}
      <FormField
        label="Buscar"
        hideLabel
        placeholder="Buscar por descripción o ID..."
        value={busqueda}
        onChangeText={setBusqueda}
        onClear={() => setBusqueda('')}
        icon="search-outline"
      />

      {/* Chips de filtro con conteo por estado */}
      <FilterChips
        chips={FILTROS.map(f => ({
          ...f,
          label: f.key === 'todos'
            ? `Todos (${reportes.length})`
            : `${f.label} (${reportes.filter(r => r.estReporte?.toLowerCase() === f.key).length})`,
        }))}
        selected={filtroEstado}
        onSelect={setFiltroEstado}
      />

      {/* Lista de reportes filtrados */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            tintColor="#1DCDFE"
            colors={['#1DCDFE']}
          />
        }
      >
        <SectionContainer title="" padded>
          {reportesFiltrados.length === 0
            ? (
                <EmptyState
                  icon="document-text-outline"
                  title="Sin reportes"
                  subtitle="No hay reportes para este filtro"
                />
              )
            : reportesFiltrados.map(r => (
                <ReporteCard
                  key={r.idReporte}
                  id={r.idReporte}
                  descripcion={r.descriReporte}
                  estado={r.estReporte}
                  statusColor={getStatusColor(r.estReporte)}
                  fecha={r.fecReporte}
                  prioridad={r.prioReporte}
                  priorityColor={getPriorityColor(r.prioReporte)}
                  empleadoNombre={
                    (r as any).empleado
                      ? `${(r as any).empleado.nomEmpl} ${(r as any).empleado.apeEmpl}`
                      : undefined
                  }
                  onPress={() => { setReporteSeleccionado(r); setModalVisible(true) }}
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
    </>
  )
}

function handleCancelar(): void {
  throw new Error('Function not implemented.')
}

// 🔧 HomeEmpleado.tsx
// Panel principal para colaboradores (mantenimiento y sistemas).
// Sin estilos propios — solo orquestación.
//
// NO usa DashboardLayout porque ese componente muestra StatCards
// que no aplican para este rol. En su lugar usa HomeHeader + ScrollView.
// Los colaboradores solo ven sus tareas asignadas y accesos a PDF.

import { router } from 'expo-router'
import * as React from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import HomeHeader from '../../src/components/layout/HomeHeader'
import SectionContainer from '../../src/components/layout/SectionContainer'
import PdfButtonRow from '../../src/components/pdf/PdfButtonRow'
import ReporteCard from '../../src/components/reportes/ReporteCard'
import ReporteDetalleModal from '../../src/components/reportes/ReporteDetalleModal'
import EmptyState from '../../src/components/ui/EmptyState'
import LoadingScreen from '../../src/components/ui/LoadingScreen'
import { useToast } from '../../src/context/ToastContext'
import { useHomeEmpleado } from '../../src/hooks/dashboard/useHomeEmpleado'
import { getPriorityColor, getStatusColor } from '../../src/styles/tokens'
import { Reporte } from '../../src/types/Database'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'

export default function HomeEmpleado() {
  const { showToast } = useToast()
  const {
    empleado, reportes,
    mostrarBtnGeneral, verificandoAcceso,
    cargando, refrescando, error, onRefresh,
  } = useHomeEmpleado()

  const [reporteSeleccionado, setReporteSeleccionado] = React.useState<Reporte | null>(null)
  const [modalVisible, setModalVisible]               = React.useState(false)

  useAndroidBack(handleCancelar)  

  if (cargando) return <LoadingScreen color="#1DCDFE" />
  if (error)    showToast(error, 'error')

  const abrirPdfPersonal = () => {
    if (reportes.length === 0) {
      showToast('No tienes tareas asignadas para generar el PDF', 'info')
      return
    }
    router.push('/PdfPersonalPreview')
  }

  

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>

      {/* Header con nombre del colaborador — sin stats */}
      <HomeHeader nombre={empleado?.nomEmpl || 'Colaborador'} />

      {/* Botones PDF — debajo del header, antes de las tareas */}
      <PdfButtonRow
        onPdfPersonal={abrirPdfPersonal}
        mostrarGeneral={mostrarBtnGeneral}
        verificandoAcceso={verificandoAcceso}
        onPdfGeneral={() => router.push('/PdfPreview')}
      />

      {/* Lista de tareas asignadas */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={['#1DCDFE']}
            tintColor="#1DCDFE"
          />
        }
      >
        <SectionContainer title="Mis Tareas">
          {reportes.length === 0
            ? (
                <EmptyState
                  icon="folder-open-outline"
                  title="No tienes tareas asignadas"
                  subtitle="Las nuevas tareas aparecerán aquí"
                />
              )
            : reportes.map(r => (
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
                    r.usuario
                      ? `${r.usuario.nomUser} ${r.usuario.apeUser}`
                      : undefined
                  }
                  onPress={() => {
                    setReporteSeleccionado(r)
                    setModalVisible(true)
                  }}
                />
              ))
          }
        </SectionContainer>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ReporteDetalleModal
        visible={modalVisible}
        reporte={reporteSeleccionado}
        onClose={() => setModalVisible(false)}
      />

    </View>
  )
}

function handleCancelar(): void {
  throw new Error('Function not implemented.')
}

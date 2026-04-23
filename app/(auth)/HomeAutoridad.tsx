// 🏛️ HomeAutoridad.tsx — sin estilos propios, solo orquestación.

import { useFocusEffect } from 'expo-router'
import { router } from 'expo-router'
import * as React from 'react'
import ActionCard from '../../src/components/dashboard/ActionCard'
import StatCard from '../../src/components/dashboard/StatCard'
import StatsContainer from '../../src/components/dashboard/StatsContainer'
import DashboardLayout from '../../src/components/layout/DashboardLayout'
import SectionContainer from '../../src/components/layout/SectionContainer'
import ReporteCard from '../../src/components/reportes/ReporteCard'
import ReporteDetalleModal from '../../src/components/reportes/ReporteDetalleModal'
import AppButton from '../../src/components/ui/AppButton'
import LoadingScreen from '../../src/components/ui/LoadingScreen'
import TipCard from '../../src/components/ui/TipCard'
import { useToast } from '../../src/context/ToastContext'
import { useHomeAutoridad } from '../../src/hooks/dashboard/useHomeAutoridad'
import { getPriorityColor, getStatusColor } from '../../src/styles/tokens'
import { Reporte } from '../../src/types/Database'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'

export default function HomeAutoridad() {

  const { showToast } = useToast()
  const { usuario, reportes, stats, cargando, refrescando, error, cargar, onRefresh } = useHomeAutoridad()

  const [reporteSeleccionado, setReporteSeleccionado] = React.useState<Reporte | null>(null)
  const [modalVisible, setModalVisible]               = React.useState(false)

  useFocusEffect(React.useCallback(() => { cargar() }, [cargar]))
  useAndroidBack(handleCancelar)  

  if (cargando) return <LoadingScreen color="#1DCDFE" />
  if (error)    showToast(error, 'error')

  const handleCrearReporte = () => {
    if (!usuario?.idUser) { showToast('No se pudo identificar al usuario', 'error'); return }
    router.push({ pathname: '/CrearReporte', params: { idUser: usuario.idUser, nombreUsuario: usuario.nomUser || 'Usuario' } })
  }


  return (
    <>
      <DashboardLayout nombre={usuario?.nomUser || 'Usuario'} refrescando={refrescando} onRefresh={onRefresh}>

        <StatsContainer>
          <StatCard value={stats.total}      label="Totales"    color="#21D0B2" iconName="time-outline"
            onPress={() => router.push('/ListadoReportes')} />
          <StatCard value={stats.pendientes} label="Pendientes" color="#FFA726" iconName="time-outline"
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'pendiente' } })} />
          <StatCard value={stats.enProceso}  label="En Proceso" color="#4A90D9" iconName="time-outline"
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'en proceso' } })} />
          <StatCard value={stats.resueltos}  label="Resueltos"  color="#5CB85C" iconName="time-outline"
            onPress={() => router.push({ pathname: '/ListadoReportes', params: { filtro: 'resuelto' } })} />
        </StatsContainer>

        <AppButton
          label="Informe Resumido por Departamento"
          icon="bar-chart-outline"
          onPress={() => router.push('/PdfResumidoPreview')}
        />

        <ActionCard
          title="Crear Nuevo Reporte"
          subtitle="Reporta un problema o solicitud"
          iconName="add"
          iconColor="#1DCDFE"
          onPress={handleCrearReporte}
        />

        <SectionContainer
          title="Reportes Recientes"
          actionLabel="Ver todos →"
          onAction={() => router.push('/ListadoReportes')}
          padded={false}
        >
          {reportes.slice(0, 3).map(r => (
            <ReporteCard
              key={r.idReporte}
              id={r.idReporte}
              descripcion={r.descriReporte}
              estado={r.estReporte}
              statusColor={getStatusColor(r.estReporte)}
              fecha={r.fecReporte}
              prioridad={r.prioReporte}
              priorityColor={getPriorityColor(r.prioReporte)}
              onPress={() => { setReporteSeleccionado(r); setModalVisible(true) }}
            />
          ))}
        </SectionContainer>

        <TipCard text="Proporciona la mayor cantidad de detalles posibles al crear un reporte. Esto ayudará a que tu solicitud sea atendida más rápidamente." />

      </DashboardLayout>

      <ReporteDetalleModal visible={modalVisible} reporte={reporteSeleccionado} onClose={() => setModalVisible(false)} />
    </>
  )
}

function handleCancelar(): void {
  throw new Error('Function not implemented.')
}

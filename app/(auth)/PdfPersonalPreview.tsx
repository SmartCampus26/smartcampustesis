// 📄 PdfPersonalPreview.tsx
// Previsualización del PDF Personal del empleado.
// useFocusEffect recarga al recibir foco — cubre reasignación de reportes.
// Sin estilos propios, sin lógica de gráficos — solo orquestación.

import { useFocusEffect, router } from 'expo-router'
import * as React from 'react'
import PdfLayout from '../../src/components/layout/PdfLayout'
import PdfSectionCard from '../../src/components/pdf/PdfSectionCard'
import PdfStatsGrid from '../../src/components/pdf/PdfStatsGrid'
import EmptyState from '../../src/components/ui/EmptyState'
import { useToast } from '../../src/context/ToastContext'
import { usePdfPersonal } from '../../src/hooks/pdf/usePdfPersonal'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'

export default function PdfPersonalPreview() {
  const { showToast } = useToast()
  const {
    empleado, reportes, stats,
    cargando, generando, error,
    cargar, descargar, cancelar,
  } = usePdfPersonal()

  // Recarga al recibir foco — cubre reasignación de reportes
  useFocusEffect(
    React.useCallback(() => { cargar() }, [cargar])
  )

  const handleDescargar = async () => {
    try {
      await descargar()
      showToast('PDF listo en el dispositivo', 'success')
    } catch (err: any) {
      showToast(err?.message ?? 'No se pudo generar el PDF', 'error')
    }
  }

  useAndroidBack(() => {
    if (router.canGoBack()) {
      router.back()
    }
  })

  return (
    <PdfLayout
      cargando={cargando}
      error={error}
      titulo="Mi Informe Personal"
      generador={empleado ? `${empleado.nomEmpl} ${empleado.apeEmpl}`.trim() : ''}
      departamento={empleado?.deptEmpl as any}
      stats={stats}
      generando={generando}
      puedeDescargar={stats.total > 0}
      onDescargar={handleDescargar}
      onCancelar={cancelar}
      onVolver={() => router.replace('/HomeEmpleado')}
      labelDescargar="Descargar mi PDF"
    >
      {stats.total > 0 ? (
        <PdfSectionCard title="Estadísticas de mis tareas">
          <PdfStatsGrid stats={stats} reportes={reportes} />
        </PdfSectionCard>
      ) : (
        <EmptyState
          icon="document-text-outline"
          title="Sin reportes asignados"
          subtitle="Los reportes aparecerán aquí cuando te sean asignados"
        />
      )}
    </PdfLayout>
  )
}

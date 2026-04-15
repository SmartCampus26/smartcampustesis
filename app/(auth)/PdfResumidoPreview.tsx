// 📋 PdfResumidoPreview.tsx
// PDF Resumido para la autoridad con filtro por departamento.
// useFocusEffect recarga al recibir foco — cubre reasignaciones.
// Sin estilos propios.

import { useFocusEffect, router } from 'expo-router'
import * as React from 'react'
import PdfLayout from '../../src/components/layout/PdfLayout'
import PdfSectionCard from '../../src/components/pdf/PdfSectionCard'
import FilterChips from '../../src/components/ui/FilterChips'
import EmpleadoRow from '../../src/components/usuarios/EmpleadoRow'
import EmptyState from '../../src/components/ui/EmptyState'
import { useToast } from '../../src/context/ToastContext'
import { usePdfResumido } from '../../src/hooks/pdf/usePdfResumido'
import { FiltroDepartamento } from '../../src/services/pdf/PdfDepartamentalService'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'

const FILTRO_CHIPS = [
  { key: 'todos',         label: 'Todos' },
  { key: 'sistemas',      label: 'Sistemas' },
  { key: 'mantenimiento', label: 'Mantenimiento' },
]

export default function PdfResumidoPreview() {
  const { showToast } = useToast()
  const { datos, filtro, cambiarFiltro, cargando, generando, error, cargar, descargar, cancelar } = usePdfResumido()

  // Recarga al recibir foco — cubre reasignaciones de empleados
  useFocusEffect(
    React.useCallback(() => { cargar(filtro) }, [cargar, filtro])
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
      titulo={datos?.tituloPdf ?? ''}
      generador={datos ? `${datos.nombreGenerador}${datos.puestoGenerador ? ` (${datos.puestoGenerador})` : ''}` : ''}
      stats={datos?.statsGlobales ?? { total: 0, pendientes: 0, enProceso: 0, resueltos: 0 }}
      generando={generando}
      puedeDescargar={!!datos && datos.filas.length > 0}
      onDescargar={handleDescargar}
      onCancelar={cancelar}
      onVolver={() => router.replace('/HomeAutoridad')}
      labelDescargar="Descargar PDF Resumido"
    >
      <PdfSectionCard title="Filtrar por departamento">
        <FilterChips
          chips={FILTRO_CHIPS}
          selected={filtro}
          onSelect={(k) => cambiarFiltro(k as FiltroDepartamento)}
        />
      </PdfSectionCard>

      <PdfSectionCard title="Vista previa — Colaboradores">
        {!datos || datos.filas.length === 0
          ? <EmptyState icon="people-outline" title="Sin colaboradores para este filtro" />
          : datos.filas.map(f => (
              <EmpleadoRow
                key={f.idEmpl}
                nombre={f.nombreCompleto}
                cargo={f.cargo}
                departamento={f.departamento}
                stats={f.stats}
                mostrarProgreso
              />
            ))
        }
      </PdfSectionCard>
    </PdfLayout>
  )
}


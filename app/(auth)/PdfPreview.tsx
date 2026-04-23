// 📄 PdfPreview.tsx
// PDF General Departamental para jefes de área.
// useFocusEffect recarga al recibir foco — cubre reasignación de empleados.
// Sin estilos propios.

import { useFocusEffect, router } from 'expo-router'
import * as React from 'react'
import PdfLayout from '../../src/components/layout/PdfLayout'
import PdfSectionCard from '../../src/components/pdf/PdfSectionCard'
import EmpleadoRow from '../../src/components/usuarios/EmpleadoRow'
import EmptyState from '../../src/components/ui/EmptyState'
import { useToast } from '../../src/context/ToastContext'
import { usePdfGeneral } from '../../src/hooks/pdf/usePdfGeneral'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'

export default function PdfPreview() {
  const { showToast } = useToast()
  const { datos, cargando, generando, error, cargar, descargar, cancelar } = usePdfGeneral()

  // Recarga al recibir foco — cubre reasignación de empleados a reportes
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
      titulo={datos?.tituloPdf ?? ''}
      generador={datos ? `${datos.nombreGenerador}${datos.puestoGenerador ? ` (${datos.puestoGenerador})` : ''}` : ''}
      departamento={datos?.departamento as any}
      stats={datos?.statsGlobales ?? { total: 0, pendientes: 0, enProceso: 0, resueltos: 0 }}
      generando={generando}
      puedeDescargar={!!datos && datos.todosLosEmpleados.length > 0}
      onDescargar={handleDescargar}
      onCancelar={cancelar}
      onVolver={() => router.replace('/HomeEmpleado')}
      labelDescargar="Descargar PDF General"
    >
      <PdfSectionCard title="Todos los colaboradores del departamento">
        {!datos || datos.todosLosEmpleados.length === 0
          ? <EmptyState icon="people-outline" title="Sin colaboradores en este departamento" />
          : datos.todosLosEmpleados.map(g => (
              <EmpleadoRow
                key={g.idEmpl}
                nombre={g.nombreCompleto}
                cargo={g.cargo}
                departamento={g.departamento}
                stats={g.stats}
                mostrarProgreso
              />
            ))
        }
      </PdfSectionCard>
    </PdfLayout>
  )
}

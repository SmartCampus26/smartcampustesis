// ─── useRefresh.ts ────────────────────────────────────────────────────────────
// Hook compartido para el patrón pull-to-refresh.
// Evita repetir el estado `refrescando` + onRefresh en cada pantalla.
//
// USO:
//   const { refrescando, onRefresh } = useRefresh(cargarDatos)
//
// Si el hook de la vista ya expone su propio `onRefresh`, este hook
// no es necesario — úsalo solo cuando necesites el estado de refresco
// sin tener un hook de dominio propio.

import { useState } from 'react'

/**
 * Envuelve una función de carga y expone el estado de refresco.
 * @param cargar - Función async que recarga los datos
 */
export function useRefresh(cargar: () => Promise<void>) {
  const [refrescando, setRefrescando] = useState(false)

  const onRefresh = async () => {
    setRefrescando(true)
    try {
      await cargar()
    } finally {
      setRefrescando(false)
    }
  }

  return { refrescando, onRefresh }
}
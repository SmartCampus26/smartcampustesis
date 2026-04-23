import { useEffect } from 'react'
import { router } from 'expo-router'

export default function ResetPasswordRedirect() {
  useEffect(() => {
    // Redirige a ContraseniaOlvidada que ya tiene el listener
    // de PASSWORD_RECOVERY para mostrar el paso 3
    router.replace('/ContraseniaOlvidada')
  }, [])

  return null
}
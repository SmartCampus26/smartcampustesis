// 👷 EmpleadoNuevo.tsx — sin estilos propios, solo orquestación.

import { router } from 'expo-router'
import * as React from 'react'
import AppButton from '../../src/components/ui/AppButton'
import FormField from '../../src/components/ui/FormField'
import InfoBanner from '../../src/components/ui/InfoBanner'
import OptionSelector from '../../src/components/ui/OptionSelector'
import FormLayout from '../../src/components/layout/FormLayout'
import { useToast } from '../../src/context/ToastContext'
import { useEmpleadoNuevo } from '../../src/hooks/usuarios/useEmpleadoNuevo'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'

const DEPARTAMENTOS = [
  { label: 'Sistemas',      value: 'sistemas',      icon: 'desktop-outline' as const },
  { label: 'Mantenimiento', value: 'mantenimiento',  icon: 'construct-outline' as const },
]

const CARGOS = [
  { label: 'Colaborador', value: 'colaborador', icon: 'person-outline' as const },
  { label: 'Jefe',        value: 'jefe',        icon: 'briefcase-outline' as const },
]

export default function EmpleadoNuevo() {
  const { showToast } = useToast()
  const { form, set, cargando, error, crear } = useEmpleadoNuevo()

  const handleCrear = async () => {
    const ok = await crear()
    if (ok) {
      showToast('Colaborador creado correctamente', 'success')
      router.back()
    } else if (error) {
      showToast(error, 'error')
    }
  }

  useAndroidBack(() => {
    if (router.canGoBack()) {
      router.back()
    }
  })

  return (
    <FormLayout
      icon="people-outline"
      iconColor="#2F455C"
      title="Nuevo Colaborador"
      subtitle="Completa la información del nuevo miembro del equipo"
    >
      {error && (
        <InfoBanner
          text={error}
          variant="error"
        />
      )}

      <InfoBanner
        text="El colaborador recibirá un correo con sus credenciales para acceder al sistema."
        variant="info"
      />

      <FormField
        label="Nombre"
        placeholder="Nombre del colaborador"
        value={form.nomEmpl}
        onChangeText={v => set('nomEmpl', v)}
        icon="person-outline"
        autoCapitalize="words"
      />

      <FormField
        label="Apellido"
        placeholder="Apellido del colaborador"
        value={form.apeEmpl}
        onChangeText={v => set('apeEmpl', v)}
        icon="person-outline"
        autoCapitalize="words"
      />

      <FormField
        label="Correo electrónico"
        placeholder="correo@ejemplo.com"
        value={form.correoEmpl}
        onChangeText={v => set('correoEmpl', v)}
        icon="mail-outline"
        keyboardType="email-address"
      />

      <FormField
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        value={form.contraEmpl}
        onChangeText={v => set('contraEmpl', v)}
        icon="lock-closed-outline"
        isPassword
      />

      <FormField
        label="Teléfono"
        placeholder="Número de teléfono"
        value={form.tlfEmpl}
        onChangeText={v => set('tlfEmpl', v)}
        icon="call-outline"
        keyboardType="phone-pad"
      />

      <OptionSelector
        label="Departamento"
        value={form.deptEmpl}
        options={DEPARTAMENTOS}
        onChange={v => set('deptEmpl', v)}
      />

      <OptionSelector
        label="Cargo"
        value={form.cargEmpl}
        options={CARGOS}
        onChange={v => set('cargEmpl', v)}
      />

      <AppButton
        label="Crear Colaborador"
        onPress={handleCrear}
        loading={cargando}
        icon="person-add-outline"
      />

      <AppButton
        label="Cancelar"
        onPress={() => router.back()}
        variant="secondary"
      />
    </FormLayout>
  )
}
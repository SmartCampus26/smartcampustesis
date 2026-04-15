// 👤 UsuarioNuevo.tsx — sin estilos propios, solo orquestación.

import { router } from 'expo-router'
import * as React from 'react'
import AppButton from '../../src/components/ui/AppButton'
import FormField from '../../src/components/ui/FormField'
import InfoBanner from '../../src/components/ui/InfoBanner'
import OptionSelector from '../../src/components/ui/OptionSelector'
import FormLayout from '../../src/components/layout/FormLayout'
import { useToast } from '../../src/context/ToastContext'
import { useUsuarioNuevo } from '../../src/hooks/usuarios/useUsuarioNuevo'
import { useAndroidBack } from '../../src/hooks/androidService/useAndroidBack'

const ROLES = [
  { label: 'Docente',      value: 'docente',    icon: 'school-outline' as const },
  { label: 'Coordinador',  value: 'autoridad',  icon: 'shield-checkmark-outline' as const },
]

export default function UsuarioNuevo() {
  const { showToast } = useToast()
  const { form, set, cargando, error, crear } = useUsuarioNuevo()

  const handleCrear = async () => {
    const ok = await crear()
    if (ok) {
      showToast('Usuario creado correctamente', 'success')
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
      icon="person-add-outline"
      iconColor="#1DCDFE"
      title="Nuevo Usuario"
      subtitle="Completa la información del docente o coordinador"
    >
      {error && (
        <InfoBanner
          text={error}
          variant="error"
        />
      )}

      <InfoBanner
        text="El usuario recibirá un correo de bienvenida con sus credenciales de acceso."
        variant="info"
      />

      <FormField
        label="Nombre"
        placeholder="Nombre del usuario"
        value={form.nomUser}
        onChangeText={v => set('nomUser', v)}
        icon="person-outline"
        autoCapitalize="words"
      />

      <FormField
        label="Apellido"
        placeholder="Apellido del usuario"
        value={form.apeUser}
        onChangeText={v => set('apeUser', v)}
        icon="person-outline"
        autoCapitalize="words"
      />

      <FormField
        label="Correo electrónico"
        placeholder="correo@ejemplo.com"
        value={form.correoUser}
        onChangeText={v => set('correoUser', v)}
        icon="mail-outline"
        keyboardType="email-address"
      />

      <FormField
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        value={form.contraUser}
        onChangeText={v => set('contraUser', v)}
        icon="lock-closed-outline"
        isPassword
      />

      <FormField
        label="Teléfono"
        placeholder="Número de teléfono"
        value={form.tlfUser}
        onChangeText={v => set('tlfUser', v)}
        icon="call-outline"
        keyboardType="phone-pad"
      />

      <OptionSelector
        label="Rol del usuario"
        value={form.rolUser}
        options={ROLES}
        onChange={v => set('rolUser', v)}
      />

      <AppButton
        label="Crear Usuario"
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
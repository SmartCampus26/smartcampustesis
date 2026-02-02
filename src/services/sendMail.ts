import { supabase } from '../lib/Supabase'

/**
 * Envía un correo de prueba para validar que el email existe
 */
export const validarCorreoReal = async (correo: string) => {
  const { error } = await supabase.functions.invoke('send-email', {
    body: {
      to: correo,
      subject: 'Validación de correo',
      html: '<p>Este correo es para validar que la dirección existe.</p>',
    },
  })

  if (error) {
    throw new Error('El correo no existe o no puede recibir mensajes')
  }
}

/**
 * Envía correo de bienvenida
 */
export const enviarCorreoBienvenida = async (correo: string, nombre: string) => {
  await supabase.functions.invoke('send-email', {
    body: {
      to: correo,
      subject: 'Bienvenido/a',
      html: `<h3>Hola ${nombre}</h3><p>Tu usuario fue creado correctamente.</p>`,
    },
  })
}

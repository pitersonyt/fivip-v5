'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { canEncryptSecrets, encryptSecret } from '@/lib/secret-crypto'
import { PLAN_TYPES, SUBSCRIPTION_STATUSES } from '@/lib/entretenimiento'
import { ValidationError, amount, date, oneOf, text, type FormState } from '@/lib/form-utils'

export async function createSubscription(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()
  if (!supabase) return { error: 'Supabase no está conectado.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Tu sesión expiró. Inicia sesión nuevamente.' }

  let subscription
  try {
    const fecha_inicio = date(formData, 'fecha_inicio', 'Fecha de inicio')
    const fecha_vencimiento = date(formData, 'fecha_vencimiento', 'Fecha de vencimiento')
    if (fecha_inicio && fecha_vencimiento && fecha_vencimiento < fecha_inicio) {
      throw new ValidationError('La fecha de vencimiento no puede ser anterior a la de inicio.')
    }

    const password = String(formData.get('contrasena_servicio') ?? '')
    if (password && !canEncryptSecrets()) {
      throw new ValidationError(
        'No se puede guardar la contraseña: falta configurar la clave de cifrado del servidor.',
      )
    }

    subscription = {
      cliente: text(formData, 'cliente', { required: true, label: 'Cliente' }),
      whatsapp: text(formData, 'whatsapp'),
      pais: text(formData, 'pais'),
      producto: text(formData, 'producto', { required: true, label: 'Producto / servicio' }),
      tipo_plan: oneOf(formData, 'tipo_plan', PLAN_TYPES, 'Tipo de plan'),
      estado: oneOf(formData, 'estado', SUBSCRIPTION_STATUSES, 'Estado') ?? 'Activa',
      fecha_inicio,
      fecha_vencimiento,
      usuario_acceso: text(formData, 'usuario_acceso'),
      contrasena_cifrada: password ? encryptSecret(password) : null,
      costo: amount(formData.get('costo'), 'Costo'),
      precio_venta: amount(formData.get('precio_venta'), 'Precio de venta'),
      notas: text(formData, 'notas'),
    }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    throw error
  }

  const { error } = await supabase.from('suscripciones').insert({ ...subscription, user_id: user.id })
  if (error) return { error: 'No se pudo guardar la suscripción. Intenta nuevamente.' }

  revalidatePath('/entretenimiento', 'layout')
  redirect('/entretenimiento/suscripciones')
}

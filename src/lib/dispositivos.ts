import { supabase } from './supabase'

const DEVICE_ID_KEY = 'examprep_device_id'
export const LIMITE_DISPOSITIVOS = 2

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export type ResultadoVerificacion = { permitido: true } | { permitido: false; dispositivos: number }

export async function verificarDispositivo(userId: string): Promise<ResultadoVerificacion> {
  const deviceId = getDeviceId()
  const ahora = new Date().toISOString()

  const { data: existente } = await supabase
    .from('dispositivos_activos')
    .select('device_id')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .maybeSingle()

  if (existente) {
    await supabase
      .from('dispositivos_activos')
      .update({ ultimo_uso: ahora })
      .eq('user_id', userId)
      .eq('device_id', deviceId)
    return { permitido: true }
  }

  const { count } = await supabase
    .from('dispositivos_activos')
    .select('device_id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const activos = count ?? 0
  if (activos >= LIMITE_DISPOSITIVOS) {
    return { permitido: false, dispositivos: activos }
  }

  await supabase.from('dispositivos_activos').insert({
    user_id: userId,
    device_id: deviceId,
    primer_uso: ahora,
    ultimo_uso: ahora,
  })
  return { permitido: true }
}

/** Cierra sesión en todos los demás dispositivos de esta cuenta y deja
 * registrado únicamente el dispositivo actual. Se usa cuando el usuario
 * elige "continuar aquí" tras chocar con el límite de dispositivos. */
export async function cerrarSesionOtrosDispositivos(userId: string): Promise<void> {
  await supabase.from('dispositivos_activos').delete().eq('user_id', userId)
  const deviceId = getDeviceId()
  const ahora = new Date().toISOString()
  await supabase.from('dispositivos_activos').insert({
    user_id: userId,
    device_id: deviceId,
    primer_uso: ahora,
    ultimo_uso: ahora,
  })
}

/** Libera el "cupo" de este dispositivo. Se llama al cerrar sesión de forma
 * normal, para que ese hueco quede disponible de inmediato. */
export async function liberarDispositivoActual(userId: string): Promise<void> {
  const deviceId = getDeviceId()
  await supabase.from('dispositivos_activos').delete().eq('user_id', userId).eq('device_id', deviceId)
}

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

interface FilaVerificacion {
  permitido: boolean
  dispositivos: number | null
}

// Antes esto eran hasta 3 idas y vueltas seguidas a Supabase (select, y
// luego update o count+insert). Ahora es una sola llamada a la función
// verificar_dispositivo (ver supabase/schema.sql), que hace todo el
// chequeo en una transacción atómica del lado del servidor.
export async function verificarDispositivo(): Promise<ResultadoVerificacion> {
  const deviceId = getDeviceId()

  const { data, error } = await supabase
    .rpc('verificar_dispositivo', { p_device_id: deviceId, p_limite: LIMITE_DISPOSITIVOS })
    .single<FilaVerificacion>()

  if (error) {
    console.error('Error al verificar el dispositivo:', error.message)
    // Ante un fallo de verificación (p.ej. de red) no bloqueamos el
    // acceso: es preferible dejar entrar a un usuario legítimo que
    // arriesgarse a dejar a alguien fuera por un error transitorio.
    return { permitido: true }
  }

  if (data.permitido) return { permitido: true }
  return { permitido: false, dispositivos: data.dispositivos ?? LIMITE_DISPOSITIVOS }
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

// Última apertura de la app (panel de admin, pantalla Usuarios; ver
// supabase/schema.sql, sección 13). Al arrancar ya la registra
// verificar_dispositivo; esto cubre volver a la app desde segundo plano
// (pestaña o PWA que se queda abierta), como mucho una vez cada 5 min para
// no hacer una llamada en cada cambio de pestaña. La hora la pone el
// servidor. Si falla (sin red), no pasa nada: se registra en la siguiente.
const INTERVALO_APERTURA_MS = 5 * 60_000
let ultimaAperturaRegistrada = Date.now()

export function registrarAperturaSiToca(): void {
  const ahora = Date.now()
  if (ahora - ultimaAperturaRegistrada < INTERVALO_APERTURA_MS) return
  ultimaAperturaRegistrada = ahora
  supabase.rpc('registrar_apertura').then(({ error }) => {
    if (error) console.warn('[apertura] no se pudo registrar', error.message)
  })
}

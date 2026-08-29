// src/lib/mensajesAdminRemoto.ts
//
// Comunicados que un admin manda a todos los usuarios o a uno puntual desde
// el panel de admin (tabla `mensajes_admin`), mostrados en Home. Un usuario
// nunca vuelve a ver un mensaje que ya cerró (tabla `mensajes_admin_descartados`),
// esté activo o no — mismo criterio que `tourBienvenidaRemoto.ts` para el
// tour, pero acá puede haber varios mensajes en cola: se muestra siempre el
// más viejo entre los que todavía no se cerraron.

import { supabase } from './supabase'

export type TipoMensajeAdmin = 'texto' | 'texto_foto' | 'video'

export interface MensajeAdmin {
  id: string
  tipo: TipoMensajeAdmin
  texto: string | null
  mediaUrl: string | null
}

export async function getMensajePendiente(): Promise<MensajeAdmin | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: descartados } = await supabase
    .from('mensajes_admin_descartados')
    .select('mensaje_id')
    .eq('user_id', user.id)

  const idsDescartados = (descartados ?? []).map((d) => d.mensaje_id as string)

  let consulta = supabase
    .from('mensajes_admin')
    .select('id, tipo, texto, media_url')
    .eq('activo', true)
    .or(`destinatario_user_id.is.null,destinatario_user_id.eq.${user.id}`)
    .order('creado_en', { ascending: true })
    .limit(1)

  if (idsDescartados.length > 0) {
    consulta = consulta.not('id', 'in', `(${idsDescartados.join(',')})`)
  }

  const { data, error } = await consulta.maybeSingle()
  if (error || !data) return null

  return {
    id: data.id as string,
    tipo: data.tipo as TipoMensajeAdmin,
    texto: data.texto as string | null,
    mediaUrl: data.media_url as string | null,
  }
}

export async function descartarMensaje(mensajeId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('mensajes_admin_descartados').insert({ mensaje_id: mensajeId, user_id: user.id })
}

// src/lib/mensajesAdminRemoto.ts
//
// Comunicados que un admin manda a todos los usuarios o a uno puntual desde
// el panel de admin (tabla `mensajes_admin`), mostrados en Home. Un usuario
// nunca vuelve a ver un mensaje que ya cerró (tabla `mensajes_admin_descartados`),
// esté activo o no — mismo criterio que `tourBienvenidaRemoto.ts` para el
// tour. Se muestran todos apilados a la vez (no de a uno), ordenados del
// más nuevo al más viejo — ver [[mensajes-home-apilados-diseno]].

import { supabase } from './supabase'

export type TipoMensajeAdmin = 'texto' | 'texto_foto' | 'video'

export interface MensajeAdmin {
  id: string
  tipo: TipoMensajeAdmin
  texto: string | null
  mediaUrl: string | null
  // Si es true, este mensaje ignora los descartes previos del usuario: sigue
  // apareciendo en cada visita a Home hasta que un admin lo elimine o lo
  // desactive. Ver getMensajesPendientes().
  mostrarSiempre: boolean
}

// Trae TODOS los mensajes pendientes (los que todavía no se descartaron),
// más nuevo primero. Home los muestra todos apilados a la vez, cada uno con
// su propia ✕ — cerrar uno no afecta a los demás.
//
// userId como parámetro en vez de un supabase.auth.getUser() propio (que
// revalida contra el servidor en cada llamada, a diferencia de la sesión ya
// resuelta en App.tsx) — mismo criterio que academiaAccesoRemoto.ts.
export async function getMensajesPendientes(userId: string): Promise<MensajeAdmin[]> {
  const [{ data: mensajes, error }, { data: descartados }] = await Promise.all([
    supabase
      .from('mensajes_admin')
      .select('id, tipo, texto, media_url, mostrar_siempre')
      .eq('activo', true)
      .or(`destinatario_user_id.is.null,destinatario_user_id.eq.${userId}`)
      .order('creado_en', { ascending: false }),
    supabase.from('mensajes_admin_descartados').select('mensaje_id').eq('user_id', userId),
  ])

  if (error || !mensajes) return []

  const idsDescartados = new Set((descartados ?? []).map((d) => d.mensaje_id as string))

  // Un mensaje `mostrar_siempre` se muestra igual aunque ya se haya
  // descartado antes — solo lo saca de acá un admin (eliminándolo o
  // desactivándolo, ambos ya filtrados arriba por `activo = true`).
  return mensajes
    .filter((fila) => fila.mostrar_siempre === true || !idsDescartados.has(fila.id as string))
    .map((fila) => ({
      id: fila.id as string,
      tipo: fila.tipo as TipoMensajeAdmin,
      texto: fila.texto as string | null,
      mediaUrl: fila.media_url as string | null,
      mostrarSiempre: fila.mostrar_siempre as boolean,
    }))
}

export async function descartarMensaje(mensajeId: string, userId: string): Promise<void> {
  await supabase.from('mensajes_admin_descartados').insert({ mensaje_id: mensajeId, user_id: userId })
}

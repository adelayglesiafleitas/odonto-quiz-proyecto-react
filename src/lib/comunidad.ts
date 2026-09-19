import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Comunidad (chat por asignatura). Todas las reglas duras (alias obligatorio,
// normas aceptadas, modo lento, silencios, palabras bloqueadas, grupo en
// pausa, "solo el equipo escribe") se validan en la base (trigger
// comunidad_mensaje_validar); la app solo las refleja. El rol de equipo lo
// decide es_admin() en el servidor (columna es_equipo), nunca comparando ids
// acá. Ver claude/comunidad-chat-diseno-viabilidad.md.

export interface Sala {
  id: string
  nombre: string
  asignatura: string | null
  orden: number
  acceso: 'libre' | 'aprobacion'
  escribe: 'todos' | 'equipo'
  modoLentoSeg: number
  pausada: boolean
  normas: string
  /** Mensaje fijado por el equipo (barra bajo la cabecera). Vacío = se muestra la 1.ª línea de las normas. */
  fijado: string
}

export interface ResumenSala {
  salaId: string
  miembros: number
  ultCuerpo: string | null
  ultAutorId: string | null
  ultEsEquipo: boolean
  ultBorrado: boolean
  ultEn: string | null
}

export interface MiembroSala {
  salaId: string
  estado: 'activo' | 'pendiente' | 'expulsado'
  ultimaLectura: string
  silenciado: boolean
  normasAceptadas: boolean
}

export interface MensajeChat {
  id: string
  salaId: string
  autorId: string
  cuerpo: string
  respondeA: string | null
  esEquipo: boolean
  verificado: boolean
  borrado: boolean
  creadoEn: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapSala(r: any): Sala {
  return {
    id: r.id,
    nombre: r.nombre,
    asignatura: r.asignatura,
    orden: r.orden,
    acceso: r.acceso,
    escribe: r.escribe,
    modoLentoSeg: r.modo_lento_seg,
    pausada: r.pausada,
    normas: r.normas ?? '',
    fijado: r.fijado ?? '',
  }
}

/** Último mensaje y nº de miembros por grupo (función de base de datos: respeta quién puede leer qué). */
export async function resumenSalas(): Promise<Map<string, ResumenSala>> {
  const { data } = await supabase.rpc('comunidad_resumen')
  const mapa = new Map<string, ResumenSala>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data ?? []) as any[]) {
    mapa.set(r.sala_id, {
      salaId: r.sala_id,
      miembros: Number(r.miembros),
      ultCuerpo: r.ult_cuerpo,
      ultAutorId: r.ult_autor_id,
      ultEsEquipo: !!r.ult_es_equipo,
      ultBorrado: !!r.ult_borrado,
      ultEn: r.ult_en,
    })
  }
  return mapa
}

function mapMensaje(r: any): MensajeChat {
  return {
    id: r.id,
    salaId: r.sala_id,
    autorId: r.autor_id,
    cuerpo: r.cuerpo,
    respondeA: r.responde_a,
    esEquipo: r.es_equipo,
    verificado: r.verificado,
    borrado: !!r.borrado_por,
    creadoEn: r.creado_en,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function listarSalas(): Promise<Sala[]> {
  const { data } = await supabase.from('comunidad_salas').select('*').order('orden')
  return (data ?? []).map(mapSala)
}

export async function listarMisMembresias(userId: string): Promise<Map<string, MiembroSala>> {
  const { data } = await supabase.from('comunidad_miembros').select('*').eq('user_id', userId)
  const mapa = new Map<string, MiembroSala>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data ?? []) as any[]) {
    mapa.set(r.sala_id, {
      salaId: r.sala_id,
      estado: r.estado,
      ultimaLectura: r.ultima_lectura,
      silenciado: r.silenciado,
      normasAceptadas: !!r.normas_aceptadas_en,
    })
  }
  return mapa
}

export async function esEquipo(): Promise<boolean> {
  const { data } = await supabase.rpc('es_admin')
  return data === true
}

export async function obtenerAlias(userId: string): Promise<string | null> {
  const { data } = await supabase.from('comunidad_alias').select('alias').eq('user_id', userId).maybeSingle()
  return data?.alias ?? null
}

export async function crearAlias(userId: string, alias: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('comunidad_alias').insert({ user_id: userId, alias: alias.trim() })
  if (!error) return { ok: true }
  if (error.code === '23505') return { ok: false, error: 'duplicado' }
  if (error.code === '23514') return { ok: false, error: 'formato' }
  return { ok: false, error: error.message.includes('no está permitido') ? 'prohibido' : 'desconocido' }
}

export async function aliasDe(ids: string[]): Promise<Map<string, string>> {
  const unicos = [...new Set(ids)]
  const mapa = new Map<string, string>()
  if (unicos.length === 0) return mapa
  const { data } = await supabase.from('comunidad_alias').select('user_id, alias').in('user_id', unicos)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data ?? []) as any[]) mapa.set(r.user_id, r.alias)
  return mapa
}

/** Une al usuario al grupo (queda 'activo' si el acceso es libre, 'pendiente' si pide aprobación: lo decide el trigger). */
export async function unirseASala(salaId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('comunidad_miembros')
    .upsert({ sala_id: salaId, user_id: userId }, { onConflict: 'sala_id,user_id', ignoreDuplicates: true })
  return !error
}

export async function aceptarNormas(salaId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('comunidad_miembros')
    .update({ normas_aceptadas_en: new Date().toISOString() })
    .eq('sala_id', salaId)
    .eq('user_id', userId)
  return !error
}

export async function salirDeSala(salaId: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from('comunidad_miembros').delete().eq('sala_id', salaId).eq('user_id', userId)
  return !error
}

export async function setSilenciado(salaId: string, userId: string, silenciado: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('comunidad_miembros')
    .update({ silenciado })
    .eq('sala_id', salaId)
    .eq('user_id', userId)
  return !error
}

export async function listarMensajes(salaId: string, limite = 60): Promise<MensajeChat[]> {
  const { data } = await supabase
    .from('comunidad_mensajes')
    .select('*')
    .eq('sala_id', salaId)
    .order('creado_en', { ascending: false })
    .limit(limite)
  return (data ?? []).map(mapMensaje).reverse()
}

export async function enviarMensaje(
  salaId: string,
  autorId: string,
  cuerpo: string,
  respondeA?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('comunidad_mensajes')
    .insert({ sala_id: salaId, autor_id: autorId, cuerpo, responde_a: respondeA ?? null })
  if (!error) return { ok: true }
  // Los triggers devuelven mensajes ya redactados en español: se muestran tal cual.
  return { ok: false, error: error.message }
}

export async function marcarLeida(salaId: string, userId: string): Promise<void> {
  await supabase
    .from('comunidad_miembros')
    .update({ ultima_lectura: new Date().toISOString() })
    .eq('sala_id', salaId)
    .eq('user_id', userId)
  window.dispatchEvent(new Event('comunidad:leido'))
}

// Acciones del equipo (RLS: solo es_admin()).
export async function borrarMensaje(id: string, adminId: string): Promise<boolean> {
  const { error } = await supabase.from('comunidad_mensajes').update({ borrado_por: adminId }).eq('id', id)
  return !error
}

export async function verificarMensaje(id: string, verificado: boolean): Promise<boolean> {
  const { error } = await supabase.from('comunidad_mensajes').update({ verificado }).eq('id', id)
  return !error
}

/** Un canal por grupo abierto, con nombre único (un nombre de canal solo se puede suscribir una vez). */
export function suscribirseASala(
  salaId: string,
  onNuevo: (m: MensajeChat) => void,
  onCambio: (m: MensajeChat) => void,
  onSala: (s: Sala) => void,
): () => void {
  const canal = supabase
    .channel(`comunidad-sala-${salaId}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'comunidad_mensajes', filter: `sala_id=eq.${salaId}` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => onNuevo(mapMensaje(p.new)),
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'comunidad_mensajes', filter: `sala_id=eq.${salaId}` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => onCambio(mapMensaje(p.new)),
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'comunidad_salas', filter: `id=eq.${salaId}` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => onSala(mapSala(p.new)),
    )
    .subscribe()
  return () => {
    supabase.removeChannel(canal)
  }
}

/** Canal de la lista de grupos (nombre único): avisa cuando entra cualquier mensaje visible para el usuario. */
export function suscribirseAListado(onCambio: () => void): () => void {
  const canal = supabase
    .channel(`comunidad-lista-${Math.random().toString(36).slice(2, 8)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comunidad_mensajes' }, onCambio)
    .subscribe()
  return () => {
    supabase.removeChannel(canal)
  }
}

export async function noLeidosPorSala(): Promise<Map<string, number>> {
  const { data } = await supabase.rpc('comunidad_no_leidos')
  const mapa = new Map<string, number>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data ?? []) as any[]) mapa.set(r.sala_id, Number(r.n))
  return mapa
}

/**
 * Total de mensajes sin leer, para la insignia de la pestaña Comunidad.
 * Canal propio con nombre único (separado de tickets y de las salas).
 */
export function useNoLeidosComunidad(): number {
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let cancelado = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let quitar: (() => void) | null = null

    const recargar = () => {
      noLeidosPorSala().then((m) => {
        if (cancelado) return
        let suma = 0
        m.forEach((n) => (suma += n))
        setTotal(suma)
      })
    }
    const programar = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(recargar, 400)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelado || !data.session) return
      recargar()
      const canal = supabase
        .channel(`comunidad-nl-${Math.random().toString(36).slice(2, 8)}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comunidad_mensajes' }, programar)
        .subscribe()
      quitar = () => {
        supabase.removeChannel(canal)
      }
    })
    window.addEventListener('comunidad:leido', programar)

    return () => {
      cancelado = true
      if (timer) clearTimeout(timer)
      window.removeEventListener('comunidad:leido', programar)
      if (quitar) quitar()
    }
  }, [])

  return total
}

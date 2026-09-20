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
  /** Color del icono del grupo (hex) o null = color automático. */
  color: string | null
  /** Descripción corta que se muestra en la ficha del grupo. */
  descripcion: string
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
  /** true si el autor modificó el texto después de enviarlo. */
  editado: boolean
  /** Ids de los usuarios mencionados con @ (la base solo guarda miembros activos del grupo). */
  menciones: string[]
  /** true si el mensaje incluye @admin. */
  mencionaAdmin: boolean
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
    color: r.color ?? null,
    descripcion: r.descripcion ?? '',
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
    editado: !!r.editado_en,
    menciones: r.menciones ?? [],
    mencionaAdmin: !!r.menciona_admin,
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

/** Cambia el alias del chat (la base revalida formato, duplicados y palabras reservadas). */
export async function cambiarAlias(userId: string, alias: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('comunidad_alias').update({ alias: alias.trim() }).eq('user_id', userId)
  if (!error) return { ok: true }
  if (error.code === '23505') return { ok: false, error: 'duplicado' }
  if (error.code === '23514') return { ok: false, error: 'formato' }
  if (error.message.includes('no está permitido')) return { ok: false, error: 'prohibido' }
  return { ok: false, error: 'desconocido' }
}

export type ResultadoNick = 'ok' | 'formato' | 'prohibido' | 'duplicado' | 'error'

/** Formato, palabras reservadas y disponibilidad (nadie más usa ese nick, sin distinguir mayúsculas). */
export async function comprobarNick(nick: string): Promise<ResultadoNick> {
  const n = nick.trim()
  if (!/^[A-Za-z0-9_.-]{3,20}$/.test(n)) return 'formato'
  if (/(admin|equipo|soporte|moderador|staff)/i.test(n)) return 'prohibido'
  const { data, error } = await supabase.rpc('nick_disponible', { p_nick: n })
  if (error) return 'error'
  return data === true ? 'ok' : 'duplicado'
}

/**
 * Un solo nick para toda la app: se guarda en la cuenta (nickname) y es el mismo alias del chat.
 * Si el usuario ya tiene alias en Comunidad se actualiza también (la base valida formato, duplicados y
 * palabras reservadas); si aún no lo tiene, se comprueba que nadie más lo use para que después le sirva en el chat.
 */
export async function cambiarNick(
  userId: string,
  nuevo: string,
  tieneAlias: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const nick = nuevo.trim()
  if (!/^[A-Za-z0-9_.-]{3,20}$/.test(nick)) return { ok: false, error: 'formato' }
  if (tieneAlias) {
    const r = await cambiarAlias(userId, nick)
    if (!r.ok) return r
  } else {
    const c = await comprobarNick(nick)
    if (c !== 'ok') return { ok: false, error: c }
  }
  const { error } = await supabase.auth.updateUser({ data: { nickname: nick } })
  return error ? { ok: false, error: 'desconocido' } : { ok: true }
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

/** El autor edita su propio texto (la base revalida palabras bloqueadas, silencio y pausa). */
export async function editarMensaje(id: string, cuerpo: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('comunidad_mensajes').update({ cuerpo }).eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}

/** El autor elimina su propio mensaje (queda "Mensaje eliminado"). */
export async function borrarMiMensaje(id: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from('comunidad_mensajes').update({ borrado_por: userId }).eq('id', id)
  return !error
}

/** Limpieza del equipo: cuenta (ejecutar=false) o borra (ejecutar=true) mensajes con más de `dias` días. Solo admins. */
export async function limpiarMensajes(
  dias: number,
  salaId: string | null,
  incluirEquipo: boolean,
  ejecutar: boolean,
): Promise<{ n: number; error?: string }> {
  const { data, error } = await supabase.rpc('admin_chat_limpiar', {
    p_dias: dias,
    p_sala: salaId,
    p_incluir_equipo: incluirEquipo,
    p_ejecutar: ejecutar,
  })
  if (error) return { n: 0, error: error.message }
  return { n: Number(data ?? 0) }
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

/* ------------------------------------------------------------------ */
/* Configuración compartida con el panel admin (una sola fuente: Supabase) */

export type EstadoAcceso = 'ok' | 'cerrado' | 'bloqueado' | 'sin_habilitar'

/** Quién puede entrar ahora mismo. Lo decide la base (comunidad_estado_acceso); el equipo siempre es 'ok'. */
export async function estadoAcceso(): Promise<EstadoAcceso> {
  const { data, error } = await supabase.rpc('comunidad_estado_acceso')
  if (error || !data) return 'ok'
  return data as EstadoAcceso
}

export interface ConfigChat {
  exigirAlias: boolean
  exigirNormas: boolean
}

export async function obtenerConfigChat(): Promise<ConfigChat> {
  const { data } = await supabase.from('comunidad_config').select('exigir_alias, exigir_normas').eq('id', true).maybeSingle()
  return { exigirAlias: data?.exigir_alias ?? true, exigirNormas: data?.exigir_normas ?? true }
}

/** Avisa cuando el panel admin cambia el chat abierto/cerrado, el modo de acceso o el acceso de este usuario. */
export function suscribirseAConfig(alCambiar: () => void): () => void {
  const canal = supabase
    .channel(`comunidad-cfg-${Math.random().toString(36).slice(2, 10)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comunidad_config' }, alCambiar)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comunidad_acceso_usuario' }, alCambiar)
    .subscribe()
  return () => {
    supabase.removeChannel(canal)
  }
}

export async function reportarMensaje(
  mensajeId: string,
  salaId: string,
  userId: string,
  motivo = '',
): Promise<'ok' | 'duplicado' | 'error'> {
  const { error } = await supabase
    .from('comunidad_reportes')
    .insert({ mensaje_id: mensajeId, sala_id: salaId, reportado_por: userId, motivo })
  if (!error) return 'ok'
  return error.code === '23505' ? 'duplicado' : 'error'
}

/* Herramientas del equipo (solo funcionan si es_admin() en la base). */

export async function guardarAjustesSala(
  salaId: string,
  p: Partial<Pick<Sala, 'pausada' | 'escribe' | 'acceso' | 'modoLentoSeg' | 'fijado'>>,
): Promise<boolean> {
  const f: Record<string, unknown> = {}
  if (p.pausada !== undefined) f.pausada = p.pausada
  if (p.escribe !== undefined) f.escribe = p.escribe
  if (p.acceso !== undefined) f.acceso = p.acceso
  if (p.modoLentoSeg !== undefined) f.modo_lento_seg = p.modoLentoSeg
  if (p.fijado !== undefined) f.fijado = p.fijado
  const { error } = await supabase.from('comunidad_salas').update(f).eq('id', salaId)
  return !error
}

export async function silenciarUsuario(
  userId: string,
  horas: number | null,
  adminId: string,
  salaId: string | null = null,
): Promise<boolean> {
  const hasta = horas === null ? '2100-01-01T00:00:00Z' : new Date(Date.now() + horas * 3600000).toISOString()
  const { error } = await supabase
    .from('comunidad_silencios')
    .insert({ user_id: userId, sala_id: salaId, hasta, motivo: 'Silenciado por el equipo', por: adminId })
  if (!error) {
    await supabase.from('comunidad_acciones').insert({
      admin_id: adminId,
      tipo: 'silencio',
      usuario_id: userId,
      sala_id: salaId,
      detalle: `Usuario silenciado ${horas === null ? 'indefinidamente' : horas + ' h'} desde la app${salaId ? ' (solo un grupo)' : ''}`,
    })
  }
  return !error
}

/** Correo real de los autores. Solo lo devuelve la base si quien pregunta es admin; el resto solo ve alias. */
export async function identidadesDe(ids: string[]): Promise<Map<string, string>> {
  const mapa = new Map<string, string>()
  if (ids.length === 0) return mapa
  const { data } = await supabase.rpc('comunidad_identidades', { p_ids: ids })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data ?? []) as any[]) mapa.set(r.user_id, r.email)
  return mapa
}

/* ------------------------------------------------------------------ */
/* Menciones (@alias y @admin). Solo alias: nunca correos. */

/** Alias de los miembros activos del grupo (para el autocompletado al escribir @). */
export async function aliasesDeSala(salaId: string): Promise<{ userId: string; alias: string }[]> {
  const { data } = await supabase.rpc('comunidad_alias_sala', { p_sala: salaId })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((r) => ({ userId: r.user_id, alias: r.alias }))
}

/** Menciones sin leer por grupo para el usuario (no admin). */
export async function mencionesNoLeidas(): Promise<Map<string, number>> {
  const { data } = await supabase.rpc('comunidad_menciones_no_leidas')
  const mapa = new Map<string, number>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data ?? []) as any[]) mapa.set(r.sala_id, Number(r.n))
  return mapa
}

const CLAVE_ADMIN_LEIDO = 'comunidad:adminMencionLeida:'

export function marcarMencionAdminLeida(salaId: string): void {
  try {
    localStorage.setItem(CLAVE_ADMIN_LEIDO + salaId, new Date().toISOString())
  } catch {
    /* sin almacenamiento */
  }
  window.dispatchEvent(new Event('comunidad:leido'))
}

/** Para admins: cuántos @admin sin leer hay por grupo (última semana; lo leído se guarda en este dispositivo). */
export async function mencionesAdminNoLeidas(): Promise<Map<string, number>> {
  const desde = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data } = await supabase
    .from('comunidad_mensajes')
    .select('sala_id, creado_en')
    .eq('menciona_admin', true)
    .is('borrado_por', null)
    .eq('es_equipo', false)
    .gte('creado_en', desde)
  const mapa = new Map<string, number>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data ?? []) as any[]) {
    let leida = ''
    try {
      leida = localStorage.getItem(CLAVE_ADMIN_LEIDO + r.sala_id) ?? ''
    } catch {
      /* sin almacenamiento */
    }
    if (!leida || r.creado_en > leida) mapa.set(r.sala_id, (mapa.get(r.sala_id) ?? 0) + 1)
  }
  return mapa
}

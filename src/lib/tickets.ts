import { supabase } from './supabase'
import type { Pregunta } from '../types'

// Sistema de atención al cliente conversacional: reemplaza el modelo
// unidireccional de `feedback` (ver lib/feedback.ts, que queda sin usar).
// Tablas `tickets` + `mensajes` en Supabase — ver
// claude/atencion-cliente-diseno.md en el proyecto de Claude para el diseño
// completo (incluye la lógica de reapertura automática y "no leído", que
// vive en un trigger de base de datos, no acá).

export type EstadoTicket = 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado'
export type OrigenTicket = 'pregunta' | 'cuenta' | 'pagos' | 'otro'

export interface Ticket {
  id: string
  creadoEn: string
  ultimaActividadEn: string
  origen: OrigenTicket
  preguntaNumero: number | null
  preguntaTexto: string | null
  preguntaAsignatura: string | null
  preguntaCapitulo: string | null
  asunto: string
  estado: EstadoTicket
  noLeidoUsuario: boolean
}

export interface Mensaje {
  id: string
  ticketId: string
  autorId: string
  cuerpo: string
  creadoEn: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTicket(fila: any): Ticket {
  return {
    id: fila.id,
    creadoEn: fila.created_at,
    ultimaActividadEn: fila.ultima_actividad_en,
    origen: fila.origen,
    preguntaNumero: fila.pregunta_numero,
    preguntaTexto: fila.pregunta_texto,
    preguntaAsignatura: fila.pregunta_asignatura,
    preguntaCapitulo: fila.pregunta_capitulo,
    asunto: fila.asunto,
    estado: fila.estado,
    noLeidoUsuario: fila.no_leido_usuario,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMensaje(fila: any): Mensaje {
  return {
    id: fila.id,
    ticketId: fila.ticket_id,
    autorId: fila.autor_id,
    cuerpo: fila.cuerpo,
    creadoEn: fila.created_at,
  }
}

export async function listarMisTickets(userId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('usuario_id', userId)
    .order('ultima_actividad_en', { ascending: false })
  if (error) {
    console.error('Error al listar tickets:', error.message)
    return []
  }
  return (data ?? []).map(mapTicket)
}

export async function obtenerTicket(ticketId: string): Promise<Ticket | null> {
  const { data, error } = await supabase.from('tickets').select('*').eq('id', ticketId).maybeSingle()
  if (error || !data) return null
  return mapTicket(data)
}

export async function obtenerMensajes(ticketId: string): Promise<Mensaje[]> {
  const { data, error } = await supabase
    .from('mensajes')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
  if (error) {
    console.error('Error al obtener mensajes:', error.message)
    return []
  }
  return (data ?? []).map(mapMensaje)
}

// Crea el ticket y su primer mensaje en un solo viaje al servidor (función
// `crear_ticket` en Postgres, transaccional). Devuelve el id para poder
// navegar directo al hilo recién creado.
export async function crearTicket(params: {
  asunto: string
  origen: OrigenTicket
  cuerpo: string
  pregunta?: Pick<Pregunta, 'numero' | 'pregunta' | 'asignatura' | 'capitulo'>
}): Promise<{ ok: boolean; ticketId: string | null }> {
  const { data, error } = await supabase.rpc('crear_ticket', {
    p_asunto: params.asunto,
    p_origen: params.origen,
    p_cuerpo: params.cuerpo,
    p_pregunta_numero: params.pregunta?.numero ?? null,
    p_pregunta_texto: params.pregunta?.pregunta ?? null,
    p_pregunta_asignatura: params.pregunta?.asignatura ?? null,
    p_pregunta_capitulo: params.pregunta?.capitulo ?? null,
  })
  if (error) {
    console.error('Error al crear el ticket:', error.message)
    return { ok: false, ticketId: null }
  }
  return { ok: true, ticketId: data as string }
}

export async function enviarMensaje(ticketId: string, autorId: string, cuerpo: string): Promise<{ ok: boolean }> {
  const { error } = await supabase.from('mensajes').insert({ ticket_id: ticketId, autor_id: autorId, cuerpo })
  if (error) {
    console.error('Error al enviar el mensaje:', error.message)
    return { ok: false }
  }
  return { ok: true }
}

// El trigger de la base marca no_leido_usuario=true cuando responde
// soporte; esto lo limpia al abrir el hilo. No hace falta RPC: la policy
// de UPDATE ya permite al usuario tocar su propia fila.
export async function marcarLeidoUsuario(ticketId: string): Promise<void> {
  await supabase.from('tickets').update({ no_leido_usuario: false }).eq('id', ticketId)
}

export function contarNoLeidos(tickets: Ticket[]): number {
  return tickets.filter((t) => t.noLeidoUsuario).length
}

// "hace 12 min" / "hace 2 h" / "hace 5 d" — usado en la lista de tickets y
// en el hilo. No usa Intl.RelativeTimeFormat para no tener que resolver el
// plural en dos idiomas acá también; alcanza con esta escala simple.
export function formatoRelativo(fecha: string, idioma: 'es' | 'en'): string {
  const minutos = Math.round((Date.now() - new Date(fecha).getTime()) / 60000)
  if (idioma === 'en') {
    if (minutos < 1) return 'just now'
    if (minutos < 60) return `${minutos}m ago`
    const horas = Math.round(minutos / 60)
    if (horas < 24) return `${horas}h ago`
    return `${Math.round(horas / 24)}d ago`
  }
  if (minutos < 1) return 'recién'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  return `hace ${Math.round(horas / 24)} d`
}

// Realtime: la lista de "Mis consultas" se refresca sola cuando cambia
// cualquier ticket propio (nueva actividad, cambio de estado), y el hilo
// de un ticket recibe los mensajes del otro lado sin recargar.
export function suscribirseAMisTickets(userId: string, onCambio: () => void): () => void {
  const canal = supabase
    .channel(`tickets-usuario-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tickets', filter: `usuario_id=eq.${userId}` },
      onCambio,
    )
    .subscribe()
  return () => {
    supabase.removeChannel(canal)
  }
}

export function suscribirseAMensajesTicket(
  ticketId: string,
  onMensaje: (m: Mensaje) => void,
  onTicketActualizado: () => void,
): () => void {
  const canal = supabase
    .channel(`ticket-${ticketId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `ticket_id=eq.${ticketId}` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => onMensaje(mapMensaje(payload.new)),
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` },
      onTicketActualizado,
    )
    .subscribe()
  return () => {
    supabase.removeChannel(canal)
  }
}

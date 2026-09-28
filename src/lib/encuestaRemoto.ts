// src/lib/encuestaRemoto.ts
//
// ENCUESTA-TEMPORAL — Encuesta "Ayúdanos a mejorar" (ver
// claude/encuesta-feedback-diseno.md y supabase/schema.sql, sección 12).
//
// Para APAGARLA sin borrar nada: CAMPANIA_ENCUESTA = null.
// Para hacer otra encuesta más adelante: cambiar el id (p. ej. '2027-01');
// cada campaña es una fila nueva por usuario, así que vuelve a mostrarse.
// Para QUITARLA del todo: buscar "ENCUESTA-TEMPORAL" en el proyecto y borrar
// cada punto (este archivo, EncuestaFeedback.tsx y el bloque en Home.tsx).
//
// Regla: se muestra UNA sola vez por usuario y campaña. La fila se crea en
// cuanto se abre la ventana, así que "existe fila" = "ya la vio", la haya
// terminado o cerrado con la ✕.

import { supabase } from './supabase'
import { getVioTourBienvenida } from './tourBienvenidaRemoto'
import { getMensajesPendientes } from './mensajesAdminRemoto'

export const CAMPANIA_ENCUESTA: string | null = '2026-10'

export type CanalEncuesta =
  | 'instagram'
  | 'tiktok'
  | 'google'
  | 'whatsapp'
  | 'telegram'
  | 'companero'
  | 'academia'
  | 'otro'

export interface DatosEncuesta {
  nps?: number | null
  canales?: CanalEncuesta[]
  canal_otro?: string | null
  funcion?: string | null
  cambio?: string | null
  ultimo_paso?: number
  completada?: boolean
  cerrada_con_x?: boolean
}

// Decide si hay que mostrarla al entrar a Home. Todo en una sola función
// para que Home.tsx solo tenga que llamarla una vez:
// - encuesta activa (hay campaña),
// - el usuario ya vio el tour (si no, esta es su primera sesión: el tour
//   tiene prioridad y alguien recién llegado no puede puntuar la app),
// - al menos un simulacro hecho,
// - sin mensajes del admin nuevos pendientes (los "mostrar siempre" no
//   cuentan: si no, bloquearían la encuesta para siempre),
// - todavía no tiene fila en esta campaña.
export async function debeMostrarEncuesta(userId: string): Promise<boolean> {
  if (!CAMPANIA_ENCUESTA) return false

  const [vioTour, mensajes, fila, intentos] = await Promise.all([
    getVioTourBienvenida(userId),
    getMensajesPendientes(userId),
    supabase
      .from('encuesta_respuestas')
      .select('user_id')
      .eq('user_id', userId)
      .eq('campania', CAMPANIA_ENCUESTA)
      .maybeSingle(),
    supabase
      .from('historial_intentos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  if (!vioTour) return false
  if (mensajes.some((m) => !m.mostrarSiempre)) return false
  // Ante un error de red no se muestra: mejor perder una ocasión que
  // mostrarla dos veces a alguien que ya la vio.
  if (fila.error || fila.data) return false
  if (intentos.error || (intentos.count ?? 0) === 0) return false
  return true
}

// Crea la fila al abrirse la ventana. ignoreDuplicates: si por lo que sea
// ya existía, no pisa lo que hubiera guardado.
export async function registrarEncuestaMostrada(userId: string): Promise<void> {
  if (!CAMPANIA_ENCUESTA) return
  await supabase
    .from('encuesta_respuestas')
    .upsert({ user_id: userId, campania: CAMPANIA_ENCUESTA }, { onConflict: 'user_id,campania', ignoreDuplicates: true })
}

// Guarda lo contestado hasta ahora. Upsert y no update: si el insert de
// registrarEncuestaMostrada falló (red), la fila se crea aquí igual.
export async function guardarEncuesta(userId: string, datos: DatosEncuesta): Promise<void> {
  if (!CAMPANIA_ENCUESTA) return
  const { error } = await supabase
    .from('encuesta_respuestas')
    .upsert({ user_id: userId, campania: CAMPANIA_ENCUESTA, ...datos }, { onConflict: 'user_id,campania' })
  if (error) console.warn('[encuesta] no se pudo guardar', error.message)
}

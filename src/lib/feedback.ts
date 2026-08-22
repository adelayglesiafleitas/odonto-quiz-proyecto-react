import { supabase } from './supabase'
import type { Pregunta } from '../types'

// Motivos predefinidos (texto libre en la base, sin enum de Postgres — ver
// la migración `add_feedback_table`): así se pueden agregar motivos nuevos
// sin tocar el esquema. Si se agrega uno acá, solo hace falta la traducción
// nueva en i18n.ts (t.reportarPregunta.motivos).
export type TipoFeedbackPregunta = 'respuesta_incorrecta' | 'opcion_ambigua_o_duplicada' | 'texto_con_error' | 'otro'

export async function reportarPregunta(
  userId: string,
  pregunta: Pregunta,
  tipo: TipoFeedbackPregunta,
  comentario: string | null,
): Promise<{ ok: boolean }> {
  const { error } = await supabase.from('feedback').insert({
    reportado_por: userId,
    origen: 'pregunta',
    pregunta_numero: pregunta.numero,
    pregunta_texto: pregunta.pregunta,
    asignatura: pregunta.asignatura,
    capitulo: pregunta.capitulo,
    tipo,
    comentario,
  })
  if (error) {
    console.error('Error al reportar la pregunta:', error.message)
    return { ok: false }
  }
  return { ok: true }
}

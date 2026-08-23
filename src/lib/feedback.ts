import type { Pregunta } from '../types'
import { crearTicket } from './tickets'
import { es } from './i18n'

// Motivos predefinidos (texto libre, no enum de Postgres): así se pueden
// agregar motivos nuevos sin tocar el esquema. Si se agrega uno acá, solo
// hace falta la traducción nueva en i18n.ts (t.reportarPregunta.motivos).
export type TipoFeedbackPregunta = 'respuesta_incorrecta' | 'opcion_ambigua_o_duplicada' | 'texto_con_error' | 'otro'

// Reportar una pregunta ahora abre un ticket de soporte con origen
// 'pregunta' (tabla `tickets` + `mensajes`) en vez de escribir en la vieja
// tabla `feedback`, que queda sin usar — ver claude/atencion-cliente-diseno.md.
// El motivo elegido se usa como asunto del ticket; el comentario (si lo
// hay) es el primer mensaje, y si no escribió nada se manda el motivo como
// mensaje para que el ticket nunca quede sin cuerpo.
export async function reportarPregunta(
  // Ya no se usa acá (crearTicket toma el usuario de auth.uid() en el
  // servidor), pero se mantiene en la firma para no tocar el call site en
  // ReportarPregunta.tsx. El prefijo _ evita el error TS6133 de parámetro
  // sin usar (noUnusedParameters en tsconfig).
  _userId: string,
  pregunta: Pregunta,
  tipo: TipoFeedbackPregunta,
  comentario: string | null,
): Promise<{ ok: boolean }> {
  const { ok } = await crearTicket({
    asunto: es.reportarPregunta.motivos[tipo],
    origen: 'pregunta',
    cuerpo: comentario?.trim() || es.reportarPregunta.motivos[tipo],
    pregunta,
  })
  return { ok }
}

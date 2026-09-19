// src/lib/academiaPuntuacion.ts
//
// Sistema de puntuación de Academia (2026-09-19). Diseño y decisiones en
// claude/academia-sistema-puntuacion-diseno.md.
//
// Resumen:
// - Nota total sobre 100: 80 puntos por los capítulos (5 por capítulo × 16)
//   + 20 reservados para una prueba final del libro (todavía sin construir).
// - Dentro de un capítulo, cada lección (tema) vale igual; dentro de una
//   lección, cada pregunta vale igual. Lo que no existe o no se cursó cuenta
//   0, pero su peso queda reservado, así el 100 no cambia al sumar contenido.
// - Puntos de una pregunta según los intentos de la PRIMERA vez que se
//   responde: 1.º = 100 %, 2.º = 60 %, 3.º o más = 30 %. Esa marca es
//   definitiva (como en un videojuego, si fallas ya no llegas al máximo):
//   repetir la lección es solo práctica y no la modifica.
// - Estrellas: 3 / 2 / 1 con los mismos umbrales.
//
// Importa solo el TIPO de academiaProgresoLocal (se borra al compilar) para
// no crear una dependencia circular con ese archivo.

import { CAPITULOS_INMACULADA, NODOS_CAP1, VIDEOS_CAP1 } from '@/data/academiaInmaculada'
import type { ProgresoCap1 } from './academiaProgresoLocal'

export const PUNTOS_POR_CAPITULO = 5
export const PUNTOS_CAPITULOS = PUNTOS_POR_CAPITULO * CAPITULOS_INMACULADA.length
export const PUNTOS_PRUEBA_LIBRO = 20
export const PUNTOS_TOTAL = 100

/** Lecciones (temas) del Capítulo 1: Parálisis Cerebral, Epilepsia, Distrofia Muscular. */
export const TEMAS_TOTAL_CAP1 = 3

/** Nodos de la ruta que tienen una pregunta puntuable (video1, video2 y la prueba final). */
export const NODOS_PREGUNTA_CAP1 = NODOS_CAP1.filter(
  (n) => n.tipo === 'prueba' || (n.tipo === 'video' && Boolean(VIDEOS_CAP1.find((v) => v.id === n.videoId)?.pruebaId)),
)

export const PUNTOS_LECCION_CAP1 = PUNTOS_POR_CAPITULO / TEMAS_TOTAL_CAP1
export const PUNTOS_PREGUNTA_CAP1 = PUNTOS_LECCION_CAP1 / Math.max(1, NODOS_PREGUNTA_CAP1.length)

export function factorIntentos(intentos: number): number {
  if (intentos <= 1) return 1
  if (intentos === 2) return 0.6
  return 0.3
}

export function estrellasIntentos(intentos: number): 1 | 2 | 3 {
  if (intentos <= 1) return 3
  if (intentos === 2) return 2
  return 1
}

export function puntosPregunta(intentos: number): number {
  return PUNTOS_PREGUNTA_CAP1 * factorIntentos(intentos)
}

export interface ResumenPuntuacion {
  /** Nota total sobre 100. */
  notaTotal: number
  /** Puntos del Capítulo 1 (sobre PUNTOS_LECCION_CAP1 mientras solo exista la lección de Parálisis Cerebral). */
  notaCap1: number
  preguntasRespondidas: number
  preguntasTotal: number
  estrellas: number
  estrellasMax: number
  /** 3 estrellas en todas las preguntas del tema. */
  sinFallos: boolean
}

export function calcularPuntuacion(progreso: ProgresoCap1): ResumenPuntuacion {
  let notaCap1 = 0
  let estrellas = 0
  let respondidas = 0
  for (const n of NODOS_PREGUNTA_CAP1) {
    const intentos = progreso[n.id]?.intentos
    if (!intentos) continue
    respondidas += 1
    notaCap1 += puntosPregunta(intentos)
    estrellas += estrellasIntentos(intentos)
  }
  const total = NODOS_PREGUNTA_CAP1.length
  return {
    notaTotal: notaCap1,
    notaCap1,
    preguntasRespondidas: respondidas,
    preguntasTotal: total,
    estrellas,
    estrellasMax: total * 3,
    sinFallos: total > 0 && respondidas === total && NODOS_PREGUNTA_CAP1.every((n) => progreso[n.id]?.intentos === 1),
  }
}

/** Estrellas (0-3) de la lección completa: 3 solo si todas las preguntas fueron a la primera. */
export function estrellasLeccion(r: ResumenPuntuacion): number {
  if (r.estrellasMax === 0 || r.preguntasRespondidas === 0) return 0
  return Math.max(1, Math.floor((r.estrellas / r.estrellasMax) * 3))
}

export function fmtPuntos(n: number): string {
  return n.toFixed(2).replace('.', ',')
}

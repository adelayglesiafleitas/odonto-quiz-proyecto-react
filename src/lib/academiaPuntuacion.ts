// src/lib/academiaPuntuacion.ts
//
// Sistema de puntuación de Academia (2026-09-19). Diseño y decisiones en
// claude/academia-sistema-puntuacion-diseno.md y
// claude/academia-pruebas-errores-prueba-final-diseno.md.
//
// Resumen:
// - Nota total sobre 100: 80 puntos por los capítulos (5 por capítulo × 16)
//   + 20 reservados para una prueba final del libro (todavía sin construir).
// - Dentro de un capítulo, cada lección (tema) vale igual. Lo que no existe o
//   no se cursó cuenta 0, pero su peso queda reservado, así el 100 no cambia
//   al sumar contenido.
// - SOLO puntúa la prueba final de la lección (3 preguntas fijas, cada una
//   vale 1/3 de la lección). Las pruebas de después de los videos no dan
//   puntos: solo guardan los errores (ver ProgresoNodo.errores).
// - Puntos de una pregunta según los intentos de la PRIMERA vez que se
//   responde: 1.º = 100 %, 2.º = 60 %, 3.º o más = 30 %. Esa marca es
//   definitiva: repetir la lección es solo práctica y no la modifica.
// - Estrellas: 3 / 2 / 1 con los mismos umbrales.
//
// Importa solo el TIPO de academiaProgresoLocal (se borra al compilar) para
// no crear una dependencia circular con ese archivo.

import { CAPITULOS_INMACULADA, NODOS_CAP1, PREGUNTAS_PRUEBA_FINAL_CAP1, type TemaId } from '@/data/academiaInmaculada'
import type { ProgresoCap1 } from './academiaProgresoLocal'

export const PUNTOS_POR_CAPITULO = 5
export const PUNTOS_CAPITULOS = PUNTOS_POR_CAPITULO * CAPITULOS_INMACULADA.length
export const PUNTOS_PRUEBA_LIBRO = 20
export const PUNTOS_TOTAL = 100

/** Lecciones (temas) del Capítulo 1: Parálisis Cerebral, Epilepsia, Distrofia Muscular. */
export const TEMAS_TOTAL_CAP1 = 3

export interface PreguntaPuntuable {
  nodoId: string
  /** Posición de la pregunta dentro de la prueba (0-based). */
  indice: number
  titulo: string
  /** Tema (lección) al que pertenece la prueba final. */
  temaId?: TemaId
}

/** Preguntas que puntúan: las de la prueba final de la lección (las de los videos no). */
export const PREGUNTAS_PUNTUABLES_CAP1: PreguntaPuntuable[] = NODOS_CAP1.filter((n) => n.tipo === 'prueba' && n.esFinal).flatMap((n) =>
  Array.from({ length: PREGUNTAS_PRUEBA_FINAL_CAP1 }, (_, indice) => ({ nodoId: n.id, indice, titulo: n.titulo, temaId: n.temaId })),
)

/** Nodos con preguntas que puntúan (solo la prueba final). Se conserva por compatibilidad. */
export const NODOS_PREGUNTA_CAP1 = NODOS_CAP1.filter((n) => n.tipo === 'prueba' && n.esFinal)

export const PUNTOS_LECCION_CAP1 = PUNTOS_POR_CAPITULO / TEMAS_TOTAL_CAP1
// 2026-09-30: cada lección vale PUNTOS_LECCION_CAP1 repartido entre SUS 3
// preguntas (antes se dividía entre todas las puntuables, que con 2 temas
// habría bajado el valor de cada lección a la mitad).
export const PUNTOS_PREGUNTA_CAP1 = PUNTOS_LECCION_CAP1 / PREGUNTAS_PRUEBA_FINAL_CAP1

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

/** Intentos de la primera vez que se respondió esa pregunta (undefined = todavía sin marca). */
export function intentosDePregunta(progreso: ProgresoCap1, p: PreguntaPuntuable): number | undefined {
  const n = progreso[p.nodoId]?.intentosPreguntas?.[p.indice]
  return n && n > 0 ? n : undefined
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

/** Preguntas puntuables de un tema (o todas, sin tema). */
export function preguntasPuntuables(temaId?: TemaId): PreguntaPuntuable[] {
  return temaId ? PREGUNTAS_PUNTUABLES_CAP1.filter((p) => p.temaId === temaId) : PREGUNTAS_PUNTUABLES_CAP1
}

/**
 * Con `temaId` (2026-09-30), `notaCap1`/estrellas/preguntas son solo de esa
 * lección; `notaTotal` sigue siendo la nota total de todo lo cursado.
 */
export function calcularPuntuacion(progreso: ProgresoCap1, temaId?: TemaId): ResumenPuntuacion {
  let notaTotal = 0
  for (const p of PREGUNTAS_PUNTUABLES_CAP1) {
    const intentos = intentosDePregunta(progreso, p)
    if (intentos) notaTotal += puntosPregunta(intentos)
  }
  const lista = preguntasPuntuables(temaId)
  let notaCap1 = 0
  let estrellas = 0
  let respondidas = 0
  for (const p of lista) {
    const intentos = intentosDePregunta(progreso, p)
    if (!intentos) continue
    respondidas += 1
    notaCap1 += puntosPregunta(intentos)
    estrellas += estrellasIntentos(intentos)
  }
  const total = lista.length
  return {
    notaTotal,
    notaCap1,
    preguntasRespondidas: respondidas,
    preguntasTotal: total,
    estrellas,
    estrellasMax: total * 3,
    sinFallos: total > 0 && respondidas === total && lista.every((p) => intentosDePregunta(progreso, p) === 1),
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

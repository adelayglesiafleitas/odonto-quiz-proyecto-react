import preguntasRaw from '../preguntas.json'
import type { Pregunta, IntentoExamen } from '../types'
import { getCookieJSON, setCookieJSON } from './cookies'

export const PREGUNTAS = preguntasRaw as Pregunta[]

export function getCapitulos(): string[] {
  const set = new Set(PREGUNTAS.map((p) => p.capitulo))
  return Array.from(set).sort()
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function seleccionarPreguntas(cantidad: number, capitulo: string | 'todos'): Pregunta[] {
  const pool = capitulo === 'todos' ? PREGUNTAS : PREGUNTAS.filter((p) => p.capitulo === capitulo)
  const barajadas = shuffle(pool)
  return barajadas.slice(0, Math.min(cantidad, barajadas.length))
}

const HISTORIAL_COOKIE = 'odontoprep_historial'
const HISTORIAL_MAX = 12

export function getHistorial(): IntentoExamen[] {
  return getCookieJSON<IntentoExamen[]>(HISTORIAL_COOKIE, [])
}

export function guardarIntento(intento: IntentoExamen) {
  const historial = getHistorial()
  historial.unshift(intento)
  setCookieJSON(HISTORIAL_COOKIE, historial.slice(0, HISTORIAL_MAX))
}

export function getPromedio(): number {
  const historial = getHistorial()
  if (historial.length === 0) return 0
  const suma = historial.reduce((acc, i) => acc + i.porcentaje, 0)
  return Math.round(suma / historial.length)
}

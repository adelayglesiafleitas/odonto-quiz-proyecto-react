import odontologiaRaw from '../data/odontologia.json'
import nacionalidadRaw from '../data/nacionalidad.json'
import conducirRaw from '../data/conducir.json'
import type { Pregunta, IntentoExamen } from '../types'
import { getCookieJSON, setCookieJSON } from './cookies'

const BANCOS: Record<string, Pregunta[]> = {
  odontologia: odontologiaRaw as Pregunta[],
  nacionalidad: nacionalidadRaw as Pregunta[],
  conducir: conducirRaw as Pregunta[],
}

export function getPreguntas(cursoId: string): Pregunta[] {
  return BANCOS[cursoId] ?? []
}

export function getCapitulos(cursoId: string): string[] {
  const set = new Set(getPreguntas(cursoId).map((p) => p.capitulo))
  return Array.from(set).sort()
}

export function getAnios(cursoId: string): number[] {
  const set = new Set(getPreguntas(cursoId).map((p) => p.anio))
  return Array.from(set).sort((a, b) => b - a)
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function seleccionarPreguntas(
  cursoId: string,
  cantidad: number,
  capitulo: string | 'todos',
  anio: number | 'todos' = 'todos',
): Pregunta[] {
  let pool = getPreguntas(cursoId)
  if (capitulo !== 'todos') pool = pool.filter((p) => p.capitulo === capitulo)
  if (anio !== 'todos') pool = pool.filter((p) => p.anio === anio)
  const barajadas = shuffle(pool)
  return barajadas.slice(0, Math.min(cantidad, barajadas.length))
}

const HISTORIAL_COOKIE = 'examprep_historial'
const HISTORIAL_MAX = 30

export function getHistorial(cursoId?: string): IntentoExamen[] {
  const todos = getCookieJSON<IntentoExamen[]>(HISTORIAL_COOKIE, [])
  return cursoId ? todos.filter((i) => i.cursoId === cursoId) : todos
}

export function guardarIntento(intento: IntentoExamen) {
  const todos = getCookieJSON<IntentoExamen[]>(HISTORIAL_COOKIE, [])
  todos.unshift(intento)
  setCookieJSON(HISTORIAL_COOKIE, todos.slice(0, HISTORIAL_MAX))
}

export function getPromedio(cursoId?: string): number {
  const historial = getHistorial(cursoId)
  if (historial.length === 0) return 0
  const suma = historial.reduce((acc, i) => acc + i.porcentaje, 0)
  return Math.round(suma / historial.length)
}

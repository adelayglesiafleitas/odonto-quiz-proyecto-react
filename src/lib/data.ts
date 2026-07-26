import type { Pregunta } from '../types'

// El banco de preguntas pesa ~1.1MB en JSON. En vez de incluirlo en el bundle
// principal (que retrasaría la primera pintura de la app), se carga como un
// chunk aparte mediante import() dinámico. `cargarBanco()` se dispara al
// montar App y se espera antes de entrar a 'home', así que para cuando se
// usan los getters síncronos de abajo el banco ya está en caché.
let cache: Pregunta[] = []
let cargaPromise: Promise<Pregunta[]> | null = null

export function cargarBanco(): Promise<Pregunta[]> {
  if (!cargaPromise) {
    cargaPromise = import('../data/odontologia.json').then((mod) => {
      cache = mod.default as Pregunta[]
      return cache
    })
  }
  return cargaPromise
}

export function getPreguntas(): Pregunta[] {
  return cache
}

export function getCapitulos(): string[] {
  const set = new Set(getPreguntas().map((p) => p.capitulo))
  return Array.from(set).sort()
}

export function getAnios(): number[] {
  // anio = 0 significa "banco temático sin convocatoria real verificada"
  // (ver cursos.ts); no se muestra como opción de convocatoria seleccionable.
  const set = new Set(getPreguntas().map((p) => p.anio))
  set.delete(0)
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
  cantidad: number,
  capitulo: string | 'todos',
  anio: number | 'todos' = 'todos',
): Pregunta[] {
  let pool = getPreguntas()
  if (capitulo !== 'todos') pool = pool.filter((p) => p.capitulo === capitulo)
  if (anio !== 'todos') pool = pool.filter((p) => p.anio === anio)
  const barajadas = shuffle(pool)
  return barajadas.slice(0, Math.min(cantidad, barajadas.length))
}

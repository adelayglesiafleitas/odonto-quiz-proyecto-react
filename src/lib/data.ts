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

// Buena parte del banco (~800 de 1059 preguntas) tiene 5 opciones en vez de
// 4. En el examen se muestran como máximo 4: se conservan TODAS las
// correctas (nunca se saca una respuesta válida) y se descarta al azar una
// de las incorrectas hasta llegar a 4. No modifica el JSON del banco — la
// pregunta original con sus 5 opciones sigue intacta en odontologia.json,
// esto recorta solo la copia que se arma para un examen puntual.
const MAXIMO_OPCIONES = 4

function limitarOpciones(pregunta: Pregunta, maximo = MAXIMO_OPCIONES): Pregunta {
  if (pregunta.opciones.length <= maximo) return pregunta

  const correctas = pregunta.opciones.filter((o) => o.correcta)
  const incorrectas = pregunta.opciones.filter((o) => !o.correcta)
  const cupoIncorrectas = Math.max(0, maximo - correctas.length)
  const incorrectasElegidas = new Set(shuffle(incorrectas).slice(0, cupoIncorrectas))

  // Se conserva el orden original de aparición (no el orden barajado): varias
  // preguntas están armadas como una escalera de opciones cada vez más
  // completas ("clorhexidina" → "clorhexidina + analgésicos" → ...), y
  // desordenarlas les quitaría sentido.
  const opciones = pregunta.opciones
    .filter((o) => o.correcta || incorrectasElegidas.has(o))
    .map((o, i) => ({ ...o, letra: String.fromCharCode(65 + i) })) // re-etiqueta A, B, C, D

  return { ...pregunta, opciones }
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
  return barajadas.slice(0, Math.min(cantidad, barajadas.length)).map((p) => limitarOpciones(p))
}

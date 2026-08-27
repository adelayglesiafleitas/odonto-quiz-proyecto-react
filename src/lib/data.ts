import type { Pregunta } from '../types'

// Un banco de preguntas por curso (~1.1MB Odontología, ~340KB Psicología en
// JSON). Cada uno se carga como su propio chunk mediante import() dinámico,
// y solo cuando se pide — así alguien que solo rinde Psicología nunca
// descarga el JSON de Odontología, y viceversa. `cargarBanco(cursoId)` se
// dispara al montar App (para el curso por defecto, ver lib/cursos.ts) y al
// elegir una asignatura en ElegirAsignatura; se espera antes de entrar a la
// pantalla que lo necesita, así que para cuando se usan los getters
// síncronos de abajo el banco pedido ya está en caché.
const BANCOS: Record<string, () => Promise<{ default: Pregunta[] }>> = {
  odontologia: () => import('../data/odontologia.json'),
  psicologia: () => import('../data/psicologia.json'),
  ortodoncia: () => import('../data/ortodoncia.json'),
}

const cache: Record<string, Pregunta[]> = {}
const cargaPromises: Record<string, Promise<Pregunta[]>> = {}

export function cargarBanco(cursoId: string): Promise<Pregunta[]> {
  if (!cargaPromises[cursoId]) {
    const cargar = BANCOS[cursoId]
    if (!cargar) {
      console.error(`No hay banco de preguntas registrado para el curso "${cursoId}"`)
      cargaPromises[cursoId] = Promise.resolve([])
    } else {
      cargaPromises[cursoId] = cargar().then((mod) => {
        cache[cursoId] = mod.default
        return cache[cursoId]
      })
    }
  }
  return cargaPromises[cursoId]
}

export function getPreguntas(cursoId: string): Pregunta[] {
  return cache[cursoId] ?? []
}

export function getCapitulos(cursoId: string): string[] {
  const set = new Set(getPreguntas(cursoId).map((p) => p.capitulo))
  return Array.from(set).sort()
}

export function getAnios(cursoId: string): number[] {
  // anio = 0 significa "banco temático sin convocatoria real verificada"
  // (ver cursos.ts); no se muestra como opción de convocatoria seleccionable.
  const set = new Set(getPreguntas(cursoId).map((p) => p.anio))
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

// Decisión 2026-08-22 (revertida 2026-08-23): se había probado recortar a un
// máximo de 4 opciones por pregunta en el examen (~800 de 1059 preguntas
// tienen 5). El usuario detectó que eso rompía preguntas con más de una
// respuesta correcta (ej. A y E correctas a la vez) — el recorte al azar de
// las incorrectas podía dejar una combinación rara para ese tipo de
// pregunta. Se sacó el recorte por completo: ahora el examen siempre
// muestra TODAS las opciones de cada pregunta tal como están en el banco,
// sin importar si son 2, 3, 4, 5 o cualquier otra cantidad.

export function seleccionarPreguntas(
  cursoId: string,
  cantidad: number,
  capitulos: string[],
  anio: number | 'todos' = 'todos',
): Pregunta[] {
  let pool = getPreguntas(cursoId)
  // Array vacío = todos los capítulos; con elementos, cualquier pregunta de
  // cualquiera de los capítulos elegidos entra en el pool (combinación, no
  // intersección).
  if (capitulos.length > 0) pool = pool.filter((p) => capitulos.includes(p.capitulo))
  if (anio !== 'todos') pool = pool.filter((p) => p.anio === anio)
  const barajadas = shuffle(pool)
  return barajadas.slice(0, Math.min(cantidad, barajadas.length))
}

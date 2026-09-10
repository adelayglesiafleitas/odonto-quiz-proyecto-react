import { supabase } from './supabase'
import type { Pregunta } from '../types'

// Banco de preguntas: antes vivía como JSON estático embebido en el bundle
// (un import() dinámico por curso — ver el historial de este archivo). Ahora
// vive en la tabla `preguntas` de Supabase (columna `curso_id`, misma clave
// que usa CURSOS en lib/cursos.ts y BANCOS acá antes), así se puede corregir
// una pregunta desde el panel admin sin tocar código ni redeployar la app.
// Ver claude/preguntas-tabla-editor-admin.md.
//
// La forma de usarlo no cambió para el resto de la app: `cargarBanco(cursoId)`
// se llama una vez (al montar App para el curso por defecto, y al elegir
// asignatura en ElegirAsignatura) y se espera antes de entrar a la pantalla
// que lo necesita; para cuando se usan los getters síncronos de abajo el
// banco pedido ya está en caché. Ninguna otra pantalla necesitó cambiar.

const cache: Record<string, Pregunta[]> = {}
const cargaPromises: Record<string, Promise<Pregunta[]>> = {}

// PostgREST no devuelve más de 1000 filas por pedido aunque no se pida
// límite explícito — Ortodoncia sola tiene más de 17 mil preguntas, así que
// hay que paginar con `.range()` hasta juntar el curso completo. Se pide una
// sola vez por curso (igual que antes se descargaba el JSON entero una sola
// vez) y no en cada examen, así que no afecta cómo de "liviana" se siente la
// carga de un examen.
const TAMANO_PAGINA = 1000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPregunta(fila: any): Pregunta {
  return {
    numero: fila.numero,
    pregunta: fila.pregunta,
    asignatura: fila.asignatura,
    capitulo: fila.capitulo,
    anio: fila.anio,
    bibliografia: fila.bibliografia,
    opciones: fila.opciones ?? [],
    caso: fila.caso ?? undefined,
  }
}

async function traerCursoCompleto(cursoId: string): Promise<Pregunta[]> {
  const filas: Pregunta[] = []
  let desde = 0
  for (;;) {
    const { data, error } = await supabase
      .from('preguntas')
      .select('numero, pregunta, asignatura, capitulo, anio, bibliografia, opciones, caso')
      .eq('curso_id', cursoId)
      .order('numero', { ascending: true })
      .range(desde, desde + TAMANO_PAGINA - 1)
    if (error) {
      console.error(`Error al cargar el banco de preguntas de "${cursoId}":`, error.message)
      break
    }
    const pagina = (data ?? []).map(mapPregunta)
    filas.push(...pagina)
    if (pagina.length < TAMANO_PAGINA) break
    desde += TAMANO_PAGINA
  }
  return filas
}

export function cargarBanco(cursoId: string): Promise<Pregunta[]> {
  if (!cargaPromises[cursoId]) {
    cargaPromises[cursoId] = traerCursoCompleto(cursoId).then((filas) => {
      cache[cursoId] = filas
      return filas
    })
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

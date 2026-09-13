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

// Un cursoId de la app puede corresponder a más de un curso_id en la tabla
// `preguntas`. Se usa para el banco del libro "Odontología en Pacientes con
// Necesidades Especiales": mientras se prueba, sus preguntas viven bajo
// curso_id='odontologia_libro' (separado de 'odontologia', el curso_id real
// que ya sirve a los usuarios) para que ningún código ya desplegado pueda
// verlas por accidente. Esta app SÍ las conoce (por eso está en este mapa) y
// las trae en la misma consulta que el resto del curso, distinguiéndolas
// después por la columna `libro` (ver mapPregunta/seleccionarPreguntas). El
// día que se decida "publicarlas" de verdad no hace falta tocar la base de
// datos: alcanza con que este mapa siga como está (ya las incluye).
const CURSO_ID_DB: Record<string, string[]> = {
  odontologia: ['odontologia', 'odontologia_libro'],
}

function dbIdsPara(cursoId: string): string[] {
  return CURSO_ID_DB[cursoId] ?? [cursoId]
}

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
    libro: fila.libro ?? undefined,
  }
}

async function traerCursoCompleto(cursoId: string): Promise<Pregunta[]> {
  const filas: Pregunta[] = []
  let desde = 0
  for (;;) {
    const { data, error } = await supabase
      .from('preguntas')
      .select('numero, pregunta, asignatura, capitulo, anio, bibliografia, opciones, caso, libro')
      .in('curso_id', dbIdsPara(cursoId))
      // Una pregunta oculta desde el admin (columna `oculta`, migración
      // agregar_oculta_preguntas) sigue en la tabla pero no debe llegar nunca
      // a un examen — de ahí este filtro. Default false, así que no afecta a
      // ninguna pregunta que no haya sido ocultada explícitamente.
      .eq('oculta', false)
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
      // Un curso real nunca debería volver vacío (RLS exige sesión iniciada,
      // y todo curso registrado en CURSOS tiene preguntas cargadas). Si pasa,
      // lo más probable es que la consulta se haya disparado antes de que la
      // sesión estuviera lista. No se cachea ese resultado como si fuera
      // válido: así, la próxima vez que se pida este curso, reintenta en vez
      // de quedar en 0 preguntas para el resto de la sesión del navegador.
      if (filas.length === 0) delete cargaPromises[cursoId]
      return filas
    })
  }
  return cargaPromises[cursoId]
}

export function getPreguntas(cursoId: string): Pregunta[] {
  return cache[cursoId] ?? []
}

// `libro` opcional filtra a los capítulos de una fuente concreta:
// - null (default) = capítulos de "Exámenes", es decir preguntas sin `libro`
//   (mismo resultado que antes de que existiera esta columna, para todo
//   curso que no tenga ningún libro cargado).
// - un nombre de libro = capítulos de ese libro únicamente.
// Ver Fuente en ConfigurarExamen.tsx.
export function getCapitulos(cursoId: string, libro: string | null = null): string[] {
  const preguntas = getPreguntas(cursoId).filter((p) => (p.libro ?? null) === libro)
  const set = new Set(preguntas.map((p) => p.capitulo))
  return Array.from(set).sort()
}

// Nombres de los libros cargados para este curso (fuente "Libro" en
// ConfigurarExamen.tsx). Vacío en todo curso sin ninguna pregunta de libro.
export function getLibros(cursoId: string): string[] {
  const set = new Set(
    getPreguntas(cursoId)
      .map((p) => p.libro)
      .filter((l): l is string => !!l),
  )
  return Array.from(set).sort()
}

export function getAnios(cursoId: string): number[] {
  // anio = 0 significa "banco temático sin convocatoria real verificada"
  // (ver cursos.ts); no se muestra como opción de convocatoria seleccionable.
  const set = new Set(getPreguntas(cursoId).map((p) => p.anio))
  set.delete(0)
  return Array.from(set).sort((a, b) => b - a)
}

// Recupera un set puntual de preguntas por su `numero` dentro de un curso,
// en vez de todo el banco — usado por "Repetir" en Historial para reconstruir
// exactamente el mismo examen de un intento pasado sin tener que cargar
// (o tener en caché) el curso entero, que en Ortodoncia son 17k+ filas para
// repetir apenas 20-45 preguntas.
export async function obtenerPreguntasPorNumero(cursoId: string, numeros: number[]): Promise<Pregunta[]> {
  if (numeros.length === 0) return []
  const { data, error } = await supabase
    .from('preguntas')
    .select('numero, pregunta, asignatura, capitulo, anio, bibliografia, opciones, caso, libro')
    .in('curso_id', dbIdsPara(cursoId))
    .in('numero', numeros)
    .eq('oculta', false)
  if (error) {
    console.error(`Error al recuperar las preguntas para repetir el intento de "${cursoId}":`, error.message)
    return []
  }
  const porNumero = new Map((data ?? []).map(mapPregunta).map((p) => [p.numero, p]))
  // Se preserva el orden guardado (el mismo que vio el usuario en el intento
  // original). Si alguna pregunta ya no existe o fue ocultada desde el admin
  // entre medio, simplemente se omite en vez de romper el repetir.
  return numeros.map((n) => porNumero.get(n)).filter((p): p is Pregunta => p !== undefined)
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
  // Array vacío = todos los capítulos, del curso entero (exámenes + libro,
  // si tiene): con elementos, cualquier pregunta de cualquiera de los
  // capítulos elegidos entra en el pool (combinación, no intersección). Ver
  // Fuente en ConfigurarExamen.tsx: elegir Fuente "Libro" con "todos los
  // capítulos" resuelve ahí mismo a la lista concreta de capítulos de ese
  // libro antes de llegar acá (para no mezclarlo con otro libro futuro),
  // pero Fuente "Exámenes" con "todos los capítulos" sí trae también las
  // preguntas de libro a propósito — es una única fuente de preguntas más
  // dentro del mismo curso, no algo aparte.
  if (capitulos.length > 0) pool = pool.filter((p) => capitulos.includes(p.capitulo))
  if (anio !== 'todos') pool = pool.filter((p) => p.anio === anio)
  const barajadas = shuffle(pool)
  return barajadas.slice(0, Math.min(cantidad, barajadas.length))
}

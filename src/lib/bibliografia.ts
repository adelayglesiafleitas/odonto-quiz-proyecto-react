// Parsea el string de `bibliografia` que guarda el banco para preguntas
// sacadas de un libro (ver claude/banco-libros/SKILL.md en el proyecto de
// Claude para el formato exacto que se genera al citar). Forma esperada:
//
//   "<Título del libro>, cap. <N>, pág. <Y> — <justificación>. Texto del libro: "<cita>""
//
// Se parsea de forma defensiva: una `bibliografia` que no siga el formato
// (preguntas antiguas sin libro, o texto libre) simplemente se muestra tal
// cual en `meta`, sin desglosar — nunca lanza ni oculta el texto.
export interface BibliografiaParseada {
  meta: string
  justificacion: string
  cita: string | null
}

const SEPARADOR_META = ' — '
const MARCADOR_CITA = 'Texto del libro:'

// Mismo patrón que genera el proceso de citación real (ver
// claude/banco-libros/SKILL.md): "cap. <N>, pág. <Y>". Sirve para marcar,
// en listados de categorías/libros, cuáles tienen cita verificada contra
// el libro y cuáles todavía no (preguntas antiguas o de otro origen).
const PATRON_CITA_VERIFICADA = /cap\.\s*\d+,\s*p[áa]g\.\s*\d+/i

export function tieneCitaVerificada(raw: string | null | undefined): boolean {
  return !!raw && PATRON_CITA_VERIFICADA.test(raw)
}

export function parsearBibliografia(raw: string | null | undefined): BibliografiaParseada | null {
  if (!raw || !raw.trim()) return null

  const idxSep = raw.indexOf(SEPARADOR_META)
  if (idxSep === -1) {
    return { meta: raw.trim(), justificacion: '', cita: null }
  }

  const meta = raw.slice(0, idxSep).trim()
  const resto = raw.slice(idxSep + SEPARADOR_META.length)

  const idxCita = resto.indexOf(MARCADOR_CITA)
  if (idxCita === -1) {
    return { meta, justificacion: resto.trim(), cita: null }
  }

  const justificacion = resto.slice(0, idxCita).trim()
  let cita = resto.slice(idxCita + MARCADOR_CITA.length).trim()
  const match = cita.match(/^"([\s\S]*)"$/)
  if (match) cita = match[1]

  return { meta, justificacion, cita: cita || null }
}

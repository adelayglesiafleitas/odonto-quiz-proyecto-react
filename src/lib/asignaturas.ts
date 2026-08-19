import type { Idioma } from '@/lib/i18n'

export interface Asignatura {
  id: string
  nombre: string
  disponible: boolean
}

/**
 * Asignaturas que se pueden examinar. Por ahora solo hay banco de preguntas
 * para "Pacientes especiales" (ligado a CURSO_ID en lib/cursos.ts). Cuando
 * se agregue el banco de preguntas de una nueva asignatura, se suma acá con
 * `disponible: true` y se conecta a su propio CursoMeta/banco.
 */
const ASIGNATURAS_ES: Asignatura[] = [{ id: 'pacientes-especiales', nombre: 'Pacientes especiales', disponible: true }]

const ASIGNATURAS_EN: Asignatura[] = [{ id: 'pacientes-especiales', nombre: 'Special-Needs Patients', disponible: true }]

export function getAsignaturas(idioma: Idioma): Asignatura[] {
  return idioma === 'en' ? ASIGNATURAS_EN : ASIGNATURAS_ES
}

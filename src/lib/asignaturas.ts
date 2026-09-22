import { Stethoscope, Brain, SmilePlus, FlaskConical, Scale, Microscope, Briefcase, Dna, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { Idioma } from '@/lib/i18n'

export interface Asignatura {
  id: string
  // cursoId es la clave que usan lib/cursos.ts (CURSOS) y lib/data.ts
  // (BANCOS) — separado de `id` porque el id de una asignatura es un
  // concepto de UI (podría haber más de una asignatura sobre el mismo
  // curso el día de mañana) y no necesariamente coincide con el nombre del
  // curso/banco técnico.
  cursoId: string
  nombre: string
  disponible: boolean
}

/**
 * Asignaturas que se pueden examinar. Cada una necesita su propio banco de
 * preguntas (lib/data.ts) y su propio CursoMeta (lib/cursos.ts) bajo el
 * mismo cursoId. Para sumar una nueva: cargar su JSON en src/data/, registrar
 * el cursoId en ambos lugares, y agregarla acá con `disponible: true`.
 */
const ASIGNATURAS_ES: Asignatura[] = [
  { id: 'pacientes-especiales', cursoId: 'odontologia', nombre: 'Pacientes especiales', disponible: true },
  { id: 'psicologia', cursoId: 'psicologia', nombre: 'Psicología', disponible: true },
  { id: 'ortodoncia', cursoId: 'ortodoncia', nombre: 'Ortodoncia', disponible: true },
  { id: 'materiales', cursoId: 'materiales', nombre: 'Materiales Odontológicos', disponible: true },
  { id: 'forense', cursoId: 'forense', nombre: 'Odontología Legal y Forense', disponible: true },
  { id: 'patologia', cursoId: 'patologia', nombre: 'Patología Bucal', disponible: true },
  { id: 'gestion', cursoId: 'gestion', nombre: 'Gestión Odontológica', disponible: true },
  { id: 'bioquimica', cursoId: 'bioquimica', nombre: 'Bioquímica', disponible: true },
  { id: 'preventiva', cursoId: 'preventiva', nombre: 'Odontología Preventiva y Comunitaria', disponible: true },
]

const ASIGNATURAS_EN: Asignatura[] = [
  { id: 'pacientes-especiales', cursoId: 'odontologia', nombre: 'Special-Needs Patients', disponible: true },
  { id: 'psicologia', cursoId: 'psicologia', nombre: 'Psychology', disponible: true },
  { id: 'ortodoncia', cursoId: 'ortodoncia', nombre: 'Orthodontics', disponible: true },
  { id: 'materiales', cursoId: 'materiales', nombre: 'Dental Materials', disponible: true },
  { id: 'forense', cursoId: 'forense', nombre: 'Forensic and Legal Dentistry', disponible: true },
  { id: 'patologia', cursoId: 'patologia', nombre: 'Oral Pathology', disponible: true },
  { id: 'gestion', cursoId: 'gestion', nombre: 'Dental Practice Management', disponible: true },
  { id: 'bioquimica', cursoId: 'bioquimica', nombre: 'Biochemistry', disponible: true },
  { id: 'preventiva', cursoId: 'preventiva', nombre: 'Preventive and Community Dentistry', disponible: true },
]

export function getAsignaturas(idioma: Idioma): Asignatura[] {
  return idioma === 'en' ? ASIGNATURAS_EN : ASIGNATURAS_ES
}

// Ícono por curso, solo estético — Stethoscope para Odontología (el caso
// original), Brain para Psicología. Una asignatura nueva sin entrada acá cae
// en Stethoscope por defecto en vez de romper. Compartido entre
// ElegirAsignatura y Estadisticas para no duplicar el mapa.
export const ICONO_CURSO: Record<string, LucideIcon> = {
  odontologia: Stethoscope,
  psicologia: Brain,
  ortodoncia: SmilePlus,
  materiales: FlaskConical,
  forense: Scale,
  patologia: Microscope,
  gestion: Briefcase,
  bioquimica: Dna,
  preventiva: ShieldCheck,
}

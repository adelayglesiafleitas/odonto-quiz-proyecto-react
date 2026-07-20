export type CursoId = 'odontologia' | 'nacionalidad' | 'conducir'

export interface CursoMeta {
  id: CursoId
  duracionOficialMinutos: number
  cantidadOficial: number
  porcentajeAprobado: number
  tieneConvocatorias: boolean
  cantidadesDisponibles: number[]
  /** Si es false, el curso sigue existiendo (datos, historial, etc.) pero no se
   * muestra en la selección de pruebas. Úsalo para lanzar un único producto a
   * la vez sin borrar el trabajo ya hecho en los demás. */
  activo: boolean
}

export const CURSOS: CursoMeta[] = [
  {
    id: 'odontologia',
    duracionOficialMinutos: 40,
    cantidadOficial: 30,
    porcentajeAprobado: 70,
    // La mayoría del banco es temático (sin año real por pregunta -> anio=0,
    // que getAnios() excluye del selector). Desde jul-2026 sí incluye un
    // examen real fechado (convocatoria 2025, teórico + práctico con clave
    // oficial), así que el filtro de convocatoria vuelve a tener sentido:
    // solo aparecerá "2025" como opción seleccionable.
    tieneConvocatorias: true,
    cantidadesDisponibles: [10, 20, 30, 40],
    activo: true,
  },
  {
    id: 'nacionalidad',
    duracionOficialMinutos: 45,
    cantidadOficial: 25,
    porcentajeAprobado: 60,
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 15, 20, 25],
    activo: false,
  },
  {
    id: 'conducir',
    duracionOficialMinutos: 30,
    cantidadOficial: 30,
    porcentajeAprobado: 90,
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 20, 30],
    activo: false,
  },
]

export function getCursoMeta(id: string): CursoMeta {
  return CURSOS.find((c) => c.id === id) ?? CURSOS[0]
}

export function getCursosActivos(): CursoMeta[] {
  return CURSOS.filter((c) => c.activo)
}

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

export type CursoId = 'odontologia' | 'nacionalidad' | 'conducir'

export interface CursoMeta {
  id: CursoId
  duracionOficialMinutos: number
  cantidadOficial: number
  porcentajeAprobado: number
  tieneConvocatorias: boolean
  cantidadesDisponibles: number[]
}

export const CURSOS: CursoMeta[] = [
  {
    id: 'odontologia',
    duracionOficialMinutos: 40,
    cantidadOficial: 30,
    porcentajeAprobado: 70,
    tieneConvocatorias: true,
    cantidadesDisponibles: [10, 20, 30, 40],
  },
  {
    id: 'nacionalidad',
    duracionOficialMinutos: 45,
    cantidadOficial: 25,
    porcentajeAprobado: 60,
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 15, 20, 25],
  },
  {
    id: 'conducir',
    duracionOficialMinutos: 30,
    cantidadOficial: 30,
    porcentajeAprobado: 90,
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 20, 30],
  },
]

export function getCursoMeta(id: string): CursoMeta {
  return CURSOS.find((c) => c.id === id) ?? CURSOS[0]
}

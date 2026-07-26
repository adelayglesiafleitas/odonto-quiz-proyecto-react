export const CURSO_ID = 'odontologia'

export interface CursoMeta {
  duracionOficialMinutos: number
  cantidadOficial: number
  porcentajeAprobado: number
  tieneConvocatorias: boolean
  cantidadesDisponibles: number[]
}

export const CURSO: CursoMeta = {
  duracionOficialMinutos: 40,
  cantidadOficial: 30,
  porcentajeAprobado: 70,
  // El simulacro usa siempre todo el banco de preguntas (sin filtro por
  // convocatoria/año): se desactiva el selector de convocatoria.
  tieneConvocatorias: false,
  cantidadesDisponibles: [10, 20, 30, 40],
}

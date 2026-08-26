export interface CursoMeta {
  duracionOficialMinutos: number
  cantidadOficial: number
  porcentajeAprobado: number
  tieneConvocatorias: boolean
  cantidadesDisponibles: number[]
}

// Un CursoMeta por curso disponible (ver también lib/asignaturas.ts y
// lib/data.ts, que registran el banco de preguntas de cada uno). El flujo de
// examen real (ElegirAsignatura → ConfigurarExamen → Examen → Resultados) usa
// CURSOS[cursoId] con el curso que el usuario eligió.
export const CURSOS: Record<string, CursoMeta> = {
  odontologia: {
    duracionOficialMinutos: 40,
    cantidadOficial: 30,
    porcentajeAprobado: 70,
    // El simulacro usa siempre todo el banco de preguntas (sin filtro por
    // convocatoria/año): se desactiva el selector de convocatoria.
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 20, 30, 40],
  },
  psicologia: {
    // Mismos valores que odontología (mismo formato de examen de
    // homologación) — decisión del usuario al agregar esta asignatura
    // (2026-08-26), no un dato propio de Psicología verificado aparte.
    duracionOficialMinutos: 40,
    cantidadOficial: 30,
    porcentajeAprobado: 70,
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 20, 30, 40],
  },
}

// CURSO_ID/CURSO son el curso "por defecto": todavía los usan Home,
// Estadísticas, Ayuda y Estudio en App.tsx, que no son conscientes de
// multi-asignatura (siguen mostrando siempre Odontología). Ampliarlos a
// Psicología requeriría un selector de curso en esas pantallas — fuera de
// alcance por ahora (ver "Psicología: nueva asignatura" en el proyecto de
// Claude).
export const CURSO_ID = 'odontologia'
export const CURSO: CursoMeta = CURSOS[CURSO_ID]

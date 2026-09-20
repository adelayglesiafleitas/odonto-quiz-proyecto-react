export interface CursoMeta {
  duracionOficialMinutos: number
  cantidadOficial: number
  porcentajeAprobado: number
  tieneConvocatorias: boolean
  cantidadesDisponibles: number[]
  // true si este curso tiene (además de los exámenes normales) preguntas
  // cargadas desde uno o más libros de texto — habilita el selector de
  // Fuente (Exámenes/Libro) en ConfigurarExamen.tsx. false en todos los
  // cursos que todavía no tienen ningún libro cargado.
  tieneLibros: boolean
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
    tieneLibros: true,
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
    tieneLibros: false,
  },
  ortodoncia: {
    // Mismos valores que odontología/psicología (mismo formato de examen de
    // homologación) — decisión del usuario al agregar esta asignatura
    // (2026-08-27), no un dato propio de Ortodoncia verificado aparte.
    duracionOficialMinutos: 40,
    cantidadOficial: 30,
    porcentajeAprobado: 70,
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 20, 30, 40],
    tieneLibros: false,
  },
  materiales: {
    // Mismos valores que odontología/psicología/ortodoncia (mismo formato de
    // examen de homologación) — decisión del usuario al agregar esta
    // asignatura (2026-09-07), no un dato propio de Materiales Odontológicos
    // verificado aparte. tieneConvocatorias queda en false como en el resto
    // de asignaturas, aunque el anio sí varía en el banco (igual que en
    // odontología/psicología, donde también varía y el selector está
    // desactivado).
    duracionOficialMinutos: 40,
    cantidadOficial: 30,
    porcentajeAprobado: 70,
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 20, 30, 40],
    tieneLibros: false,
  },
  forense: {
    // Mismos valores que el resto de asignaturas (mismo formato de examen de
    // homologación) — decisión del usuario al agregar esta asignatura
    // (2026-09-20), no un dato propio de Odontología Legal y Forense
    // verificado aparte. Banco: curso_id 'forense' en la tabla preguntas.
    duracionOficialMinutos: 40,
    cantidadOficial: 30,
    porcentajeAprobado: 70,
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 20, 30, 40],
    tieneLibros: false,
  },
  patologia: {
    // Mismos valores que el resto de asignaturas (mismo formato de examen de
    // homologación) — decisión del usuario al agregar esta asignatura
    // (2026-09-20), no un dato propio de Patología Bucal verificado aparte.
    // Banco: curso_id 'patologia' en la tabla preguntas (525 preguntas).
    duracionOficialMinutos: 40,
    cantidadOficial: 30,
    porcentajeAprobado: 70,
    tieneConvocatorias: false,
    cantidadesDisponibles: [10, 20, 30, 40],
    tieneLibros: false,
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

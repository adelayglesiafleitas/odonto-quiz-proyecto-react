// src/lib/academiaProgresoLocal.ts
//
// Progreso de Academia (Capítulo 1 de Inmaculada): la fuente de verdad pasó
// a ser Supabase (ver academiaProgresoRemoto.ts) porque localStorage es por
// dispositivo/navegador, no por cuenta, y eso mezclaba el progreso de dos
// cuentas usadas en el mismo celular. Lo que queda acá (tipos, estado
// inicial, cálculo del resumen) se sigue usando igual porque `progreso` en
// memoria mantiene la misma forma ProgresoCap1 venga de donde venga; las
// funciones de lectura/escritura de localStorage (`cargarProgresoAcademia`,
// `guardarAcademia`, `borrarProgresoAcademiaLocal`) solo se usan hoy para
// migrar una vez el progreso viejo de quien ya lo tenía guardado en este
// dispositivo de antes de este cambio — ver Academia.tsx.
//
// Ver claude/restablecer-estadisticas-academia-estadisticas-diseno.md y
// claude/academia-progreso-supabase-diseno.md.

import { NODOS_CAP1 } from '@/data/academiaInmaculada'
import { TEMAS_TOTAL_CAP1, calcularPuntuacion } from './academiaPuntuacion'

export { TEMAS_TOTAL_CAP1 }

export type EstadoNodo = 'bloqueado' | 'disponible' | 'completado'

/** Una pregunta fallada, guardada para repasarla más adelante. */
export interface ErrorAcademia {
  /** `${pruebaId}:${índice en el pool}`, ej. "prueba1:3" o "pruebaFinal:0". */
  preguntaId: string
  /** ISO 8601 de la última vez que se falló. */
  fecha: string
  /** Cuántas veces se falló esta pregunta en total (2026-09-23). Registros viejos sin este campo cuentan como 1. */
  veces?: number
}

export interface ProgresoNodo {
  estado: EstadoNodo
  /**
   * Intentos que hicieron falta la PRIMERA vez que se respondió cada pregunta
   * de la prueba final (una entrada por pregunta, en orden). Se fija una sola
   * vez y no se sobrescribe: repetir la lección es práctica y no cambia la
   * nota. Ver academiaPuntuacion.ts.
   */
  intentosPreguntas?: number[]
  /**
   * Preguntas falladas en este nodo (video: las preguntas de las pausas;
   * pruebaFinal: sus 3 preguntas). Una entrada por `preguntaId`, con `veces`.
   */
  errores?: ErrorAcademia[]
  /**
   * Solo nodo `video` (rediseño 2026-09-23, un solo video con pausas):
   * cuántas pausas de prueba intermedia ya se aprobaron. Al volver a entrar,
   * el video retoma desde la última pausa aprobada.
   */
  pausasSuperadas?: number
  /**
   * Solo nodo `video`: true si el usuario llegó a la próxima pausa pendiente
   * pero salió sin acertar la pregunta. Al volver, el video se coloca en esa
   * pausa y la pregunta sale directamente (no hay que ver el tramo otra vez).
   */
  enPausa?: boolean
  /** @deprecated Marca vieja de una sola pregunta (antes de 2026-09-19). Ya no puntúa; se conserva solo para no romper progreso guardado. */
  intentos?: number
}

export type ProgresoCap1 = Record<string, ProgresoNodo>

export const CLAVE_PROGRESO_ACADEMIA = 'academia_progreso_inmaculada_cap1_v1'
// Clave vieja de localStorage (rediseño 2026-09-16: cada prueba pasó a
// mostrar 1 sola pregunta al azar en vez de un set fijo, así que dejó de
// tener sentido persistir "qué opción se eligió" por pregunta). Se sigue
// borrando acá para limpiar el localStorage de quien ya la tenía guardada
// de una versión anterior — nada más la escribe ni la lee.
const CLAVE_RESPUESTAS_ACADEMIA_VIEJA = 'academia_respuestas_inmaculada_cap1_v1'

// Rediseño 2026-09-17: prueba1/prueba2 dejaron de ser nodos propios (ver
// NODOS_CAP1 en academiaInmaculada.ts) — ahora son una ventana modal dentro
// de video1/video2, así que ya no tienen su propia entrada de progreso acá.
// Un `progreso` remoto viejo que todavía tenga esas claves no rompe nada:
// simplemente quedan como llaves sueltas sin uso, ya que todo lo que lee
// este objeto (calcularResumenAcademia, cap1Completo, etc.) solo mira los
// ids presentes en NODOS_CAP1.
export function progresoInicialAcademia(): ProgresoCap1 {
  return {
    intro: { estado: 'disponible' },
    video: { estado: 'bloqueado' },
    pruebaFinal: { estado: 'bloqueado' },
  }
}

/**
 * Rediseño 2026-09-23: los nodos video1/video2/video3 pasaron a ser uno solo
 * (`video`). Adapta un progreso guardado con la forma vieja para que nadie
 * quede trabado:
 * - quien ya tenía la prueba final disponible o completada (vio los 3
 *   videos viejos) queda con `video` completado;
 * - quien había pasado la intro queda con `video` disponible.
 * Las claves viejas (video1/2/3) se dejan tal cual: nada las lee.
 */
export function normalizarProgresoAcademia(progreso: ProgresoCap1): ProgresoCap1 {
  const p: ProgresoCap1 = { ...progresoInicialAcademia(), ...progreso }
  if (p.video.estado !== 'completado') {
    const finalAbierta = p.pruebaFinal.estado !== 'bloqueado'
    const videoViejoVisto = progreso.video3?.estado === 'completado'
    if (finalAbierta || videoViejoVisto) {
      p.video = { ...p.video, estado: 'completado' }
      if (p.pruebaFinal.estado === 'bloqueado') p.pruebaFinal = { ...p.pruebaFinal, estado: 'disponible' }
    } else if (p.video.estado === 'bloqueado' && p.intro.estado === 'completado') {
      p.video = { ...p.video, estado: 'disponible' }
    }
  }
  return p
}

export function cargarProgresoAcademia(): ProgresoCap1 {
  try {
    const guardado = localStorage.getItem(CLAVE_PROGRESO_ACADEMIA)
    if (guardado) return normalizarProgresoAcademia(JSON.parse(guardado) as ProgresoCap1)
  } catch {
    // localStorage no disponible (modo privado, etc.): seguimos con el estado inicial.
  }
  return progresoInicialAcademia()
}

export function guardarAcademia(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // ignorar — el progreso simplemente no persiste esta sesión.
  }
}

// Usado por "Restablecer estadísticas" en Configuracion.tsx. Solo borra este
// dispositivo — a propósito no hay forma de que esto viaje a otro, porque el
// progreso nunca se guardó del lado del servidor.
export function borrarProgresoAcademiaLocal() {
  try {
    localStorage.removeItem(CLAVE_PROGRESO_ACADEMIA)
    localStorage.removeItem(CLAVE_RESPUESTAS_ACADEMIA_VIEJA)
  } catch {
    // ignorar
  }
}

export interface ResumenAcademia {
  temasCompletados: number
  temasTotal: number
  empezado: boolean
  /** % real del capítulo (0-100), ver porcentajeCap1. */
  porcentaje: number
  /** Nota total sobre 100 (ver academiaPuntuacion.ts). */
  nota: number
  estrellas: number
  estrellasMax: number
}

// Corrección 2026-09-19: los nodos de NODOS_CAP1 (intro, 3 videos, prueba
// final) son todos del tema Parálisis Cerebral. Epilepsia y Distrofia
// Muscular todavía no tienen contenido, así que terminar la ruta actual
// mostraba 100% del capítulo cuando en realidad es solo 1 de sus 3 temas.
// Ahora el porcentaje del capítulo = (nodos completados / nodos de la ruta)
// repartido entre los 3 temas del capítulo. Cuando se carguen los otros
// temas, sumar su progreso acá.
export function porcentajeCap1(progreso: ProgresoCap1): number {
  if (NODOS_CAP1.length === 0) return 0
  const completados = NODOS_CAP1.filter((n) => progreso[n.id]?.estado === 'completado').length
  return (completados / NODOS_CAP1.length / TEMAS_TOTAL_CAP1) * 100
}

// Usado por la sección "Academia" de Estadisticas.tsx: reduce el progreso
// crudo de localStorage a los pocos números que esa tarjeta necesita
// mostrar, en vez de que la pantalla tenga que conocer la forma de
// ProgresoCap1 o los ids de los nodos.
export function calcularResumenAcademia(progreso: ProgresoCap1): ResumenAcademia {
  const puntuacion = calcularPuntuacion(progreso)
  const temasCompletados = NODOS_CAP1.filter((n) => progreso[n.id]?.estado === 'completado').length

  return {
    temasCompletados,
    temasTotal: NODOS_CAP1.length,
    empezado: temasCompletados > 0,
    porcentaje: Math.round(porcentajeCap1(progreso)),
    nota: puntuacion.notaTotal,
    estrellas: puntuacion.estrellas,
    estrellasMax: puntuacion.estrellasMax,
  }
}

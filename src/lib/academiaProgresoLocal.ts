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

export type EstadoNodo = 'bloqueado' | 'disponible' | 'completado'

export interface ProgresoNodo {
  estado: EstadoNodo
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
    video1: { estado: 'bloqueado' },
    video2: { estado: 'bloqueado' },
    video3: { estado: 'bloqueado' },
    pruebaFinal: { estado: 'bloqueado' },
  }
}

export function cargarProgresoAcademia(): ProgresoCap1 {
  try {
    const guardado = localStorage.getItem(CLAVE_PROGRESO_ACADEMIA)
    if (guardado) return { ...progresoInicialAcademia(), ...(JSON.parse(guardado) as ProgresoCap1) }
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
}

// Usado por la sección "Academia" de Estadisticas.tsx: reduce el progreso
// crudo de localStorage a los pocos números que esa tarjeta necesita
// mostrar, en vez de que la pantalla tenga que conocer la forma de
// ProgresoCap1 o los ids de los nodos.
export function calcularResumenAcademia(progreso: ProgresoCap1): ResumenAcademia {
  const temasCompletados = NODOS_CAP1.filter((n) => progreso[n.id]?.estado === 'completado').length

  return {
    temasCompletados,
    temasTotal: NODOS_CAP1.length,
    empezado: temasCompletados > 0,
  }
}

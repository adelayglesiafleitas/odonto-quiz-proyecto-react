// src/lib/academiaProgresoLocal.ts
//
// Progreso de Academia (Capítulo 1 de Inmaculada), guardado únicamente en
// `localStorage` — nunca se mandó a Supabase, así que es información propia
// de este dispositivo, no de la cuenta. Antes vivía como funciones privadas
// adentro de Academia.tsx; se movió acá para poder leerlo también desde
// Estadisticas.tsx (sección "Academia") y borrarlo desde Configuracion.tsx
// ("Restablecer estadísticas") sin duplicar el parseo en cada pantalla.
//
// Ver claude/restablecer-estadisticas-academia-estadisticas-diseno.md para
// el diseño completo de ambas pantallas.

import { NODOS_CAP1 } from '@/data/academiaInmaculada'

export type EstadoNodo = 'bloqueado' | 'disponible' | 'completado'

export interface ProgresoNodo {
  estado: EstadoNodo
  estrellas?: number
}

export type ProgresoCap1 = Record<string, ProgresoNodo>

export const CLAVE_PROGRESO_ACADEMIA = 'academia_progreso_inmaculada_cap1_v1'
export const CLAVE_RESPUESTAS_ACADEMIA = 'academia_respuestas_inmaculada_cap1_v1'

// Máximo de estrellas posibles por nodo con quiz (ver BloqueQuiz en
// Academia.tsx): 3 por nodo. "intro" no tiene quiz, así que no suma acá.
const ESTRELLAS_MAX_POR_NODO = 3

export function progresoInicialAcademia(): ProgresoCap1 {
  return {
    intro: { estado: 'disponible' },
    pc: { estado: 'bloqueado' },
    epi: { estado: 'bloqueado' },
    dm: { estado: 'bloqueado' },
    repaso: { estado: 'bloqueado' },
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

export function cargarRespuestasAcademia(): Record<string, number> {
  try {
    const guardado = localStorage.getItem(CLAVE_RESPUESTAS_ACADEMIA)
    if (guardado) return JSON.parse(guardado) as Record<string, number>
  } catch {
    // ignorar
  }
  return {}
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
    localStorage.removeItem(CLAVE_RESPUESTAS_ACADEMIA)
  } catch {
    // ignorar
  }
}

export interface ResumenAcademia {
  temasCompletados: number
  temasTotal: number
  estrellas: number
  estrellasMax: number
  empezado: boolean
}

// Usado por la sección "Academia" de Estadisticas.tsx: reduce el progreso
// crudo de localStorage a los pocos números que esa tarjeta necesita
// mostrar, en vez de que la pantalla tenga que conocer la forma de
// ProgresoCap1 o los ids de los nodos.
export function calcularResumenAcademia(progreso: ProgresoCap1): ResumenAcademia {
  const nodosConQuiz = NODOS_CAP1.filter((n) => n.tipo !== 'intro')
  const temasCompletados = NODOS_CAP1.filter((n) => progreso[n.id]?.estado === 'completado').length
  const estrellas = nodosConQuiz.reduce((total, n) => total + (progreso[n.id]?.estrellas ?? 0), 0)

  return {
    temasCompletados,
    temasTotal: NODOS_CAP1.length,
    estrellas,
    estrellasMax: nodosConQuiz.length * ESTRELLAS_MAX_POR_NODO,
    empezado: temasCompletados > 0,
  }
}

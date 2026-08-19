import { supabase } from './supabase'
import type { ConteoCapitulo, IntentoExamen } from '../types'

interface FilaHistorial {
  curso_id: string
  fecha: string
  total_preguntas: number
  correctas: number
  porcentaje: number
  aprobado: boolean
  capitulo: string
  anio: number | null
  tiempo_limite_minutos: number | null
  tiempo_usado_seg: number
  agoto_tiempo: boolean
  desglose_capitulos: Record<string, ConteoCapitulo> | null
}

function filaAIntento(fila: FilaHistorial): IntentoExamen {
  return {
    cursoId: fila.curso_id,
    fecha: fila.fecha,
    totalPreguntas: fila.total_preguntas,
    correctas: fila.correctas,
    porcentaje: fila.porcentaje,
    aprobado: fila.aprobado,
    capitulo: fila.capitulo,
    anio: fila.anio ?? 'todos',
    tiempoLimiteMinutos: fila.tiempo_limite_minutos,
    tiempoUsadoSeg: fila.tiempo_usado_seg,
    agotoTiempo: fila.agoto_tiempo,
    desgloseCapitulos: fila.desglose_capitulos ?? {},
  }
}

const HISTORIAL_MAX = 30

export async function getHistorialRemoto(userId: string, cursoId?: string): Promise<IntentoExamen[]> {
  let consulta = supabase
    .from('historial_intentos')
    .select(
      'curso_id, fecha, total_preguntas, correctas, porcentaje, aprobado, capitulo, anio, tiempo_limite_minutos, tiempo_usado_seg, agoto_tiempo, desglose_capitulos',
    )
    .eq('user_id', userId)
    .order('fecha', { ascending: false })
    .limit(HISTORIAL_MAX)

  if (cursoId) consulta = consulta.eq('curso_id', cursoId)

  const { data, error } = await consulta
  if (error) {
    console.error('Error al leer el historial:', error.message)
    return []
  }
  return (data ?? []).map(filaAIntento)
}

export async function guardarIntentoRemoto(userId: string, intento: IntentoExamen): Promise<void> {
  const { error } = await supabase.from('historial_intentos').insert({
    user_id: userId,
    curso_id: intento.cursoId,
    fecha: intento.fecha,
    total_preguntas: intento.totalPreguntas,
    correctas: intento.correctas,
    porcentaje: intento.porcentaje,
    aprobado: intento.aprobado,
    capitulo: intento.capitulo,
    anio: intento.anio === 'todos' ? null : intento.anio,
    tiempo_limite_minutos: intento.tiempoLimiteMinutos,
    tiempo_usado_seg: intento.tiempoUsadoSeg,
    agoto_tiempo: intento.agotoTiempo,
    desglose_capitulos: intento.desgloseCapitulos,
  })
  if (error) console.error('Error al guardar el intento:', error.message)
}

export interface EstadisticaCapitulo {
  capitulo: string
  correctas: number
  total: number
}

// Trae el desglose por capítulo ya sumado del lado del servidor (función
// obtener_estadisticas_capitulos en supabase/schema.sql), en vez de traer
// todo el historial al navegador y sumar acá: la suma cuesta lo mismo sin
// importar cuántos usuarios totales tenga la tabla, porque el servidor solo
// toca las filas de este usuario (auth.uid()) gracias al índice existente.
export async function getEstadisticasCapitulos(cursoId: string, limite = HISTORIAL_MAX): Promise<EstadisticaCapitulo[]> {
  const { data, error } = await supabase.rpc('obtener_estadisticas_capitulos', {
    p_curso_id: cursoId,
    p_limite: limite,
  })
  if (error) {
    console.error('Error al leer las estadísticas por capítulo:', error.message)
    return []
  }
  return (data ?? []) as EstadisticaCapitulo[]
}

const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

export interface ActividadDia {
  etiqueta: string
  cantidad: number
  esHoy: boolean
}

// Cuenta intentos por día para los últimos 7 días (incluyendo hoy), a
// partir de las mismas fechas que ya se piden para la racha (getFechasIntentos):
// no agrega ninguna consulta nueva a Supabase.
export function calcularActividadSemanal(fechas: string[]): ActividadDia[] {
  const hoy = new Date()
  const claveDia = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  const conteos = new Map<string, number>()
  for (const f of fechas) {
    const clave = claveDia(new Date(f))
    conteos.set(clave, (conteos.get(clave) ?? 0) + 1)
  }

  const dias: ActividadDia[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy)
    d.setDate(d.getDate() - i)
    dias.push({
      etiqueta: DIAS_SEMANA[d.getDay()],
      cantidad: conteos.get(claveDia(d)) ?? 0,
      esHoy: i === 0,
    })
  }
  return dias
}

// Se deriva del historial ya cargado en vez de volver a consultar Supabase:
// antes getPromedioRemoto pedía su propia copia del historial (hasta 30 filas)
// aunque quien la llamaba ya tuviera ese mismo historial en memoria, lo que
// duplicaba la lectura en pantallas como Home. Calcularlo aquí es gratis.
export function calcularPromedio(historial: IntentoExamen[]): number {
  if (historial.length === 0) return 0
  const suma = historial.reduce((acc, i) => acc + i.porcentaje, 0)
  return Math.round(suma / historial.length)
}

// Consulta liviana (solo la fecha) y con un límite más alto que
// HISTORIAL_MAX, para que una racha larga de un usuario muy activo no se
// corte por el límite pensado para el cálculo de promedio/mejor puntaje.
const RACHA_MAX = 90

export async function getFechasIntentos(userId: string, cursoId?: string): Promise<string[]> {
  let consulta = supabase
    .from('historial_intentos')
    .select('fecha')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })
    .limit(RACHA_MAX)

  if (cursoId) consulta = consulta.eq('curso_id', cursoId)

  const { data, error } = await consulta
  if (error) {
    console.error('Error al leer las fechas de intentos:', error.message)
    return []
  }
  return (data ?? []).map((fila) => fila.fecha as string)
}

// Días consecutivos con al menos un simulacro completado, contando hacia
// atrás desde hoy en la zona horaria del navegador. Si todavía no se
// practicó hoy, se cuenta desde ayer para no "romper" la racha antes de que
// el usuario haya tenido chance de practicar en el día.
export function calcularRacha(fechas: string[]): number {
  if (fechas.length === 0) return 0

  const clave = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  const dias = new Set(fechas.map((f) => clave(new Date(f))))

  const cursor = new Date()
  if (!dias.has(clave(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let racha = 0
  while (dias.has(clave(cursor))) {
    racha++
    cursor.setDate(cursor.getDate() - 1)
  }
  return racha
}

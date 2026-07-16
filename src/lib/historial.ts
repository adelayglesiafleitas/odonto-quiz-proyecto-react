import { supabase } from './supabase'
import type { IntentoExamen } from '../types'

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
  }
}

const HISTORIAL_MAX = 30

export async function getHistorialRemoto(userId: string, cursoId?: string): Promise<IntentoExamen[]> {
  let consulta = supabase
    .from('historial_intentos')
    .select('curso_id, fecha, total_preguntas, correctas, porcentaje, aprobado, capitulo, anio, tiempo_limite_minutos, tiempo_usado_seg, agoto_tiempo')
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
  })
  if (error) console.error('Error al guardar el intento:', error.message)
}

export async function getPromedioRemoto(userId: string, cursoId?: string): Promise<number> {
  const historial = await getHistorialRemoto(userId, cursoId)
  if (historial.length === 0) return 0
  const suma = historial.reduce((acc, i) => acc + i.porcentaje, 0)
  return Math.round(suma / historial.length)
}

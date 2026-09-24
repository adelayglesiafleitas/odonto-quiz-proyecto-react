// src/lib/comunidadContador.ts
// Números de la comunidad para la Home: cuántos estudiantes hay registrados y
// cuántos hicieron al menos un simulacro en las últimas 24 h. auth.users no se
// puede leer desde el cliente, así que sale de la función `app_contador_comunidad`
// (security definer, solo devuelve los dos totales, nunca datos de usuarios).
import { supabase } from './supabase'

export type ContadorComunidad = { total: number; activosHoy: number }

export async function getContadorComunidad(): Promise<ContadorComunidad | null> {
  const { data, error } = await supabase.rpc('app_contador_comunidad')
  if (error || !data) return null
  const fila = Array.isArray(data) ? data[0] : data
  if (!fila) return null
  return { total: Number(fila.total) || 0, activosHoy: Number(fila.activos_hoy) || 0 }
}

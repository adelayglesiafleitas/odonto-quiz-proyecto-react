// src/lib/academiaProgresoRemoto.ts
//
// Progreso de Academia persistido en Supabase (tabla `academia_progreso`,
// migración crear_tabla_academia_progreso), no en localStorage: antes vivía
// solo en el dispositivo/navegador, lo que mezclaba el progreso de dos
// cuentas distintas usadas en el mismo celular. Mismo patrón de RLS que
// config_examen/historial_intentos — cada usuario solo puede leer/escribir
// sus propias filas (auth.uid() = user_id), admins pueden leer todas (no
// escribir). Ver claude/academia-progreso-supabase-diseno.md.
//
// curso_id separa el progreso por "curso" de Academia dentro de la tabla
// (hoy solo hay uno: el Capítulo 1 de Inmaculada) para poder sumar más
// libros/capítulos con seguimiento propio más adelante sin cambiar el
// esquema — no tiene relación con el curso_id de historial_intentos/
// config_examen (asignaturas de Simulacro/Estudio).

import { supabase } from './supabase'
import type { ProgresoCap1 } from './academiaProgresoLocal'

const CURSO_ACADEMIA = 'inmaculada_cap1'

export async function getProgresoAcademiaRemoto(userId: string): Promise<ProgresoCap1 | null> {
  const { data, error } = await supabase
    .from('academia_progreso')
    .select('progreso')
    .eq('user_id', userId)
    .eq('curso_id', CURSO_ACADEMIA)
    .maybeSingle()

  if (error) {
    console.error('Error al leer el progreso de Academia:', error.message)
    return null
  }
  return (data?.progreso as ProgresoCap1 | null) ?? null
}

// upsert (no insert/update por separado) porque la primera vez que este
// usuario guarda progreso todavía no existe la fila — mismo patrón que
// guardarConfigExamen. onConflict apunta a la primary key compuesta
// (user_id, curso_id) de la tabla.
export async function guardarProgresoAcademiaRemoto(userId: string, progreso: ProgresoCap1): Promise<void> {
  const { error } = await supabase.from('academia_progreso').upsert(
    {
      user_id: userId,
      curso_id: CURSO_ACADEMIA,
      progreso,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'user_id,curso_id' },
  )
  if (error) console.error('Error al guardar el progreso de Academia:', error.message)
}

// Usado por "Restablecer estadísticas" en Configuracion.tsx. Requiere la
// policy de DELETE "Los usuarios eliminan su propio progreso de Academia" —
// sin ella RLS deniega por defecto y esto no borra nada, sin siquiera
// devolver error (mismo caso que eliminarHistorialPropio en historial.ts).
export async function borrarProgresoAcademiaRemoto(userId: string): Promise<{ ok: boolean }> {
  const { error } = await supabase
    .from('academia_progreso')
    .delete()
    .eq('user_id', userId)
    .eq('curso_id', CURSO_ACADEMIA)
  if (error) {
    console.error('Error al restablecer el progreso de Academia:', error.message)
    return { ok: false }
  }
  return { ok: true }
}

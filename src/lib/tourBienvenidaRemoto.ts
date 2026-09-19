// src/lib/tourBienvenidaRemoto.ts
//
// Lectura/escritura del flag remoto "vio_tour_bienvenida", en una tabla
// nueva `perfiles` (no existía antes en el esquema del proyecto — se crea
// en supabase/schema.sql, sección 9). Como no hay una fila creada de
// antemano por usuario (no hay trigger de alta en el signup),
// marcarTourBienvenidaVisto hace upsert en vez de update: la primera vez
// que alguien cierra el tour se crea su fila, en vez de intentar
// actualizar una que todavía no existe.

import { supabase } from './supabase';

// userId como parámetro en vez de un supabase.auth.getUser() propio (que
// revalida contra el servidor en cada llamada, a diferencia de la sesión ya
// resuelta en App.tsx) — mismo criterio que academiaAccesoRemoto.ts.
export async function getVioTourBienvenida(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('vio_tour_bienvenida')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return false;
  return Boolean(data.vio_tour_bienvenida);
}

export async function marcarTourBienvenidaVisto(userId: string): Promise<void> {
  await supabase
    .from('perfiles')
    .upsert({ user_id: userId, vio_tour_bienvenida: true }, { onConflict: 'user_id' });
}

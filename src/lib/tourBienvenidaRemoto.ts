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

export async function getVioTourBienvenida(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('perfiles')
    .select('vio_tour_bienvenida')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return false;
  return Boolean(data.vio_tour_bienvenida);
}

export async function marcarTourBienvenidaVisto(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('perfiles')
    .upsert({ user_id: user.id, vio_tour_bienvenida: true }, { onConflict: 'user_id' });
}

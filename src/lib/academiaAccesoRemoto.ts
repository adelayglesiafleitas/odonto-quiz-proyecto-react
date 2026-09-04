// src/lib/academiaAccesoRemoto.ts
//
// Lectura del flag remoto "academia_habilitada", en la misma tabla
// `perfiles` que ya guarda `vio_tour_bienvenida` (ver tourBienvenidaRemoto.ts,
// mismo patrón). Es de solo lectura del lado del cliente a propósito: el
// valor lo escribe únicamente un admin desde odonto-quiz-admin
// (Usuarios.tsx) — no hay, ni debería haber, una función acá para que el
// propio usuario se autohabilite. La base también lo hace cumplir: un
// trigger en `perfiles` (migración `proteger_academia_habilitada_solo_admin`)
// revierte cualquier cambio a esta columna que no venga de un admin, aunque
// alguien intente escribirla directo contra la API de Supabase.
//
// Ver claude/academia-control-acceso-admin-diseno.md para el diseño completo.

import { supabase } from './supabase';

export async function getAcademiaHabilitada(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('perfiles')
    .select('academia_habilitada')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return false;
  return Boolean(data.academia_habilitada);
}

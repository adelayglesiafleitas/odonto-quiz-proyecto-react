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

// Recibe `userId` en vez de resolverlo acá con supabase.auth.getUser(): a
// diferencia de getSession() (que lee de la sesión ya guardada en memoria),
// getUser() revalida contra el servidor de Auth en cada llamada — todo
// llamador de esta función ya tiene el userId de la sesión resuelta en
// App.tsx, así que pedirlo de nuevo acá solo suma una ida y vuelta de red
// redundante (más notorio en mobile). Mismo criterio que ya usan
// historial.ts, tickets.ts y configExamen.ts.
export async function getAcademiaHabilitada(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('academia_habilitada')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return false;
  return Boolean(data.academia_habilitada);
}

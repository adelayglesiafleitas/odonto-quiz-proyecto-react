// src/lib/fuenteLibroAccesoRemoto.ts
//
// Lectura del flag remoto "libro_pacientes_especiales_habilitado", en la
// misma tabla `perfiles` que ya guarda `academia_habilitada` (mismo patrón,
// ver academiaAccesoRemoto.ts). Es de solo lectura del lado del cliente a
// propósito: el valor lo escribe únicamente un admin — la base lo hace
// cumplir con un trigger en `perfiles`
// (trg_proteger_libro_pacientes_especiales_habilitado, migración
// agregar_libro_pacientes_especiales_habilitado) que revierte cualquier
// cambio a esta columna que no venga de un admin.
//
// Controla si aparece el selector de Fuente "Libro" (elegir capítulo por
// capítulo del libro, en vez de sumarlo entero desde Fuente Exámenes) en
// ConfigurarExamen.tsx — reservado para una futura versión de pago.
// Mientras no haya un toggle para esto en odonto-quiz-admin, se activa a
// mano con SQL directo sobre `perfiles`.

import { supabase } from './supabase';

// userId como parámetro en vez de un supabase.auth.getUser() propio (que
// revalida contra el servidor en cada llamada, a diferencia de la sesión ya
// resuelta en App.tsx) — mismo criterio que academiaAccesoRemoto.ts.
export async function getLibroPacientesEspecialesHabilitado(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('libro_pacientes_especiales_habilitado')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return false;
  return Boolean(data.libro_pacientes_especiales_habilitado);
}

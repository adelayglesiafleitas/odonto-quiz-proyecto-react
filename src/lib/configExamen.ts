import { supabase } from './supabase'

export interface ConfigExamenGuardada {
  cantidad: number
  capitulo: string
  anio: number | 'todos'
  conTiempo: boolean
  duracion: number
}

interface FilaConfig {
  cantidad: number
  capitulo: string
  anio: number | null
  con_tiempo: boolean
  duracion: number
}

function configDefault(cantidad: number, duracion: number): ConfigExamenGuardada {
  return { cantidad, capitulo: 'todos', anio: 'todos', conTiempo: false, duracion }
}

export async function getConfigExamenRemota(
  userId: string,
  cursoId: string,
  cantidadDefault: number,
  duracionDefault: number,
): Promise<ConfigExamenGuardada> {
  const { data, error } = await supabase
    .from('config_examen')
    .select('cantidad, capitulo, anio, con_tiempo, duracion')
    .eq('user_id', userId)
    .eq('curso_id', cursoId)
    .maybeSingle<FilaConfig>()

  if (error) {
    console.error('Error al leer la configuración guardada:', error.message)
    return configDefault(cantidadDefault, duracionDefault)
  }
  if (!data) return configDefault(cantidadDefault, duracionDefault)

  return {
    cantidad: data.cantidad,
    capitulo: data.capitulo,
    anio: data.anio ?? 'todos',
    conTiempo: data.con_tiempo,
    duracion: data.duracion,
  }
}

export async function guardarConfigExamenRemota(
  userId: string,
  cursoId: string,
  config: ConfigExamenGuardada,
): Promise<void> {
  const { error } = await supabase.from('config_examen').upsert(
    {
      user_id: userId,
      curso_id: cursoId,
      cantidad: config.cantidad,
      capitulo: config.capitulo,
      anio: config.anio === 'todos' ? null : config.anio,
      con_tiempo: config.conTiempo,
      duracion: config.duracion,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'user_id,curso_id' },
  )
  if (error) console.error('Error al guardar la configuración:', error.message)
}

import { getCookie, getCookieJSON, setCookie, setCookieJSON } from './cookies'

export type Tema = 'dark' | 'light'
export type Idioma = 'es' | 'en'

const TEMA_COOKIE = 'examprep_tema'
const IDIOMA_COOKIE = 'examprep_idioma'
const CONFIG_EXAMEN_COOKIE_PREFIJO = 'examprep_config_examen_'

export function getTemaGuardado(): Tema {
  const valor = getCookie(TEMA_COOKIE)
  return valor === 'light' ? 'light' : 'dark'
}

export function guardarTema(tema: Tema) {
  setCookie(TEMA_COOKIE, tema)
}

export function getIdiomaGuardado(): Idioma {
  const valor = getCookie(IDIOMA_COOKIE)
  return valor === 'en' ? 'en' : 'es'
}

export function guardarIdioma(idioma: Idioma) {
  setCookie(IDIOMA_COOKIE, idioma)
}

export interface ConfigExamenGuardada {
  cantidad: number
  capitulo: string
  anio: number | 'todos'
  conTiempo: boolean
  duracion: number
}

function configExamenDefault(cantidad: number, duracion: number): ConfigExamenGuardada {
  return {
    cantidad,
    capitulo: 'todos',
    anio: 'todos',
    conTiempo: false,
    duracion,
  }
}

export function getConfigExamenGuardada(
  cursoId: string,
  cantidadDefault: number,
  duracionDefault: number,
): ConfigExamenGuardada {
  return getCookieJSON<ConfigExamenGuardada>(
    CONFIG_EXAMEN_COOKIE_PREFIJO + cursoId,
    configExamenDefault(cantidadDefault, duracionDefault),
  )
}

export function guardarConfigExamen(cursoId: string, config: ConfigExamenGuardada) {
  setCookieJSON(CONFIG_EXAMEN_COOKIE_PREFIJO + cursoId, config)
}

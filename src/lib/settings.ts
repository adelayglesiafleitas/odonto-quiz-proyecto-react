import { getCookie, getCookieJSON, setCookie, setCookieJSON } from './cookies'

export type Tema = 'dark' | 'light'
export type Idioma = 'es' | 'en'

const TEMA_COOKIE = 'odontoprep_tema'
const IDIOMA_COOKIE = 'odontoprep_idioma'
const CONFIG_EXAMEN_COOKIE = 'odontoprep_config_examen'

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
  conTiempo: boolean
  duracion: number
}

const CONFIG_EXAMEN_DEFAULT: ConfigExamenGuardada = {
  cantidad: 30,
  capitulo: 'todos',
  conTiempo: false,
  duracion: 30,
}

export function getConfigExamenGuardada(): ConfigExamenGuardada {
  return getCookieJSON<ConfigExamenGuardada>(CONFIG_EXAMEN_COOKIE, CONFIG_EXAMEN_DEFAULT)
}

export function guardarConfigExamen(config: ConfigExamenGuardada) {
  setCookieJSON(CONFIG_EXAMEN_COOKIE, config)
}

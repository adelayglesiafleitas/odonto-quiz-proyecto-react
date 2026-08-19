import { getCookie, setCookie } from './cookies'

export type Tema = 'dark' | 'light'
export type Idioma = 'es' | 'en'

const TEMA_COOKIE = 'examprep_tema'
const IDIOMA_COOKIE = 'examprep_idioma'

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

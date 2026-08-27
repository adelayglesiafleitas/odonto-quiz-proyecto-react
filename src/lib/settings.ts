import { getCookie, setCookie } from './cookies'

export type Tema = 'dark' | 'light'
export type Idioma = 'es' | 'en'
export type Estilo = 'clasico' | 'acqua' | 'electrico' | 'rockpop' | 'fresita' | 'galaxia'

const TEMA_COOKIE = 'examprep_tema'
const IDIOMA_COOKIE = 'examprep_idioma'
const ESTILO_COOKIE = 'examprep_estilo'

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

const ESTILOS_VALIDOS: Estilo[] = ['clasico', 'acqua', 'electrico', 'rockpop', 'fresita', 'galaxia']

export function getEstiloGuardado(): Estilo {
  const valor = getCookie(ESTILO_COOKIE)
  return (ESTILOS_VALIDOS as string[]).includes(valor ?? '') ? (valor as Estilo) : 'clasico'
}

export function guardarEstilo(estilo: Estilo) {
  setCookie(ESTILO_COOKIE, estilo)
}

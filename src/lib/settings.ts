import { getCookie, setCookie } from './cookies'

export type Tema = 'dark' | 'light'
export type Idioma = 'es' | 'en'
export type Estilo = 'neon' | 'clasico' | 'acqua' | 'electrico' | 'rockpop' | 'fresita' | 'galaxia' | 'academia'

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

const ESTILOS_VALIDOS: Estilo[] = ['neon', 'clasico', 'acqua', 'electrico', 'rockpop', 'fresita', 'galaxia', 'academia']

// Rediseño Neón (2026-09-25): se pasa a todos a Neón una sola vez, aunque
// antes hubieran elegido otro estilo. La cookie de versión marca que la
// migración ya se hizo, así que si después alguien elige otro estilo en
// Perfil, se respeta.
const ESTILO_VERSION_COOKIE = 'examprep_estilo_v'
const ESTILO_VERSION_ACTUAL = '2'

export function getEstiloGuardado(): Estilo {
  if (getCookie(ESTILO_VERSION_COOKIE) !== ESTILO_VERSION_ACTUAL) {
    setCookie(ESTILO_VERSION_COOKIE, ESTILO_VERSION_ACTUAL)
    setCookie(ESTILO_COOKIE, 'neon')
    return 'neon'
  }
  const valor = getCookie(ESTILO_COOKIE)
  return (ESTILOS_VALIDOS as string[]).includes(valor ?? '') ? (valor as Estilo) : 'neon'
}

export function guardarEstilo(estilo: Estilo) {
  setCookie(ESTILO_COOKIE, estilo)
}

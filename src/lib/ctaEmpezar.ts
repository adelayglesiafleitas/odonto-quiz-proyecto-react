import type { Idioma } from '@/lib/i18n'

export interface CtaEmpezar {
  headline: string
  sub: string
}

/**
 * Textos para la card "Empezá ya" que aparece en Home, debajo de la frase
 * del día, invitando a arrancar un simulacro. Se elige uno al azar por
 * carga de Home (mismo patrón que las frases motivacionales), para que no
 * se sienta repetitivo con el uso diario.
 */
const CTA_ES: CtaEmpezar[] = [
  { headline: '¡Empezá ya!', sub: 'Tu próxima prueba está lista para vos.' },
  { headline: '¡Dale, es tu turno!', sub: 'Unos minutos alcanzan para sumar otro repaso.' },
  { headline: '¡Vamos con todo!', sub: 'Practicá ahora y encará un simulacro más.' },
  { headline: '¡A darle, no esperes más!', sub: 'No dejes pasar el envión de hoy.' },
  { headline: '¡Este es el momento!', sub: 'Metele antes de que se te escape el día.' },
]

const CTA_EN: CtaEmpezar[] = [
  { headline: 'Start now!', sub: 'Your next quiz is ready for you.' },
  { headline: "Let's go, it's your turn!", sub: 'A few minutes is all it takes for one more review.' },
  { headline: 'Go for it!', sub: 'Practice now and take one more mock exam.' },
  { headline: "Don't wait, do it now!", sub: "Keep today's momentum going." },
  { headline: 'This is the moment!', sub: "Squeeze it in before the day's gone." },
]

export function getCtaEmpezar(idioma: Idioma): CtaEmpezar {
  const pool = idioma === 'en' ? CTA_EN : CTA_ES
  return pool[Math.floor(Math.random() * pool.length)]
}

import type { Idioma } from '@/lib/i18n'

type MensajeFn = (nombre: string) => string

/**
 * Mensajes de bienvenida mostrados brevemente al entrar a Home, antes de que
 * aparezca la frase del día. Varían según el día de la semana (índice según
 * Date.getDay(): 0 = domingo … 6 = sábado) y se combinan con un pool
 * genérico para sumar variedad.
 */
const MENSAJES_DIA_ES: MensajeFn[][] = [
  [
    (n) => `Domingo tranquilo, ${n}. Buen día para sumar un repaso más.`,
    (n) => `Hola, ${n}. Un ratito hoy también te acerca a la meta.`,
  ],
  [
    (n) => `Nada como empezar un lunes con toda la pila, ${n}.`,
    (n) => `Arranca la semana, ${n}. Cada lunes suma.`,
  ],
  [
    (n) => `Martes de seguir sumando repasos, ${n}.`,
    (n) => `Ya agarraste ritmo esta semana. Seguí así, ${n}.`,
  ],
  [
    (n) => `Mitad de semana, mitad de camino. Seguí adelante, ${n}.`,
    (n) => `Miércoles: el mejor día para no bajar el ritmo, ${n}.`,
  ],
  [
    (n) => `Ya casi llegás al fin de semana, no aflojes, ${n}.`,
    (n) => `Jueves de sostener el esfuerzo, ${n}.`,
  ],
  [
    (n) => `Viernes: cerrá la semana con un buen repaso, ${n}.`,
    (n) => `Último empujón de la semana. Vos podés, ${n}.`,
  ],
  [
    (n) => `Sábado también cuenta para acercarte a tu meta, ${n}.`,
    (n) => `Un ratito de estudio este sábado suma un montón, ${n}.`,
  ],
]

const MENSAJES_GENERICOS_ES: MensajeFn[] = [
  (n) => `Bienvenido, ${n}. Esperamos que este sea tu lugar.`,
  (n) => `Qué bueno tenerte de vuelta, ${n}.`,
  (n) => `Este es tu espacio para prepararte a tu ritmo, ${n}.`,
]

const MENSAJES_DIA_EN: MensajeFn[][] = [
  [
    (n) => `A calm Sunday, ${n}. A great day for one more review.`,
    (n) => `Hi, ${n}. Even a little today gets you closer to your goal.`,
  ],
  [
    (n) => `Nothing like starting a Monday with full energy, ${n}.`,
    (n) => `New week, ${n}. Every Monday counts.`,
  ],
  [
    (n) => `Tuesday: keep the reviews coming, ${n}.`,
    (n) => `You've got momentum this week. Keep it up, ${n}.`,
  ],
  [
    (n) => `Halfway through the week, halfway there. Keep going, ${n}.`,
    (n) => `Wednesday: the best day to keep the pace, ${n}.`,
  ],
  [
    (n) => `Almost at the weekend — don't slow down now, ${n}.`,
    (n) => `Thursday: keep pushing, ${n}.`,
  ],
  [
    (n) => `Friday: close out the week with a good review, ${n}.`,
    (n) => `One last push for the week. You've got this, ${n}.`,
  ],
  [
    (n) => `Saturday counts too on the way to your goal, ${n}.`,
    (n) => `A little studying today goes a long way, ${n}.`,
  ],
]

const MENSAJES_GENERICOS_EN: MensajeFn[] = [
  (n) => `Welcome, ${n}. We hope this becomes your place.`,
  (n) => `Good to have you back, ${n}.`,
  (n) => `This is your space to prepare at your own pace, ${n}.`,
]

export function getBienvenida(idioma: Idioma, nombre: string): string {
  const dia = new Date().getDay()
  const porDia = idioma === 'en' ? MENSAJES_DIA_EN[dia] : MENSAJES_DIA_ES[dia]
  const genericos = idioma === 'en' ? MENSAJES_GENERICOS_EN : MENSAJES_GENERICOS_ES
  const pool = [...porDia, ...genericos]
  const elegido = pool[Math.floor(Math.random() * pool.length)]
  return elegido(nombre)
}

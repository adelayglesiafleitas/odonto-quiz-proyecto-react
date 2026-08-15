import type { Idioma } from '@/lib/i18n'

export interface Frase {
  texto: string
  autor?: string
}

/**
 * Frases de autoayuda para estudiantes, mostradas en la pestaña Academia.
 * Por ahora son genéricas (sin autor); más adelante se pueden ir sumando
 * testimonios reales de gente que ya rindió el examen, usando el campo
 * `autor` para atribuirlas.
 */
const FRASES_ES: Frase[] = [
  { texto: 'Cada pregunta que practicás hoy es un paso menos para llegar a tu meta.' },
  { texto: 'No necesitás saberlo todo, necesitás seguir intentándolo.' },
  { texto: 'El que estudia con constancia, tarde o temprano aprueba.' },
  { texto: 'Tu ritmo es válido. Lo importante es no detenerte.' },
  { texto: 'Equivocarte en un simulacro es mejor que equivocarte en el examen real: aprovechá el error.' },
  { texto: 'Confiá en el proceso: cada repaso suma, aunque hoy no lo sientas.' },
  { texto: 'Llegaste hasta acá porque podés. Seguí.' },
  { texto: 'El cansancio es temporal, el título es para siempre.' },
  { texto: 'No compares tu avance con el de otros: comparalo con el tuyo de ayer.' },
  { texto: 'Un examen no define lo que sabés. Solo mide un día.' },
]

const FRASES_EN: Frase[] = [
  { texto: "Every question you practice today is one step closer to your goal." },
  { texto: "You don't need to know it all — you need to keep trying." },
  { texto: 'Those who study consistently eventually pass.' },
  { texto: 'Your pace is valid. What matters is not stopping.' },
  { texto: "Getting it wrong in practice beats getting it wrong on exam day — use the mistake." },
  { texto: "Trust the process: every review adds up, even when it doesn't feel like it." },
  { texto: 'You made it this far because you can. Keep going.' },
  { texto: 'Tiredness is temporary. Your degree is forever.' },
  { texto: "Don't compare your progress to others — compare it to yesterday's you." },
  { texto: "An exam doesn't define what you know. It only measures one day." },
]

export function getFrases(idioma: Idioma): Frase[] {
  return idioma === 'en' ? FRASES_EN : FRASES_ES
}

export function indiceFraseAleatoria(total: number): number {
  return Math.floor(Math.random() * total)
}

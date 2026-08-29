// src/lib/tourBienvenida.ts
//
// Contenido de las 6 pantallas del tour de bienvenida (ES/EN), en el mismo
// patrón que ya usan src/lib/bienvenida.ts y src/lib/ctaEmpezar.ts: el texto
// vive acá, no en i18n.ts (i18n.ts se reserva para etiquetas cortas de UI).

export type IconoTour = 'bienvenida' | 'racha' | 'simulacro' | 'estudio' | 'resultados' | 'estadisticas';

export interface SlideTour {
  icono: IconoTour;
  titulo: string;
  texto: string;
}

const SLIDES_ES: SlideTour[] = [
  {
    icono: 'bienvenida',
    titulo: 'Bienvenido a Odonto Quiz',
    texto: 'Te armamos un recorrido rápido para que le saques el jugo desde el primer día.',
  },
  {
    icono: 'racha',
    titulo: 'Empezá por tu racha',
    texto: 'Cada día que practicás suma. No se trata de ser perfecto, se trata de no aflojar.',
  },
  {
    icono: 'simulacro',
    titulo: 'Practicá en condiciones reales',
    texto:
      'El modo oficial arma el examen con la misma cantidad de preguntas y el mismo tiempo que el real. Sin sorpresas el día que importa.',
  },
  {
    icono: 'estudio',
    titulo: 'Repasá capítulo por capítulo',
    texto: 'Elegí un tema puntual y practicá pregunta por pregunta, con feedback inmediato.',
  },
  {
    icono: 'resultados',
    titulo: 'Mirá qué tema repasar',
    texto: 'Al terminar un simulacro, un semáforo por tema te muestra dónde estás fuerte y dónde no.',
  },
  {
    icono: 'estadisticas',
    titulo: 'Mirá tu evolución',
    texto:
      'El gráfico de estadísticas te muestra si el método está funcionando semana a semana, no solo en un simulacro suelto.',
  },
];

const SLIDES_EN: SlideTour[] = [
  {
    icono: 'bienvenida',
    titulo: 'Welcome to Odonto Quiz',
    texto: 'We put together a quick tour so you get the most out of it from day one.',
  },
  {
    icono: 'racha',
    titulo: 'Start with your streak',
    texto: 'Every day you practice adds up. It is not about being perfect, it is about not giving up.',
  },
  {
    icono: 'simulacro',
    titulo: 'Practice under real conditions',
    texto:
      'Official mode builds the exam with the same number of questions and the same time as the real one. No surprises on the day that matters.',
  },
  {
    icono: 'estudio',
    titulo: 'Review chapter by chapter',
    texto: 'Pick a specific topic and practice question by question, with immediate feedback.',
  },
  {
    icono: 'resultados',
    titulo: 'See what to review',
    texto: 'After finishing a mock exam, a traffic light per topic shows you where you are strong and where you are not.',
  },
  {
    icono: 'estadisticas',
    titulo: 'See your progress',
    texto: 'The statistics chart shows whether the method is working week after week, not just in one isolated attempt.',
  },
];

export function getSlidesTour(idioma: 'es' | 'en'): SlideTour[] {
  return idioma === 'en' ? SLIDES_EN : SLIDES_ES;
}

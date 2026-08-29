// src/components/TourBienvenida.tsx
//
// Carrusel de bienvenida (onboarding), 6 pantallas. Se muestra a pantalla
// completa. `onCerrar` se dispara tanto al terminar (última pantalla) como
// al tocar "Saltar" — quien lo use decide qué hacer con eso (ver
// src/lib/tourBienvenidaRemoto.ts): en ambos casos hay que marcar el flag
// remoto `vio_tour_bienvenida` como visto.
//
// Usa la clase `.brand-gradient` que ya existe en index.css (la misma que
// usan Login/Splash/LoadingScreen/DispositivoBloqueado y el header de Home),
// así que el tour cambia de color solo con los 6 estilos de la app, sin
// tocar nada acá. La placa del ícono y el botón usan tonos neutros
// (blanco translúcido) para que se vean bien en los 6 estilos, en vez de un
// color fijo como en las cards de Home (que sí usan un gradiente fijo
// propio, no `.brand-gradient`).

import { useState } from 'react';
import { Sparkles, Flame, Rocket, BookOpen, Trophy, ChevronRight } from 'lucide-react';
import { getSlidesTour, type IconoTour } from '@/lib/tourBienvenida';

function IconoSemaforo() {
  // No hay un ícono de lucide-react para esto — se dibuja a mano, usando
  // los colores reales del semáforo de la app (rojo/azul/verde).
  return (
    <svg viewBox="0 0 24 24" width="40" height="40">
      <rect x="7.5" y="1.5" width="9" height="21" rx="4.5" fill="none" stroke="white" strokeWidth="1.4" />
      <circle cx="12" cy="6.7" r="2" fill="#f87171" />
      <circle cx="12" cy="12" r="2" fill="#60a5fa" />
      <circle cx="12" cy="17.3" r="2" fill="#4ade80" />
    </svg>
  );
}

const ICONOS: Record<IconoTour, () => JSX.Element> = {
  bienvenida: () => <Sparkles size={40} strokeWidth={1.6} />,
  racha: () => <Flame size={40} strokeWidth={1.6} />,
  simulacro: () => <Rocket size={40} strokeWidth={1.6} />,
  estudio: () => <BookOpen size={40} strokeWidth={1.6} />,
  resultados: () => <IconoSemaforo />,
  estadisticas: () => <Trophy size={40} strokeWidth={1.6} />,
};

interface TourBienvenidaProps {
  idioma: 'es' | 'en';
  onCerrar: () => void;
}

export default function TourBienvenida({ idioma, onCerrar }: TourBienvenidaProps) {
  const [paso, setPaso] = useState(0);
  const slides = getSlidesTour(idioma);
  const total = slides.length;
  const esUltimo = paso === total - 1;
  const actual = slides[paso];
  const Icono = ICONOS[actual.icono];

  const siguiente = () => {
    if (esUltimo) {
      onCerrar();
    } else {
      setPaso((p) => p + 1);
    }
  };

  const textoBoton = esUltimo
    ? idioma === 'en'
      ? 'Start studying'
      : 'Empezar a estudiar'
    : idioma === 'en'
      ? 'Next'
      : 'Siguiente';

  return (
    <div className="fixed inset-0 z-50 mx-auto w-full max-w-md brand-gradient flex flex-col animate-bienvenida-in">
      <div className="flex items-center justify-between px-6 pt-7 min-h-[44px]">
        <span className="text-[11px] font-bold tracking-[2px] text-white/45">ODONTO QUIZ</span>
        {!esUltimo && (
          <button onClick={onCerrar} className="text-white/60 text-sm font-semibold py-3 px-1">
            {idioma === 'en' ? 'Skip' : 'Saltar'}
          </button>
        )}
      </div>

      <div key={paso} className="flex-1 flex flex-col items-center justify-center text-center px-9 gap-5 animate-frase-in">
        <div className="w-[88px] h-[88px] rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center text-white">
          <Icono />
        </div>
        <div className="flex flex-col gap-2.5 items-center">
          <h2 className="text-[23px] font-extrabold text-white leading-tight">{actual.titulo}</h2>
          <p className="text-[14.5px] text-white/75 leading-relaxed max-w-[270px]">{actual.texto}</p>
        </div>
      </div>

      <div className="px-6 pb-9 flex flex-col items-center gap-5">
        <div className="flex items-center gap-[7px] h-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setPaso(i)}
              aria-label={`Paso ${i + 1}`}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === paso ? 22 : 8,
                backgroundColor: i === paso ? 'white' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
        <button
          onClick={siguiente}
          className="w-full h-14 rounded-full bg-white text-slate-900 font-bold text-base flex items-center justify-center gap-2"
        >
          {textoBoton}
          <ChevronRight size={18} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

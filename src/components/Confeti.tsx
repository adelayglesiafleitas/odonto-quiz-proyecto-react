// src/components/Confeti.tsx
// Lluvia corta de confeti (una sola vez, ~3 s). Va dentro de un contenedor
// `relative overflow-hidden`; no captura toques. Estilos en index.css
// (.confeti-pieza). Con "reducir movimiento" no se muestra.
import { useMemo, type CSSProperties } from 'react'

const COLORES = ['#1fc6c6', '#7fe9e2', '#ffd166', '#ff8a5b', '#ffffff', '#9b8cff']

export function Confeti({ piezas = 42 }: { piezas?: number }) {
  const lista = useMemo(
    () =>
      Array.from({ length: piezas }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        color: COLORES[i % COLORES.length],
        dx: `${(Math.random() - 0.5) * 120}px`,
        rot: `${360 + Math.random() * 540}deg`,
        delay: `${Math.random() * 0.6}s`,
        dur: `${2 + Math.random() * 1.2}s`,
        redondo: Math.random() < 0.3,
      })),
    [piezas],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {lista.map((p, i) => (
        <span
          key={i}
          className="confeti-pieza"
          style={
            {
              left: p.left,
              background: p.color,
              borderRadius: p.redondo ? '50%' : undefined,
              width: p.redondo ? '7px' : undefined,
              height: p.redondo ? '7px' : undefined,
              '--dx': p.dx,
              '--rot': p.rot,
              '--delay': p.delay,
              '--dur': p.dur,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

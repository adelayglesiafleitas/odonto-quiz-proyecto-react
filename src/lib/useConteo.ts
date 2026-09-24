// src/lib/useConteo.ts
// Anima un número de 0 (o del valor anterior) hasta `objetivo` con ease-out.
// Se usa para contadores y anillos de progreso (Home, Resultados, comunidad).
// Con "reducir movimiento" del sistema devuelve el valor final directamente.
import { useEffect, useRef, useState } from 'react'

export function useConteo(objetivo: number, duracionMs = 1000, retrasoMs = 0): number {
  const [valor, setValor] = useState(0)
  const desdeRef = useRef(0)

  useEffect(() => {
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reducido || objetivo === desdeRef.current) {
      desdeRef.current = objetivo
      setValor(objetivo)
      return
    }
    const desde = desdeRef.current
    let raf = 0
    let inicio = 0
    const timer = setTimeout(() => {
      const paso = (ahora: number) => {
        if (!inicio) inicio = ahora
        const p = Math.min(1, (ahora - inicio) / duracionMs)
        const suavizado = 1 - Math.pow(1 - p, 3)
        const actual = desde + (objetivo - desde) * suavizado
        setValor(p < 1 ? actual : objetivo)
        if (p < 1) raf = requestAnimationFrame(paso)
        else desdeRef.current = objetivo
      }
      raf = requestAnimationFrame(paso)
    }, retrasoMs)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [objetivo, duracionMs, retrasoMs])

  return valor
}

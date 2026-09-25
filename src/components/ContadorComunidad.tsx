// src/components/ContadorComunidad.tsx
// Tira "comunidad" dentro del hero de la Home: avatares apilados, el total de
// estudiantes con animación de conteo y un punto vivo con los que estudiaron hoy.
// Si la función de la base falla o no existe todavía, no se muestra nada.
import { useEffect, useState } from 'react'
import { useConteo } from '@/lib/useConteo'
import { GraduationCap, User } from 'lucide-react'
import { getContadorComunidad, type ContadorComunidad as Datos } from '@/lib/comunidadContador'
import type { Idioma } from '@/lib/i18n'

const AVATARES = [
  'linear-gradient(135deg, #2dd8d8, #12908f)',
  'linear-gradient(135deg, #ffd166, #f4a261)',
  'linear-gradient(135deg, #ff8a5b, #e5576b)',
]

const TEXTOS = {
  es: {
    estudiantes: (n: number) => (n === 1 ? 'estudiante' : 'estudiantes'),
    sub: 'preparando la homologación',
    hoy: (n: number) => `${n} hoy`,
    hoyTitulo: 'Estudiantes que hicieron un simulacro en las últimas 24 h',
  },
  en: {
    estudiantes: (n: number) => (n === 1 ? 'student' : 'students'),
    sub: 'preparing for the licensing exam',
    hoy: (n: number) => `${n} today`,
    hoyTitulo: 'Students who took a mock exam in the last 24 h',
  },
}

export function ContadorComunidad({ idioma }: { idioma: Idioma }) {
  const [datos, setDatos] = useState<Datos | null>(null)
  const total = Math.round(useConteo(datos?.total ?? 0, 1100))
  const tx = TEXTOS[idioma === 'en' ? 'en' : 'es']
  const locale = idioma === 'en' ? 'en' : 'es'

  useEffect(() => {
    let cancelado = false
    getContadorComunidad().then((d) => {
      if (!cancelado) setDatos(d)
    })
    return () => {
      cancelado = true
    }
  }, [])

  if (!datos || datos.total === 0) return null

  return (
    <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="flex shrink-0 -space-x-1.5">
        {AVATARES.map((fondo, i) => (
          <span
            key={i}
            className="h-6 w-6 rounded-full ring-2 ring-white/25"
            style={{ background: fondo, zIndex: AVATARES.length - i }}
          />
        ))}
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/25">
          <GraduationCap className="h-3.5 w-3.5 text-white" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="whitespace-nowrap text-sm font-bold leading-tight">
          <span className="text-base font-extrabold tabular-nums">{total.toLocaleString(locale)}</span>{' '}
          {tx.estudiantes(datos.total)}
        </p>
        <p className="text-[11px] leading-snug text-white/60">{tx.sub}</p>
      </div>

      {datos.activosHoy > 0 && (
        <div
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1"
          title={tx.hoyTitulo}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-bold tabular-nums text-emerald-200">{tx.hoy(datos.activosHoy)}</span>
        </div>
      )}
    </div>
  )
}

// Versión compacta para la cabecera de la Home: solo el icono de persona y la
// cifra de estudiantes registrados (misma fuente que la tira de arriba). El
// texto completo va en title/aria-label para quien lo necesite.
export function ContadorPersonas({ idioma }: { idioma: Idioma }) {
  const [datos, setDatos] = useState<Datos | null>(null)
  const total = Math.round(useConteo(datos?.total ?? 0, 1100))
  const tx = TEXTOS[idioma === 'en' ? 'en' : 'es']
  const locale = idioma === 'en' ? 'en' : 'es'

  useEffect(() => {
    let cancelado = false
    getContadorComunidad().then((d) => {
      if (!cancelado) setDatos(d)
    })
    return () => {
      cancelado = true
    }
  }, [])

  if (!datos || datos.total === 0) return null

  const etiqueta = `${datos.total.toLocaleString(locale)} ${tx.estudiantes(datos.total)}`
  return (
    <div
      className="flex h-9 items-center gap-1 rounded-full bg-white/10 px-2.5 text-white animate-in fade-in duration-500"
      title={etiqueta}
      aria-label={etiqueta}
      role="status"
    >
      <User className="h-4 w-4 text-white/80" aria-hidden="true" />
      <span className="text-sm font-bold tabular-nums">{total.toLocaleString(locale)}</span>
    </div>
  )
}

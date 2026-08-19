import { useEffect, useState } from 'react'
import { LogoMark } from '@/components/Logo'
import { Spinner } from '@/components/Spinner'
import { SettingsToggle } from '@/components/SettingsToggle'
import { BottomNav } from '@/components/BottomNav'
import { useAppSettings } from '@/context/AppSettings'
import { getHistorialRemoto, calcularPromedio, getFechasIntentos, calcularRacha } from '@/lib/historial'
import { getFrases, indiceFraseAleatoria } from '@/lib/frases'
import type { CursoMeta } from '@/lib/cursos'
import { LogOut, Trophy, TrendingUp, Quote, Flame } from 'lucide-react'
import type { Pantalla } from '@/types'

export function Home({
  userId,
  nickname,
  cursoId,
  cursoMeta,
  onNavigate,
  onLogout,
}: {
  userId: string
  nickname: string | null
  cursoId: string
  cursoMeta: CursoMeta
  onNavigate: (p: Pantalla) => void
  onLogout: () => void
}) {
  const { t, idioma } = useAppSettings()
  const [mejor, setMejor] = useState(0)
  const [promedio, setPromedio] = useState(0)
  const [intentos, setIntentos] = useState(0)
  const [racha, setRacha] = useState(0)
  const [cargandoStats, setCargandoStats] = useState(true)
  const [indiceFrase] = useState(() => indiceFraseAleatoria(getFrases(idioma).length))
  const frase = getFrases(idioma)[indiceFrase]

  useEffect(() => {
    let cancelado = false
    setCargandoStats(true)
    Promise.all([getHistorialRemoto(userId, cursoId), getFechasIntentos(userId, cursoId)]).then(
      ([historial, fechas]) => {
        if (cancelado) return
        setMejor(historial.reduce((max, i) => Math.max(max, i.porcentaje), 0))
        setIntentos(historial.length)
        setPromedio(calcularPromedio(historial))
        setRacha(calcularRacha(fechas))
        setCargandoStats(false)
      },
    )
    return () => {
      cancelado = true
    }
  }, [userId, cursoId])
  const nombreMostrado = nickname && nickname.trim().length > 0 ? nickname : t.home.estudiante

  return (
    <div className="app-shell bg-background pb-28">
      <div className="brand-gradient rounded-b-[32px] px-6 pb-8 pt-6 text-white">
        <div className="flex items-center justify-between">
          <LogoMark className="h-10 w-auto" />
          <div className="flex items-center gap-2">
            <SettingsToggle variante="oscuro" />
            <button
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
              aria-label={t.home.cerrarSesion}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="card-elevated mt-5 rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-xs text-white/60">{t.home.hola}</p>
            <p className="-mt-0.5 text-lg font-bold">{nombreMostrado}</p>
          </div>

          <p className="mt-3 text-xs font-medium text-white/70">{t.home.progreso}</p>
          {cargandoStats ? (
            <div className="mt-4 flex items-center justify-center py-2.5">
              <Spinner className="h-6 w-6 text-white/70" />
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-3xl font-extrabold leading-none">{promedio}%</p>
                <p className="mt-1.5 text-[11px] text-white/60">{t.home.promedioSufijo(intentos)}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 text-right">
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                  <Trophy className="h-3.5 w-3.5 text-[#ffd166]" />
                  <span className="text-xs font-semibold">{mejor}% {t.home.mejorPuntaje}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                  <TrendingUp className="h-3.5 w-3.5 text-[#1fc6c6]" />
                  <span className="text-xs font-semibold">{t.home.meta(cursoMeta.porcentajeAprobado)}</span>
                </div>
                {racha > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                    <Flame className="h-3.5 w-3.5 text-[#ff8a5b]" />
                    <span className="text-xs font-semibold">{t.home.racha(racha)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 px-6">
        <div className="card-elevated rounded-2xl bg-card p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">
            <Quote className="h-3.5 w-3.5" />
            {t.home.fraseEtiqueta}
          </div>
          <p className="mt-2.5 text-[15px] font-semibold leading-relaxed text-foreground">&ldquo;{frase.texto}&rdquo;</p>
          {frase.autor && <p className="mt-2.5 text-xs font-medium text-muted-foreground">— {frase.autor}</p>}
        </div>
      </div>

      <BottomNav activo="home" onNavigate={onNavigate} />
    </div>
  )
}

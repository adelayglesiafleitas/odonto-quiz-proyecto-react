import { useEffect, useState } from 'react'
import { LogoMark } from '@/components/Logo'
import { Spinner } from '@/components/Spinner'
import { SettingsToggle } from '@/components/SettingsToggle'
import { BottomNav } from '@/components/BottomNav'
import { useAppSettings } from '@/context/AppSettings'
import { getHistorialRemoto, calcularPromedio, getFechasIntentos, calcularRacha } from '@/lib/historial'
import { getFrases, indiceFraseAleatoria } from '@/lib/frases'
import { getBienvenida, getBienvenidaPrimeraVisita } from '@/lib/bienvenida'
import { getCtaEmpezar } from '@/lib/ctaEmpezar'
import TourBienvenida from '@/components/TourBienvenida'
import { getVioTourBienvenida, marcarTourBienvenidaVisto } from '@/lib/tourBienvenidaRemoto'
import { ICONO_BIENVENIDA, ICONO_CTA } from '@/lib/temaIconos'
import { colorStrokePorcentaje } from '@/lib/utils'
import type { CursoMeta } from '@/lib/cursos'
import { LogOut, Trophy, TrendingUp, Quote, Flame, BarChart3, ChevronRight } from 'lucide-react'
import type { Pantalla } from '@/types'

const PROMEDIO_CIRCUNFERENCIA = 2 * Math.PI * 32

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
  const { t, idioma, estilo } = useAppSettings()
  const nombreMostrado = nickname && nickname.trim().length > 0 ? nickname : t.home.estudiante
  const [mejor, setMejor] = useState(0)
  const [promedio, setPromedio] = useState(0)
  const [intentos, setIntentos] = useState(0)
  const [racha, setRacha] = useState(0)
  const [cargandoStats, setCargandoStats] = useState(true)
  const [indiceFrase] = useState(() => indiceFraseAleatoria(getFrases(idioma).length))
  const frase = getFrases(idioma)[indiceFrase]
  const [bienvenida] = useState(() => getBienvenida(idioma, nombreMostrado))
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true)
  const [cta] = useState(() => getCtaEmpezar(idioma))
  const [mostrarTour, setMostrarTour] = useState(false)
  const [primeraVisita, setPrimeraVisita] = useState(false)
  const IconoBienvenida = ICONO_BIENVENIDA[estilo]
  const IconoCta = ICONO_CTA[estilo]
  // Primera vez en la vida de la cuenta: en vez del mensaje que cambia por
  // día de la semana, se muestra un texto de bienvenida fijo (ver
  // src/lib/bienvenida.ts). Se dispara junto con el tour de 6 pantallas.
  const mensajeBienvenida = primeraVisita ? getBienvenidaPrimeraVisita(idioma, nombreMostrado) : bienvenida

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

  useEffect(() => {
    const timer = setTimeout(() => setMostrarBienvenida(false), 3200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    getVioTourBienvenida().then((visto) => {
      if (!visto) {
        setMostrarTour(true)
        setPrimeraVisita(true)
      }
    })
  }, [])

  const cerrarTour = () => {
    marcarTourBienvenidaVisto()
    setMostrarTour(false)
  }

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
              <div className="flex items-center gap-3">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke={colorStrokePorcentaje(promedio)}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={PROMEDIO_CIRCUNFERENCIA}
                      strokeDashoffset={PROMEDIO_CIRCUNFERENCIA - (promedio / 100) * PROMEDIO_CIRCUNFERENCIA}
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  <span className="absolute text-lg font-extrabold">{promedio}%</span>
                </div>
                <p className="max-w-[6.5rem] text-[11px] leading-snug text-white/60">{t.home.promedioSufijo(intentos)}</p>
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

          <button
            onClick={() => onNavigate('estadisticas')}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-2.5 text-xs font-bold text-white transition active:scale-[0.98] hover:bg-white/15"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            {t.home.verEstadisticas}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-6 px-6">
        <div className="card-elevated relative min-h-[132px] rounded-2xl bg-card">
          <div
            className={`absolute inset-0 flex flex-col justify-center overflow-hidden rounded-2xl border p-4 ${
              mostrarBienvenida ? 'animate-bienvenida-in' : 'pointer-events-none animate-bienvenida-out'
            }`}
            style={{
              borderColor: 'var(--home-hero-border)',
              background: 'var(--home-hero-bg)',
              boxShadow: 'var(--home-hero-shadow)',
              transform: 'var(--home-hero-transform)',
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full blur-md"
              style={{ background: 'var(--home-hero-glow)' }}
            />
            <div
              className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide"
              style={{ color: 'var(--home-hero-kicker)' }}
            >
              <span
                className="flex h-[26px] w-[26px] items-center justify-center rounded-[9px] shadow-[0_4px_10px_rgba(31,198,198,0.35)]"
                style={{ background: 'var(--home-hero-badge-bg)' }}
              >
                <IconoBienvenida className="h-3.5 w-3.5 text-white" />
              </span>
              {t.home.bienvenidaEtiqueta}
            </div>
            <p className="relative mt-2.5 text-[15.5px] font-semibold leading-relaxed" style={{ color: 'var(--home-hero-ink)' }}>
              {mensajeBienvenida}
            </p>
          </div>
          <div
            className={`absolute inset-0 flex flex-col justify-center rounded-2xl p-4 ${
              mostrarBienvenida ? 'pointer-events-none opacity-0' : 'animate-frase-in'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">
              <Quote className="h-3.5 w-3.5" />
              {t.home.fraseEtiqueta}
            </div>
            <p className="mt-2.5 text-[15px] font-semibold leading-relaxed text-foreground">&ldquo;{frase.texto}&rdquo;</p>
            {frase.autor && <p className="mt-2.5 text-xs font-medium text-muted-foreground">— {frase.autor}</p>}
          </div>
        </div>
      </div>

      <div className="mt-4 px-6">
        <button
          type="button"
          onClick={() => onNavigate('asignaturas')}
          className={`card-elevated relative w-full overflow-hidden rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
            estilo === 'rockpop' ? '-rotate-1' : ''
          }`}
          style={{
            borderColor: 'var(--home-hero-border)',
            background: 'var(--home-hero-bg)',
            boxShadow: 'var(--home-hero-shadow)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 animate-cta-glow-pulse rounded-full blur-md"
            style={{ background: 'var(--home-hero-glow)' }}
          />
          <div
            className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide"
            style={{ color: 'var(--home-hero-kicker)' }}
          >
            <span
              className="flex h-[26px] w-[26px] items-center justify-center rounded-[9px] shadow-[0_4px_10px_rgba(31,198,198,0.35)]"
              style={{ background: 'var(--home-hero-badge-bg)' }}
            >
              <IconoCta className="h-3.5 w-3.5 text-white" />
            </span>
            {t.home.ctaKicker}
          </div>
          <p
            className="relative mt-2.5 animate-cta-bounce text-[19px] font-extrabold leading-snug"
            style={{ color: 'var(--home-hero-ink)' }}
          >
            {cta.headline}
          </p>
          <p className="relative mt-1 text-[12.5px] font-medium" style={{ color: 'var(--home-hero-ink-muted)' }}>
            {cta.sub}
          </p>
          <div
            className="relative mt-3.5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold"
            style={{ background: 'var(--home-hero-btn-bg)', color: 'var(--home-hero-btn-ink)' }}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-full border-2 animate-pulse-ring"
              style={{ borderColor: 'var(--home-hero-ring)' }}
            />
            {t.home.empezar}
            <ChevronRight className="h-3.5 w-3.5 animate-cta-arrow" />
          </div>
        </button>
      </div>

      <BottomNav activo="home" onNavigate={onNavigate} />
      {mostrarTour && <TourBienvenida idioma={idioma} onCerrar={cerrarTour} />}
    </div>
  )
}

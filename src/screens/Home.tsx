import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoMark } from '@/components/Logo'
import { Spinner } from '@/components/Spinner'
import { SettingsToggle } from '@/components/SettingsToggle'
import { BottomNav } from '@/components/BottomNav'
import { useAppSettings } from '@/context/AppSettings'
import { getHistorialRemoto, calcularPromedio, getFechasIntentos, calcularRacha, calcularActividadSemanal, type ActividadDia } from '@/lib/historial'
import { getFrases, indiceFraseAleatoria } from '@/lib/frases'
import { getBienvenida, getBienvenidaPrimeraVisita } from '@/lib/bienvenida'
import { getCtaEmpezar } from '@/lib/ctaEmpezar'
import TourBienvenida from '@/components/TourBienvenida'
import { getVioTourBienvenida, marcarTourBienvenidaVisto } from '@/lib/tourBienvenidaRemoto'
import { getMensajesPendientes, descartarMensaje, type MensajeAdmin } from '@/lib/mensajesAdminRemoto'
import { MensajeAdminBanner } from '@/components/MensajeAdminBanner'
import { ContadorComunidad } from '@/components/ContadorComunidad'
import { useConteo } from '@/lib/useConteo'
import { listarMisTickets, suscribirseAMisTickets, type Ticket } from '@/lib/tickets'
import { RUTA_SOPORTE, rutaSoporteDetalle } from '@/lib/rutas'
import { ICONO_BIENVENIDA, ICONO_CTA } from '@/lib/temaIconos'
import { colorStrokePorcentaje } from '@/lib/utils'
import type { CursoMeta } from '@/lib/cursos'
import { LogOut, Trophy, TrendingUp, TrendingDown, Quote, Flame, BarChart3, ChevronRight, MessageCircleQuestion, X, ClipboardCheck, FileText, Clock } from 'lucide-react'
import type { IntentoExamen, Pantalla } from '@/types'

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
  const navigate = useNavigate()
  const nombreMostrado = nickname && nickname.trim().length > 0 ? nickname : t.home.estudiante
  const [mejor, setMejor] = useState(0)
  const [promedio, setPromedio] = useState(0)
  const [intentos, setIntentos] = useState(0)
  const [racha, setRacha] = useState(0)
  const [cargandoStats, setCargandoStats] = useState(true)
  // Datos extra del rediseño Neón (todo sale del mismo historial ya cargado).
  const [historialCurso, setHistorialCurso] = useState<IntentoExamen[]>([])
  const [actividad, setActividad] = useState<ActividadDia[]>([])
  const [indiceFrase] = useState(() => indiceFraseAleatoria(getFrases(idioma).length))
  const frase = getFrases(idioma)[indiceFrase]
  const [bienvenida] = useState(() => getBienvenida(idioma, nombreMostrado))
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true)
  const [cta] = useState(() => getCtaEmpezar(idioma))
  const [mostrarTour, setMostrarTour] = useState(false)
  const [primeraVisita, setPrimeraVisita] = useState(false)
  // Cartel de bienvenida de primera visita: ahora vive apilado junto con los
  // mensajes del admin (ver más abajo), no en la tarjeta de frase-del-día.
  // Se cierra con su propia ✕, sin flag nueva en la base — como `vio_tour_bienvenida`
  // ya no vuelve a poner `primeraVisita` en true, alcanza con estado local.
  const [bienvenidaPrimeraVisitaCerrada, setBienvenidaPrimeraVisitaCerrada] = useState(false)
  const [textoBienvenidaPrimeraVisita] = useState(() => getBienvenidaPrimeraVisita(idioma, nombreMostrado))
  const [colaMensajes, setColaMensajes] = useState<MensajeAdmin[]>([])
  // Aviso de "te respondieron" (ver claude/atencion-cliente-diseno.md): se
  // recalcula acá con la misma fuente que ya usa el badge de BottomNav
  // (`no_leido_usuario`), no una cola de "descartados" aparte como la de
  // mensajes del admin. Cerrar con la ✕ solo lo saca de esta visita a Home
  // (`avisoTicketCerrado`, estado local) — como el ticket sigue "sin leer"
  // en la base, el badge de la barra no se mueve y la tarjeta vuelve a
  // aparecer si se vuelve a entrar a Home, hasta que se abra el hilo.
  const [ticketsSinLeer, setTicketsSinLeer] = useState<Ticket[]>([])
  const [avisoTicketCerrado, setAvisoTicketCerrado] = useState(false)
  // Anillo y % de progreso: suben de 0 al valor real al cargar.
  const promedioAnimado = useConteo(cargandoStats ? 0 : promedio, 1100, 150)
  const resumen = resumirHistorial(historialCurso)
  const IconoBienvenida = ICONO_BIENVENIDA[estilo]
  const IconoCta = ICONO_CTA[estilo]

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
        setHistorialCurso(historial)
        setActividad(calcularActividadSemanal(fechas))
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
    let cancelado = false
    getVioTourBienvenida(userId).then((visto) => {
      if (cancelado) return
      if (!visto) {
        setMostrarTour(true)
        setPrimeraVisita(true)
      }
    })
    return () => {
      cancelado = true
    }
  }, [userId])

  useEffect(() => {
    let cancelado = false
    getMensajesPendientes(userId).then((mensajes) => {
      if (!cancelado) setColaMensajes(mensajes)
    })
    return () => {
      cancelado = true
    }
  }, [userId])

  useEffect(() => {
    let cancelado = false
    const cargarTickets = () => {
      listarMisTickets(userId).then((tickets) => {
        if (!cancelado) setTicketsSinLeer(tickets.filter((ticket) => ticket.noLeidoUsuario))
      })
    }
    cargarTickets()
    const desuscribir = suscribirseAMisTickets(userId, cargarTickets)
    return () => {
      cancelado = true
      desuscribir()
    }
  }, [userId])

  const cerrarTour = () => {
    marcarTourBienvenidaVisto(userId)
    setMostrarTour(false)
  }

  const cerrarMensajeAdmin = (id: string) => {
    descartarMensaje(id, userId)
    setColaMensajes((cola) => cola.filter((m) => m.id !== id))
  }

  const irAConsultaSinLeer = () => {
    if (ticketsSinLeer.length === 1) {
      navigate(rutaSoporteDetalle(ticketsSinLeer[0].id))
    } else {
      navigate(RUTA_SOPORTE)
    }
  }

  return (
    <div className="app-shell bg-background pb-28">
      <div className="brand-gradient rounded-b-[32px] px-6 pb-8 pt-6 text-white">
        <div className="flex items-center justify-between">
          <LogoMark className="h-10 w-auto" variante="oscuro" />
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

        <div className="card-elevated relative mt-5 overflow-hidden rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
          <DienteDecorativo className="pointer-events-none absolute -right-5 top-2 h-32 w-28 opacity-70" />
          <div className="relative flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xl font-medium leading-tight">
                {t.home.hola} <span className="font-extrabold">{nombreMostrado}</span>
              </p>
              <p className="mt-1.5 text-[13px] leading-snug text-white/75">{t.home.constancia}</p>
              {resumen.tendencia !== null && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/20 py-1.5 pl-1.5 pr-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                      resumen.tendencia >= 0 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-orange-400/15 text-orange-300'
                    }`}
                  >
                    {resumen.tendencia >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </span>
                  <span className="leading-tight">
                    <span className={`block text-[13px] font-extrabold ${resumen.tendencia >= 0 ? 'text-emerald-300' : 'text-orange-300'}`}>
                      {resumen.tendencia >= 0 ? '+' : ''}
                      {resumen.tendencia}%
                    </span>
                    <span className="block text-[10px] text-white/60">{t.home.estaSemana}</span>
                  </span>
                </div>
              )}
            </div>
            <div className="relative mr-6 flex h-28 w-28 shrink-0 items-center justify-center">
              {cargandoStats ? (
                <Spinner className="h-6 w-6 text-white/70" />
              ) : (
                <>
                  <svg viewBox="0 0 80 80" className="glow-cian h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke={colorStrokePorcentaje(promedio)}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={PROMEDIO_CIRCUNFERENCIA}
                      strokeDashoffset={PROMEDIO_CIRCUNFERENCIA - (promedioAnimado / 100) * PROMEDIO_CIRCUNFERENCIA}
                    />
                  </svg>
                  <span className="absolute flex flex-col items-center leading-none">
                    <span className="text-2xl font-extrabold tabular-nums">
                      {Math.round(promedioAnimado)}
                      <span className="text-sm">%</span>
                    </span>
                    <span className="mt-1 text-[10px] text-white/70">{t.home.tuPromedio}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('estadisticas')}
            className="relative mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-black/15 py-3 text-[13px] font-bold text-white transition active:scale-[0.98] hover:bg-black/25"
          >
            <BarChart3 className="h-4 w-4" />
            {t.home.verEstadisticas}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <ContadorComunidad idioma={idioma} />
      </div>

      {(primeraVisita && !bienvenidaPrimeraVisitaCerrada) ||
      (ticketsSinLeer.length > 0 && !avisoTicketCerrado) ||
      colaMensajes.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3 px-6">
          {primeraVisita && !bienvenidaPrimeraVisitaCerrada && (
            <div
              className="card-elevated relative overflow-hidden rounded-2xl border p-4"
              style={{
                borderColor: 'var(--home-hero-border)',
                background: 'var(--home-hero-bg)',
                boxShadow: 'var(--home-hero-shadow)',
              }}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-md"
                style={{ background: 'var(--home-hero-glow)' }}
              />
              <div className="relative flex items-start gap-2.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'var(--home-hero-badge-bg)' }}
                >
                  <IconoBienvenida className="h-3.5 w-3.5 text-white" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--home-hero-kicker)' }}>
                    {t.home.bienvenidaEtiqueta}
                  </p>
                  <p
                    className="mt-1 text-[13px] font-semibold leading-relaxed"
                    style={{ color: 'var(--home-hero-ink)' }}
                  >
                    {textoBienvenidaPrimeraVisita}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBienvenidaPrimeraVisitaCerrada(true)}
                  aria-label={t.mensajesAdmin.cerrar}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/10 transition hover:bg-black/20"
                  style={{ color: 'var(--home-hero-ink)' }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {ticketsSinLeer.length > 0 && !avisoTicketCerrado && (
            <div className="card-elevated relative overflow-hidden rounded-2xl border border-accent/30 bg-card p-4 animate-bienvenida-in">
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <MessageCircleQuestion className="h-3.5 w-3.5" />
                </span>
                <button type="button" onClick={irAConsultaSinLeer} className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-accent">
                    {ticketsSinLeer.length === 1
                      ? t.home.avisoSoporteEtiquetaSingular
                      : t.home.avisoSoporteEtiquetaPlural}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-foreground">
                    {ticketsSinLeer.length === 1
                      ? t.home.avisoSoporteTextoSingular(ticketsSinLeer[0].asunto)
                      : t.home.avisoSoporteTextoPlural(ticketsSinLeer.length)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setAvisoTicketCerrado(true)}
                  aria-label={t.mensajesAdmin.cerrar}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition hover:bg-secondary/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {colaMensajes.map((mensaje) => (
            <MensajeAdminBanner key={mensaje.id} mensaje={mensaje} onCerrar={() => cerrarMensajeAdmin(mensaje.id)} />
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 px-6">
        <div className="card-elevated anim-cascada rounded-2xl bg-card p-3.5" style={{ '--i': 1 } as CSSProperties}>
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 shrink-0 text-orange-400 drop-shadow-[0_0_6px_rgba(255,140,40,0.55)]" />
            <p className="text-[11.5px] text-muted-foreground">{t.home.rachaActual}</p>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-foreground">{t.home.dias(racha)}</p>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {actividad.map((dia, k) => (
              <span
                key={k}
                className={`h-2.5 w-2.5 rounded-full ${
                  dia.cantidad > 0 ? 'bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]' : 'bg-muted-foreground/25'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="card-elevated anim-cascada rounded-2xl bg-card p-3.5" style={{ '--i': 2 } as CSSProperties}>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 shrink-0 text-amber-400 drop-shadow-[0_0_6px_rgba(255,200,60,0.5)]" />
            <p className="text-[11.5px] text-muted-foreground">{t.home.mejorResultado}</p>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-foreground">{mejor}%</p>
          {resumen.notas.length >= 2 ? (
            <Sparkline valores={resumen.notas} />
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">{t.home.meta(cursoMeta.porcentajeAprobado)}</p>
          )}
        </div>
      </div>

      <div className="anim-cascada mt-6 px-6" style={{ '--i': 3 } as CSSProperties}>
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
            <span className="flex-1">{t.home.proximoSimulacro}</span>
            <span className="rounded-lg border border-emerald-400/35 bg-emerald-400/10 px-2 py-0.5 text-[10px] normal-case tracking-normal text-emerald-400">
              {t.home.recomendado}
            </span>
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

      <div className="mt-4 grid grid-cols-3 gap-2.5 px-6">
        {[
          { Icono: ClipboardCheck, etiqueta: t.home.simulacros, valor: String(intentos) },
          { Icono: FileText, etiqueta: t.home.preguntasRespondidas, valor: resumen.preguntas.toLocaleString(idioma) },
          { Icono: Clock, etiqueta: t.home.tiempoEstudio, valor: formatoHoras(resumen.segundos) },
        ].map(({ Icono, etiqueta, valor }, k) => (
          <div
            key={etiqueta}
            className="card-elevated anim-cascada rounded-2xl bg-card p-3"
            style={{ '--i': 4 + k } as CSSProperties}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
              <Icono className="h-4 w-4" />
            </span>
            <p className="mt-2.5 text-[10.5px] leading-tight text-muted-foreground">{etiqueta}</p>
            <p className="mt-0.5 text-[17px] font-extrabold tabular-nums text-foreground">{valor}</p>
          </div>
        ))}
      </div>

      <div className="anim-cascada mt-4 px-6" style={{ '--i': 7 } as CSSProperties}>
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
              {bienvenida}
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

      <BottomNav activo="home" onNavigate={onNavigate} />
      {mostrarTour && <TourBienvenida idioma={idioma} onCerrar={cerrarTour} />}
    </div>
  )
}

// --- Rediseño Neón: helpers de la Home -----------------------------------

/** Resumen del historial del curso para las tarjetas nuevas de la Home. */
function resumirHistorial(historial: IntentoExamen[]) {
  const ahora = Date.now()
  const DIA = 86_400_000
  const media = (xs: IntentoExamen[]) => xs.reduce((a, i) => a + i.porcentaje, 0) / xs.length
  const estaSemana = historial.filter((i) => ahora - new Date(i.fecha).getTime() < 7 * DIA)
  const semanaPasada = historial.filter((i) => {
    const d = ahora - new Date(i.fecha).getTime()
    return d >= 7 * DIA && d < 14 * DIA
  })
  const tendencia =
    estaSemana.length > 0 && semanaPasada.length > 0 ? Math.round(media(estaSemana) - media(semanaPasada)) : null
  const ordenado = [...historial].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
  return {
    tendencia,
    notas: ordenado.slice(-7).map((i) => i.porcentaje),
    preguntas: historial.reduce((a, i) => a + i.totalPreguntas, 0),
    segundos: historial.reduce((a, i) => a + i.tiempoUsadoSeg, 0),
  }
}

function formatoHoras(seg: number): string {
  if (seg < 3600) return `${Math.round(seg / 60)} min`
  return `${Math.round(seg / 3600)} h`
}

/** Mini gráfica de las últimas notas (0–100). */
function Sparkline({ valores }: { valores: number[] }) {
  const ancho = 100
  const alto = 26
  const paso = ancho / (valores.length - 1)
  const puntos = valores.map((v, k) => `${(k * paso).toFixed(1)},${(alto - 2 - (v / 100) * (alto - 4)).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="glow-cian mt-1.5 h-6 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={puntos}
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Muela de cristal decorativa para la tarjeta del saludo. */
function DienteDecorativo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="diente-home" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bff7fb" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#3fb8c8" stopOpacity="0.3" />
          <stop offset="1" stopColor="#0d4552" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        d="M20 12c10-8 22-4 30 2 8-6 20-10 30-2 12 10 10 32 4 46-4 10-6 24-8 40-1 10-9 14-13 4-3-8-5-22-13-22s-10 14-13 22c-4 10-12 6-13-4-2-16-4-30-8-40-6-14-8-36 4-46z"
        fill="url(#diente-home)"
        stroke="#9eeef5"
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />
      <path d="M34 22c6-3 12-2 16 2" fill="none" stroke="#e6fdff" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

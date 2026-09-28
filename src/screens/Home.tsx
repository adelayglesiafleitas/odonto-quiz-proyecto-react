import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoMark } from '@/components/Logo'
import { Spinner } from '@/components/Spinner'
import { SettingsToggle } from '@/components/SettingsToggle'
import { BottomNav } from '@/components/BottomNav'
import { useAppSettings } from '@/context/AppSettings'
import { getHistorialRemoto, calcularPromedio, getFechasIntentos, calcularRacha, getEstadisticasCapitulos, type EstadisticaCapitulo } from '@/lib/historial'
import { getContadorComunidad, type ContadorComunidad } from '@/lib/comunidadContador'
import { getFrases, indiceFraseAleatoria } from '@/lib/frases'
import { getBienvenida, getBienvenidaPrimeraVisita } from '@/lib/bienvenida'
import { getCtaEmpezar } from '@/lib/ctaEmpezar'
import TourBienvenida from '@/components/TourBienvenida'
import { getVioTourBienvenida, marcarTourBienvenidaVisto } from '@/lib/tourBienvenidaRemoto'
import { getMensajesPendientes, descartarMensaje, type MensajeAdmin } from '@/lib/mensajesAdminRemoto'
import { MensajeAdminBanner } from '@/components/MensajeAdminBanner'
// ENCUESTA-TEMPORAL (ver src/lib/encuestaRemoto.ts)
import { EncuestaFeedback } from '@/components/EncuestaFeedback'
import { debeMostrarEncuesta } from '@/lib/encuestaRemoto'
import { ContadorPersonas } from '@/components/ContadorComunidad'
import { useConteo } from '@/lib/useConteo'
import { listarMisTickets, suscribirseAMisTickets, type Ticket } from '@/lib/tickets'
import { RUTA_SOPORTE, rutaSoporteDetalle } from '@/lib/rutas'
import { ICONO_BIENVENIDA, ICONO_CTA } from '@/lib/temaIconos'
import { colorStrokePorcentaje } from '@/lib/utils'
import type { CursoMeta } from '@/lib/cursos'
import { LogOut, Trophy, TrendingUp, TrendingDown, Quote, Flame, BarChart3, ChevronRight, MessageCircleQuestion, X, ClipboardCheck, FileText, Clock, GraduationCap } from 'lucide-react'
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
  // Tarjetas Comunidad y Refuerza (rediseño Home 2026-09-28).
  const [capitulos, setCapitulos] = useState<EstadisticaCapitulo[]>([])
  const [comunidad, setComunidad] = useState<ContadorComunidad | null>(null)
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
  // ENCUESTA-TEMPORAL
  const [mostrarEncuesta, setMostrarEncuesta] = useState(false)
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
  const puntoDebil = elegirPuntoDebil(capitulos)

  useEffect(() => {
    let cancelado = false
    setCargandoStats(true)
    Promise.all([getHistorialRemoto(userId, cursoId), getFechasIntentos(userId, cursoId), getEstadisticasCapitulos(cursoId)]).then(
      ([historial, fechas, porCapitulo]) => {
        if (cancelado) return
        setMejor(historial.reduce((max, i) => Math.max(max, i.porcentaje), 0))
        setIntentos(historial.length)
        setPromedio(calcularPromedio(historial))
        setRacha(calcularRacha(fechas))
        setHistorialCurso(historial)
        setCapitulos(porCapitulo)
        setCargandoStats(false)
      },
    )
    return () => {
      cancelado = true
    }
  }, [userId, cursoId])

  useEffect(() => {
    let cancelado = false
    getContadorComunidad().then((d) => {
      if (!cancelado) setComunidad(d)
    })
    return () => {
      cancelado = true
    }
  }, [])

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

  // ENCUESTA-TEMPORAL — debeMostrarEncuesta decide todo (tour ya visto,
  // al menos un simulacro, sin mensajes nuevos del admin, y que no la haya
  // visto antes). Pequeña espera para que no tape la Home nada más entrar.
  useEffect(() => {
    let cancelado = false
    const timer = setTimeout(() => {
      debeMostrarEncuesta(userId).then((mostrar) => {
        if (!cancelado && mostrar) setMostrarEncuesta(true)
      })
    }, 1500)
    return () => {
      cancelado = true
      clearTimeout(timer)
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
        <div className="flex items-center justify-between gap-2">
          {/* min-w-0 + object-left: en móviles de 360 px el logo cede ancho
              (se achica sin deformarse) para que quepan el contador, el tema,
              el idioma y cerrar sesión en la misma fila. */}
          <LogoMark className="h-10 w-auto min-w-0 shrink object-left" variante="oscuro" />
          <div className="flex shrink-0 items-center gap-1.5">
            <ContadorPersonas idioma={idioma} />
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

        {/* Saludo a la izquierda y tarjeta de progreso a la derecha (diseño
            "DentiQuiz Home", 2026-09-28). Racha y mejor resultado viven ahora
            dentro de esta tarjeta; Simulacros es la fila de abajo. */}
        <div className="mt-5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-medium leading-tight">
              {t.home.hola} <span className="font-extrabold">{nombreMostrado}</span>
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-white/75">{t.home.constancia}</p>
            {resumen.tendencia !== null && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/20 px-2 py-1">
                {resumen.tendencia >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-orange-300" />
                )}
                <span className={`text-[12px] font-extrabold ${resumen.tendencia >= 0 ? 'text-emerald-300' : 'text-orange-300'}`}>
                  {resumen.tendencia >= 0 ? '+' : ''}
                  {resumen.tendencia}%
                </span>
                <span className="text-[10px] text-white/60">{t.home.estaSemana}</span>
              </div>
            )}
          </div>

          <div className="card-elevated w-[56%] max-w-[230px] shrink-0 rounded-3xl bg-white/10 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-[78px] w-[78px] shrink-0 items-center justify-center">
                {cargandoStats ? (
                  <Spinner className="h-5 w-5 text-white/70" />
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
                      <span className="text-lg font-extrabold tabular-nums">
                        {Math.round(promedioAnimado)}
                        <span className="text-[11px]">%</span>
                      </span>
                      <span className="mt-0.5 text-[8.5px] text-white/70">{t.home.tuPromedio}</span>
                    </span>
                  </>
                )}
              </div>
              <div className="min-w-0 flex-1 border-l border-white/15 pl-2.5">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-5 w-5 shrink-0 text-orange-400 drop-shadow-[0_0_6px_rgba(255,140,40,0.55)]" />
                  <div className="min-w-0 leading-tight">
                    <p className="text-[10.5px] text-white/65">{t.home.rachaActual}</p>
                    <p className="text-[14px] font-extrabold">{t.home.dias(racha)}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 border-t border-white/15 pt-2">
                  <Trophy className="h-5 w-5 shrink-0 text-amber-400 drop-shadow-[0_0_6px_rgba(255,200,60,0.5)]" />
                  <div className="min-w-0 leading-tight">
                    <p className="text-[10.5px] text-white/65">{t.home.mejorResultado}</p>
                    <p className="text-[14px] font-extrabold">{mejor}%</p>
                    <p className="truncate text-[10px] text-white/60">{t.home.meta(cursoMeta.porcentajeAprobado)}</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('historial')}
              className="mt-2.5 flex w-full items-center gap-2 border-t border-white/15 pt-2.5 text-left text-[13px] text-white transition hover:text-white/80"
            >
              <ClipboardCheck className="h-4 w-4 shrink-0 text-accent" />
              <span className="flex-1">{t.home.simulacros}</span>
              <span className="font-extrabold tabular-nums">{intentos}</span>
              <ChevronRight className="h-4 w-4 text-white/60" />
            </button>
          </div>
        </div>

        <button
          onClick={() => onNavigate('estadisticas')}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-black/15 py-3.5 text-[14px] font-bold text-white transition active:scale-[0.98] hover:bg-black/25"
        >
          <BarChart3 className="h-4 w-4" />
          {t.home.verEstadisticas}
          <ChevronRight className="h-4 w-4" />
        </button>
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
            className="relative mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-lg font-extrabold"
            style={{ background: 'var(--home-hero-btn-bg)', color: 'var(--home-hero-btn-ink)' }}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl border-2 animate-pulse-ring"
              style={{ borderColor: 'var(--home-hero-ring)' }}
            />
            {t.home.empezar}
            <ChevronRight className="h-5 w-5 animate-cta-arrow" />
          </div>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 px-6">
        {[
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

      {comunidad && comunidad.total > 0 && (
        <div className="anim-cascada mt-4 px-6" style={{ '--i': 7 } as CSSProperties}>
          <div className="card-elevated rounded-2xl bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-extrabold text-foreground">{t.home.comunidadTitulo}</p>
              {comunidad.activosHoy > 0 && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] font-bold tabular-nums text-emerald-300">{t.home.comunidadHoy(comunidad.activosHoy)}</span>
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex shrink-0 -space-x-2.5" aria-hidden="true">
                {AVATARES_COMUNIDAD.map((fondo, i) => (
                  <span key={i} className="h-9 w-9 rounded-full ring-[3px] ring-card" style={{ background: fondo, zIndex: 5 - i }} />
                ))}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary ring-[3px] ring-card">
                  <GraduationCap className="h-4 w-4 text-accent" />
                </span>
              </div>
              <p className="min-w-0 text-[13px] leading-snug text-muted-foreground">
                <span className="font-extrabold tabular-nums text-foreground">{comunidad.total.toLocaleString(idioma)}</span>{' '}
                {t.home.comunidadEstudiantes(comunidad.total)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('comunidad')}
              className="mt-3 flex w-full items-center justify-between rounded-xl bg-secondary px-3.5 py-3 text-[13px] font-bold text-accent transition active:scale-[0.98] hover:bg-secondary/70"
            >
              {t.home.comunidadEntrar}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {puntoDebil && (
        <div className="anim-cascada mt-4 px-6" style={{ '--i': 8 } as CSSProperties}>
          <button
            type="button"
            onClick={() => onNavigate('estadisticas')}
            className="card-elevated flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left transition active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-400/15 text-orange-400">
              <TrendingDown className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-orange-400">{t.home.reforzarEtiqueta}</span>
              <span className="mt-0.5 block truncate text-[15px] font-extrabold text-foreground">{puntoDebil.capitulo}</span>
              <span className="block text-[12px] text-muted-foreground">{t.home.reforzarAcierto(puntoDebil.porcentaje)}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="anim-cascada mt-4 px-6" style={{ '--i': 9 } as CSSProperties}>
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
      {/* ENCUESTA-TEMPORAL */}
      {mostrarEncuesta && !mostrarTour && (
        <EncuestaFeedback userId={userId} idioma={idioma} onCerrar={() => setMostrarEncuesta(false)} />
      )}
    </div>
  )
}

// --- Rediseño Neón: helpers de la Home -----------------------------------

const AVATARES_COMUNIDAD = [
  'linear-gradient(135deg, #2dd8d8, #12908f)',
  'linear-gradient(135deg, #a78bfa, #6d4fd1)',
  'linear-gradient(135deg, #ff8a5b, #e5576b)',
  'linear-gradient(135deg, #5ee08f, #2f7d4f)',
]

/** Capítulo con peor % de acierto (mínimo 5 preguntas para no fiarse de 1-2). */
function elegirPuntoDebil(capitulos: EstadisticaCapitulo[]) {
  const conDatos = capitulos.filter((c) => c.total >= 5)
  if (conDatos.length === 0) return null
  const peor = conDatos.reduce((a, c) => (c.correctas / c.total < a.correctas / a.total ? c : a))
  return { capitulo: peor.capitulo, porcentaje: Math.round((peor.correctas / peor.total) * 100) }
}

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

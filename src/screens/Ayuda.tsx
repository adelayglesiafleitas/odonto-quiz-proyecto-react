import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  Target,
  BookOpenCheck,
  SlidersHorizontal,
  ShieldCheck,
  ExternalLink,
  Compass,
  Flame,
  Award,
  ChevronDown,
  ChevronRight,
  MessageCircleQuestion,
  Inbox,
  Palette,
  RotateCcw,
} from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import TourBienvenida from '@/components/TourBienvenida'
import { RUTA_SOPORTE } from '@/lib/rutas'
import { listarMisTickets, contarNoLeidos, type Ticket } from '@/lib/tickets'
import type { Pantalla } from '@/types'

export function Ayuda({
  umbralAprobado,
  userId,
  onNavigate,
}: {
  umbralAprobado: number
  userId: string | null
  onNavigate: (p: Pantalla) => void
}) {
  const { t, idioma, estilo, setEstilo } = useAppSettings()
  const navigate = useNavigate()
  const formatoOficial = t.ayuda.formatoOficial

  // Solo para el resumen ("3 conversaciones · 1 sin leer") de la tarjeta de
  // abajo: la lista real vive en /ayuda/soporte (MisConsultas.tsx). Ayuda es
  // visible sin sesión iniciada (ver App.tsx), así que esto no se pide si
  // todavía no hay userId.
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  useEffect(() => {
    if (!userId) return
    let cancelado = false
    listarMisTickets(userId).then((lista) => {
      if (!cancelado) setTickets(lista)
    })
    return () => {
      cancelado = true
    }
  }, [userId])

  // Un solo acordeón abierto a la vez en toda la pantalla (no uno por sección):
  // evita que dos tarjetas largas queden abiertas juntas y la pantalla vuelva
  // a sentirse cargada. null = todo colapsado, que es el estado inicial.
  const [abierto, setAbierto] = useState<string | null>(null)
  const [mostrarTourManual, setMostrarTourManual] = useState(false)

  const items = [
    { id: 'navegacion', icon: Compass, titulo: t.ayuda.navegacionTitulo, texto: t.ayuda.navegacionTexto },
    { id: 'simulacro', icon: ClipboardList, titulo: t.ayuda.simulacroTitulo, texto: t.ayuda.simulacroTexto },
    { id: 'configurar', icon: SlidersHorizontal, titulo: t.ayuda.configurarTitulo, texto: t.ayuda.configurarTexto },
    { id: 'repasarFallos', icon: Target, titulo: t.ayuda.repasarFallosTitulo, texto: t.ayuda.repasarFallosTexto },
    { id: 'racha', icon: Flame, titulo: t.ayuda.rachaTitulo, texto: t.ayuda.rachaTexto },
    { id: 'estudio', icon: BookOpenCheck, titulo: t.ayuda.estudioTitulo, texto: t.ayuda.estudioTexto },
    { id: 'puntuacion', icon: Award, titulo: t.ayuda.puntuacionTitulo, texto: t.ayuda.puntuacionTexto(umbralAprobado) },
    { id: 'formatoOficial', icon: ShieldCheck, titulo: formatoOficial.titulo, texto: formatoOficial.texto },
  ]

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <h1 className="mt-6 text-lg font-extrabold text-foreground">{t.ayuda.titulo}</h1>

      {/* Sección 0: apariencia. Comparte el mismo acordeón "un solo abierto a
          la vez" que las tarjetas de abajo (id 'estilo'), para no sumar otro
          estado de UI. Pensada para crecer: un estilo nuevo es una fila más
          acá y un bloque de variables CSS bajo .estilo-<nombre> en index.css
          (ver claude/cta-empieza-ya-home.md y el tema Acqua en Home.tsx). */}
      <div className="mt-5 space-y-2">
        <div className="card-elevated overflow-hidden rounded-2xl bg-card">
          <button
            onClick={() => setAbierto(abierto === 'estilo' ? null : 'estilo')}
            className="flex w-full items-center gap-3 p-4 text-left"
            aria-expanded={abierto === 'estilo'}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-foreground">{t.ayuda.estiloTitulo}</p>
              <p className="text-xs text-muted-foreground">{t.ayuda.estiloSubtitulo}</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                abierto === 'estilo' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {abierto === 'estilo' && (
            <div className="space-y-1 border-t border-border p-2">
              <button
                onClick={() => setEstilo('clasico')}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                  estilo === 'clasico' ? 'bg-secondary' : ''
                }`}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #123a3f, #0d2233)' }}
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{t.ayuda.estiloClasicoNombre}</p>
                  <p className="text-xs text-muted-foreground">{t.ayuda.estiloClasicoDesc}</p>
                </div>
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                    estilo === 'clasico' ? 'border-accent' : 'border-border'
                  }`}
                >
                  {estilo === 'clasico' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
              </button>

              <button
                onClick={() => setEstilo('acqua')}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                  estilo === 'acqua' ? 'bg-secondary' : ''
                }`}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #8fe3f2, #1fb6cf 60%, #0d7f96)' }}
                />
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    {t.ayuda.estiloAcquaNombre}
                    <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                      {t.ayuda.estiloNuevo}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{t.ayuda.estiloAcquaDesc}</p>
                </div>
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                    estilo === 'acqua' ? 'border-accent' : 'border-border'
                  }`}
                >
                  {estilo === 'acqua' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
              </button>

              <button
                onClick={() => setEstilo('electrico')}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                  estilo === 'electrico' ? 'bg-secondary' : ''
                }`}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #b026ff, #00e5ff)' }}
                />
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    {t.ayuda.estiloElectricoNombre}
                    <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                      {t.ayuda.estiloNuevo}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{t.ayuda.estiloElectricoDesc}</p>
                </div>
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                    estilo === 'electrico' ? 'border-accent' : 'border-border'
                  }`}
                >
                  {estilo === 'electrico' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
              </button>
              <button
                onClick={() => setEstilo('rockpop')}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                  estilo === 'rockpop' ? 'bg-secondary' : ''
                }`}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #161616 0%, #161616 45%, #ff2e63 45%, #ff2e63 72%, #ffe93a 72%)' }}
                />
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    {t.ayuda.estiloRockpopNombre}
                    <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                      {t.ayuda.estiloNuevo}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{t.ayuda.estiloRockpopDesc}</p>
                </div>
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                    estilo === 'rockpop' ? 'border-accent' : 'border-border'
                  }`}
                >
                  {estilo === 'rockpop' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
              </button>
              <button
                onClick={() => setEstilo('fresita')}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                  estilo === 'fresita' ? 'bg-secondary' : ''
                }`}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #ff8fa3, #ff4d6d, #c9184a)' }}
                />
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    {t.ayuda.estiloFresitaNombre}
                    <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                      {t.ayuda.estiloNuevo}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{t.ayuda.estiloFresitaDesc}</p>
                </div>
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                    estilo === 'fresita' ? 'border-accent' : 'border-border'
                  }`}
                >
                  {estilo === 'fresita' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
              </button>
              <button
                onClick={() => setEstilo('galaxia')}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                  estilo === 'galaxia' ? 'bg-secondary' : ''
                }`}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899 60%, #22d3ee)' }}
                />
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    {t.ayuda.estiloGalaxiaNombre}
                    <span className="rounded-md bg-accent/15 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-accent">
                      {t.ayuda.estiloNuevo}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{t.ayuda.estiloGalaxiaDesc}</p>
                </div>
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                    estilo === 'galaxia' ? 'border-accent' : 'border-border'
                  }`}
                >
                  {estilo === 'galaxia' && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
                </span>
              </button>

              <div className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left opacity-50">
                <span
                  className="h-9 w-9 shrink-0 rounded-lg"
                  style={{
                    background:
                      'repeating-linear-gradient(45deg, hsl(var(--muted)), hsl(var(--muted)) 6px, hsl(var(--border)) 6px, hsl(var(--border)) 12px)',
                  }}
                />
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    {t.ayuda.estiloMasEstilos}
                    <span className="rounded-md bg-muted px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-muted-foreground">
                      {t.ayuda.proximamente}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{t.ayuda.estiloMasEstilosDesc}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setMostrarTourManual(true)}
          className="card-elevated flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <RotateCcw className="h-5 w-5" />
          </span>
          <p className="flex-1 text-[15px] font-bold text-foreground">
            {idioma === 'en' ? 'Watch welcome tour again' : 'Ver tour de bienvenida de nuevo'}
          </p>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </div>

      {/* Sección 1: guía de uso, colapsada por defecto (2026-08-22). Antes eran
          8 tarjetas siempre abiertas de golpe; ahora cada una se despliega al
          tocarla y se cierra cualquier otra abierta, para que la pantalla no
          se sienta tan cargada al entrar. */}
      <p className="mt-5 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {t.ayuda.seccionUsarApp}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          const expandido = abierto === item.id
          return (
            <div key={item.id} className="card-elevated overflow-hidden rounded-2xl bg-card">
              <button
                onClick={() => setAbierto(expandido ? null : item.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
                aria-expanded={expandido}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="flex-1 text-[15px] font-bold text-foreground">{item.titulo}</p>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    expandido ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandido && (
                <div className="px-4 pb-4 pl-[3.25rem]">
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.texto}</p>
                  {item.id === 'formatoOficial' && formatoOficial.enlace && (
                    <a
                      href={formatoOficial.enlace.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      {formatoOficial.enlace.texto}
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sección 2: atención al cliente. Tickets reales sobre las tablas
          `tickets`/`mensajes` (ver claude/atencion-cliente-diseno.md). Ayuda
          es visible sin sesión iniciada, pero estas dos tarjetas navegan a
          /ayuda/soporte, que sí está protegida — si no hay sesión, redirige
          a login antes de mostrar nada. */}
      <p className="mt-6 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {t.ayuda.seccionAtencionCliente}
      </p>
      <div className="mt-2 space-y-2">
        <button
          onClick={() => navigate(RUTA_SOPORTE, { state: { abrirNuevo: true } })}
          className="card-elevated flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <MessageCircleQuestion className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-foreground">{t.ayuda.escribirSoporteTitulo}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.ayuda.escribirSoporteTexto}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate(RUTA_SOPORTE)}
          className="card-elevated flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
            <Inbox className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-foreground">{t.ayuda.misConsultasTitulo}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t.ayuda.misConsultasResumen(tickets?.length ?? 0, tickets ? contarNoLeidos(tickets) : 0)}
            </p>
          </div>
          {tickets && contarNoLeidos(tickets) > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-extrabold text-accent-foreground">
              {contarNoLeidos(tickets)}
            </span>
          )}
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </div>

      <div className="card-elevated mt-4 rounded-2xl bg-secondary p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{t.ayuda.footer}</p>
      </div>

      {mostrarTourManual && (
        <TourBienvenida idioma={idioma} onCerrar={() => setMostrarTourManual(false)} />
      )}
      <BottomNav activo="ayuda" onNavigate={onNavigate} />
    </div>
  )
}

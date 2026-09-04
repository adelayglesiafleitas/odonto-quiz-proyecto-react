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
  RotateCcw,
  X,
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
  const { t, idioma } = useAppSettings()
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

  // Un solo acordeón abierto a la vez adentro del modal "Usar la app" (no uno
  // por tarjeta): evita que dos guías largas queden abiertas juntas. null =
  // todo colapsado, que es el estado inicial cada vez que se abre el modal.
  const [abierto, setAbierto] = useState<string | null>(null)
  const [mostrarTourManual, setMostrarTourManual] = useState(false)

  // "Usar la app" y "Atención al cliente" (2026-08-30): antes eran dos
  // secciones siempre desplegadas en la pantalla (8 + 2 tarjetas); ahora cada
  // una es una sola tarjeta resumen que abre su contenido en una ventana
  // (mismo patrón bottom-sheet que ya usan NuevaConsultaModal/ReportarPregunta),
  // para que Ayuda no se sienta tan cargada al entrar.
  const [modalUsarApp, setModalUsarApp] = useState(false)
  const [modalAtencion, setModalAtencion] = useState(false)

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

  const cerrarModalUsarApp = () => {
    setModalUsarApp(false)
    setAbierto(null)
  }

  const irASoporte = (abrirNuevo: boolean) => {
    setModalAtencion(false)
    navigate(RUTA_SOPORTE, abrirNuevo ? { state: { abrirNuevo: true } } : undefined)
  }

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <h1 className="mt-6 text-lg font-extrabold text-foreground">{t.ayuda.titulo}</h1>

      <div className="mt-5 space-y-2">
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

        {/* Resumen de "Usar la app" (2026-08-30, ver claude/panel-revision-admin.md
            y el mismo cambio en Config para "Estilo de la app"): el contenido
            real (8 guías con acordeón) vive en el modal de más abajo. */}
        <button
          onClick={() => setModalUsarApp(true)}
          className="card-elevated flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Compass className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-foreground">{t.ayuda.seccionUsarApp}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.ayuda.usarAppSubtitulo(items.length)}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>

        {/* Resumen de "Atención al cliente": el contenido real (escribir a
            soporte + mis consultas) vive en el modal de más abajo. Ayuda es
            visible sin sesión iniciada, pero esas dos acciones navegan a
            /ayuda/soporte, que sí está protegida — si no hay sesión, redirige
            a login antes de mostrar nada. */}
        <button
          onClick={() => setModalAtencion(true)}
          className="card-elevated flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <MessageCircleQuestion className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-foreground">{t.ayuda.seccionAtencionCliente}</p>
            <p className="mt-1 text-xs text-muted-foreground">
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

      {modalUsarApp && (
        <div
          className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={cerrarModalUsarApp}
        >
          <div
            className="card-elevated flex w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-card"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-base font-bold text-foreground">{t.ayuda.seccionUsarApp}</p>
              <button
                onClick={cerrarModalUsarApp}
                aria-label={t.ayuda.cerrar}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-secondary/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto p-3">
              {items.map((item) => {
                const Icon = item.icon
                const expandido = abierto === item.id
                return (
                  <div key={item.id} className="overflow-hidden rounded-2xl bg-background">
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
          </div>
        </div>
      )}

      {modalAtencion && (
        <div
          className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setModalAtencion(false)}
        >
          <div
            className="card-elevated w-full max-w-sm overflow-hidden rounded-3xl bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-base font-bold text-foreground">{t.ayuda.seccionAtencionCliente}</p>
              <button
                onClick={() => setModalAtencion(false)}
                aria-label={t.ayuda.cerrar}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition hover:bg-secondary/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2 p-3">
              <button
                onClick={() => irASoporte(true)}
                className="flex w-full items-center gap-3 rounded-2xl bg-background p-4 text-left"
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
                onClick={() => irASoporte(false)}
                className="flex w-full items-center gap-3 rounded-2xl bg-background p-4 text-left"
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
          </div>
        </div>
      )}

      <BottomNav activo="ayuda" onNavigate={onNavigate} />
    </div>
  )
}

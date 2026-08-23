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
} from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
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
  const { t } = useAppSettings()
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

      <BottomNav activo="ayuda" onNavigate={onNavigate} />
    </div>
  )
}

import { useState } from 'react'
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
  MessageCircleQuestion,
  Inbox,
} from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import type { Pantalla } from '@/types'

export function Ayuda({
  umbralAprobado,
  onNavigate,
}: {
  umbralAprobado: number
  onNavigate: (p: Pantalla) => void
}) {
  const { t } = useAppSettings()
  const formatoOficial = t.ayuda.formatoOficial

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

      {/* Sección 2: atención al cliente (2026-08-22). Por ahora son tarjetas
          informativas, no filas de navegación: todavía no existe la pantalla
          ni el backend de tickets detrás, así que no se simula un enlace que
          no lleva a ningún lado. Cuando se implemente el flujo de soporte
          real, estas dos pasan a ser botones que navegan a /ayuda/soporte y
          /ayuda/soporte/:id. */}
      <p className="mt-6 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {t.ayuda.seccionAtencionCliente}
      </p>
      <div className="mt-2 space-y-2">
        {[
          { icon: MessageCircleQuestion, titulo: t.ayuda.escribirSoporteTitulo, texto: t.ayuda.escribirSoporteTexto },
          { icon: Inbox, titulo: t.ayuda.misConsultasTitulo, texto: t.ayuda.misConsultasTexto },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.titulo} className="card-elevated flex items-start gap-3 rounded-2xl bg-card p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-foreground">{item.titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.texto}</p>
              </div>
              <span className="mt-0.5 shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {t.ayuda.proximamente}
              </span>
            </div>
          )
        })}
      </div>

      <div className="card-elevated mt-4 rounded-2xl bg-secondary p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{t.ayuda.footer}</p>
      </div>

      <BottomNav activo="ayuda" onNavigate={onNavigate} />
    </div>
  )
}

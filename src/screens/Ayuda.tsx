import { ClipboardList, Target, BookOpenCheck, SlidersHorizontal, ShieldCheck, ExternalLink, Compass, Flame, Award } from 'lucide-react'
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

  const items = [
    { icon: Compass, titulo: t.ayuda.navegacionTitulo, texto: t.ayuda.navegacionTexto },
    { icon: ClipboardList, titulo: t.ayuda.simulacroTitulo, texto: t.ayuda.simulacroTexto },
    { icon: SlidersHorizontal, titulo: t.ayuda.configurarTitulo, texto: t.ayuda.configurarTexto },
    { icon: Target, titulo: t.ayuda.repasarFallosTitulo, texto: t.ayuda.repasarFallosTexto },
    { icon: Flame, titulo: t.ayuda.rachaTitulo, texto: t.ayuda.rachaTexto },
    { icon: BookOpenCheck, titulo: t.ayuda.estudioTitulo, texto: t.ayuda.estudioTexto },
    { icon: Award, titulo: t.ayuda.puntuacionTitulo, texto: t.ayuda.puntuacionTexto(umbralAprobado) },
    { icon: ShieldCheck, titulo: formatoOficial.titulo, texto: formatoOficial.texto },
  ]

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <h1 className="mt-6 text-lg font-extrabold text-foreground">{t.ayuda.titulo}</h1>

      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.titulo} className="card-elevated rounded-2xl bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-[15px] font-bold text-foreground">{item.titulo}</p>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.texto}</p>
            </div>
          )
        })}

        {formatoOficial.enlace && (
          <a
            href={formatoOficial.enlace.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-elevated flex items-center gap-2 rounded-2xl bg-accent/10 p-4 text-sm font-semibold text-accent transition hover:bg-accent/15"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {formatoOficial.enlace.texto}
          </a>
        )}
      </div>

      <div className="card-elevated mt-4 rounded-2xl bg-secondary p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{t.ayuda.footer}</p>
      </div>

      <BottomNav activo="ayuda" onNavigate={onNavigate} />
    </div>
  )
}

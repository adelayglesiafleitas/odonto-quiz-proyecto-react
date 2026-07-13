import { LogoMark } from '@/components/Logo'
import { SettingsToggle } from '@/components/SettingsToggle'
import { useAppSettings } from '@/context/AppSettings'
import { getHistorial, getPromedio } from '@/lib/data'
import {
  ClipboardList,
  SlidersHorizontal,
  BookOpenCheck,
  HelpCircle,
  ChevronRight,
  LogOut,
  Trophy,
  TrendingUp,
} from 'lucide-react'
import type { Pantalla } from '@/types'

export function Home({
  onNavigate,
  onIniciarSimulacro,
  onLogout,
}: {
  onNavigate: (p: Pantalla) => void
  onIniciarSimulacro: () => void
  onLogout: () => void
}) {
  const { t } = useAppSettings()
  const historial = getHistorial()
  const promedio = getPromedio()
  const mejor = historial.reduce((max, i) => Math.max(max, i.porcentaje), 0)

  const opciones: {
    id: Pantalla | 'simulacro'
    titulo: string
    descripcion: string
    icon: typeof ClipboardList
    tono: 'accent' | 'primary' | 'success' | 'muted'
  }[] = [
    {
      id: 'simulacro',
      titulo: t.home.simulacroTitulo,
      descripcion: t.home.simulacroDesc,
      icon: ClipboardList,
      tono: 'accent',
    },
    {
      id: 'configurar',
      titulo: t.home.configurarTitulo,
      descripcion: t.home.configurarDesc,
      icon: SlidersHorizontal,
      tono: 'primary',
    },
    {
      id: 'estudio',
      titulo: t.home.estudioTitulo,
      descripcion: t.home.estudioDesc,
      icon: BookOpenCheck,
      tono: 'success',
    },
    {
      id: 'ayuda',
      titulo: t.home.ayudaTitulo,
      descripcion: t.home.ayudaDesc,
      icon: HelpCircle,
      tono: 'muted',
    },
  ]

  const tonos: Record<string, string> = {
    accent: 'bg-accent/12 text-accent',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/12 text-success',
    muted: 'bg-muted text-muted-foreground',
  }

  return (
    <div className="app-shell bg-background pb-10">
      <div className="brand-gradient rounded-b-[32px] px-6 pb-8 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <div>
              <p className="text-xs text-white/60">{t.home.hola}</p>
              <p className="-mt-0.5 text-[15px] font-bold">{t.home.estudiante}</p>
            </div>
          </div>
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

        <div className="card-elevated mt-6 rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
          <p className="text-xs font-medium text-white/70">{t.home.progreso}</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-3xl font-extrabold leading-none">{promedio}%</p>
              <p className="mt-1.5 text-[11px] text-white/60">{t.home.promedioSufijo(historial.length)}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 text-right">
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                <Trophy className="h-3.5 w-3.5 text-[#ffd166]" />
                <span className="text-xs font-semibold">{mejor}% {t.home.mejorPuntaje}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#1fc6c6]" />
                <span className="text-xs font-semibold">{t.home.meta}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 px-6">
        <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.home.empezar}</p>
        {opciones.map((op, idx) => {
          const Icon = op.icon
          return (
            <button
              key={op.titulo}
              onClick={() => (op.id === 'simulacro' ? onIniciarSimulacro() : onNavigate(op.id as Pantalla))}
              className="card-elevated flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left transition active:scale-[0.98]"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tonos[op.tono]}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-foreground">{op.titulo}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{op.descripcion}</p>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { LogoMark } from '@/components/Logo'
import { SettingsToggle } from '@/components/SettingsToggle'
import { useAppSettings } from '@/context/AppSettings'
import { getAnios, getHistorial, getPromedio } from '@/lib/data'
import type { CursoMeta } from '@/lib/cursos'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  SlidersHorizontal,
  BookOpenCheck,
  HelpCircle,
  ChevronRight,
  LogOut,
  Trophy,
  TrendingUp,
  Timer,
  TimerOff,
  Play,
  CalendarDays,
  ArrowLeftRight,
} from 'lucide-react'
import type { Pantalla } from '@/types'

const DURACIONES = [15, 30, 40, 45, 60, 90]

export function Home({
  cursoId,
  cursoMeta,
  onNavigate,
  onIniciarSimulacro,
  onCambiarCurso,
  onLogout,
}: {
  cursoId: string
  cursoMeta: CursoMeta
  onNavigate: (p: Pantalla) => void
  onIniciarSimulacro: (tiempoLimiteMinutos: number | null, anio: number | 'todos') => void
  onCambiarCurso: () => void
  onLogout: () => void
}) {
  const { t } = useAppSettings()
  const historial = getHistorial(cursoId)
  const promedio = getPromedio(cursoId)
  const mejor = historial.reduce((max, i) => Math.max(max, i.porcentaje), 0)
  const anios = getAnios(cursoId)
  const nombreCurso = t.cursos[cursoId as 'odontologia' | 'nacionalidad' | 'conducir']?.nombre ?? t.home.estudiante

  const [mostrarModal, setMostrarModal] = useState(false)
  const [conTiempo, setConTiempo] = useState(false)
  const [duracion, setDuracion] = useState(cursoMeta.duracionOficialMinutos)
  const [anio, setAnio] = useState<number | 'todos'>('todos')

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
      descripcion: t.home.simulacroDesc(cursoMeta.cantidadOficial, cursoMeta.porcentajeAprobado),
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

  function confirmarSimulacro() {
    setMostrarModal(false)
    onIniciarSimulacro(conTiempo ? duracion : null, cursoMeta.tieneConvocatorias ? anio : 'todos')
  }

  return (
    <div className="app-shell bg-background pb-10">
      <div className="brand-gradient rounded-b-[32px] px-6 pb-8 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <div>
              <p className="text-xs text-white/60">{t.home.hola}</p>
              <p className="-mt-0.5 text-[15px] font-bold">{nombreCurso}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SettingsToggle variante="oscuro" />
            <button
              onClick={onCambiarCurso}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
              aria-label={t.home.cambiarCurso}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
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
                <span className="text-xs font-semibold">{t.home.meta(cursoMeta.porcentajeAprobado)}</span>
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
              onClick={() => (op.id === 'simulacro' ? setMostrarModal(true) : onNavigate(op.id as Pantalla))}
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

      {mostrarModal && (
        <div className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="card-elevated w-full max-w-sm rounded-3xl bg-card p-6">
            <h3 className="text-base font-bold text-foreground">{t.home.modalTitulo}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{t.home.modalSubtitulo(cursoMeta.cantidadOficial)}</p>

            {cursoMeta.tieneConvocatorias && (
              <div className="mt-4 space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {t.home.modalAnio}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setAnio('todos')}
                    className={`card-elevated rounded-xl py-2.5 text-center text-xs font-bold transition ${
                      anio === 'todos' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                    }`}
                  >
                    {t.configurar.todosAnios}
                  </button>
                  {anios.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAnio(a)}
                      className={`card-elevated rounded-xl py-2.5 text-center text-xs font-bold transition ${
                        anio === a ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setConTiempo(false)}
                className={`card-elevated flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition ${
                  !conTiempo ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                }`}
              >
                <TimerOff className="h-4 w-4" />
                {t.configurar.sinTiempo}
              </button>
              <button
                onClick={() => setConTiempo(true)}
                className={`card-elevated flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition ${
                  conTiempo ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                }`}
              >
                <Timer className="h-4 w-4" />
                {t.configurar.conTiempo}
              </button>
            </div>

            {conTiempo && (
              <div className="animate-float-up mt-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">{t.configurar.duracion}</p>
                <div className="grid grid-cols-3 gap-2">
                  {DURACIONES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuracion(d)}
                      className={`card-elevated rounded-xl py-2.5 text-center text-xs font-bold transition ${
                        duracion === d ? 'accent-gradient text-white' : 'bg-secondary text-foreground'
                      }`}
                    >
                      {d}m{d === cursoMeta.duracionOficialMinutos ? ` (${t.configurar.duracionOficial})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setMostrarModal(false)}>
                {t.comun.cancelar}
              </Button>
              <Button
                className="h-11 flex-1 rounded-xl bg-primary font-bold hover:bg-primary/90"
                onClick={confirmarSimulacro}
              >
                <Play className="mr-1.5 h-4 w-4" />
                {t.home.comenzarSimulacro}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

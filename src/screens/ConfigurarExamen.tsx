import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, BookMarked, Hash, Timer, TimerOff } from 'lucide-react'
import { getCapitulos, PREGUNTAS } from '@/lib/data'
import { getConfigExamenGuardada, guardarConfigExamen } from '@/lib/settings'
import { useAppSettings } from '@/context/AppSettings'

const CANTIDADES = [10, 20, 30, 40]
const DURACIONES = [15, 30, 45, 60, 90]

export function ConfigurarExamen({
  onBack,
  onIniciar,
}: {
  onBack: () => void
  onIniciar: (cantidad: number, capitulo: string, tiempoLimiteMinutos: number | null) => void
}) {
  const { t } = useAppSettings()
  const capitulos = getCapitulos()
  const guardada = getConfigExamenGuardada()
  const [cantidad, setCantidad] = useState(guardada.cantidad)
  const [capitulo, setCapitulo] = useState<string>(guardada.capitulo)
  const [conTiempo, setConTiempo] = useState(guardada.conTiempo)
  const [duracion, setDuracion] = useState(guardada.duracion)

  const disponibles = capitulo === 'todos' ? PREGUNTAS.length : PREGUNTAS.filter((p) => p.capitulo === capitulo).length

  function iniciar() {
    guardarConfigExamen({ cantidad, capitulo, conTiempo, duracion })
    onIniciar(cantidad, capitulo, conTiempo ? duracion : null)
  }

  return (
    <div className="app-shell bg-background px-6 pb-32 pt-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.configurar.titulo}</h1>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Hash className="h-3.5 w-3.5" />
          {t.configurar.cantidadPreguntas}
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {CANTIDADES.map((c) => (
            <button
              key={c}
              onClick={() => setCantidad(c)}
              className={`card-elevated rounded-2xl py-3.5 text-center text-sm font-bold transition ${
                cantidad === c ? 'accent-gradient text-white' : 'bg-card text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 space-y-3">
        <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          {t.configurar.conLimite}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setConTiempo(false)}
            className={`card-elevated flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition ${
              !conTiempo ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
            }`}
          >
            <TimerOff className="h-4 w-4" />
            {t.configurar.sinTiempo}
          </button>
          <button
            onClick={() => setConTiempo(true)}
            className={`card-elevated flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition ${
              conTiempo ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
            }`}
          >
            <Timer className="h-4 w-4" />
            {t.configurar.conTiempo}
          </button>
        </div>

        {conTiempo && (
          <div className="animate-float-up space-y-2 pt-1">
            <p className="px-1 text-xs font-semibold text-muted-foreground">{t.configurar.duracion}</p>
            <div className="grid grid-cols-5 gap-2">
              {DURACIONES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuracion(d)}
                  className={`card-elevated rounded-xl py-2.5 text-center text-xs font-bold transition ${
                    duracion === d ? 'accent-gradient text-white' : 'bg-card text-foreground'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-7 space-y-3">
        <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <BookMarked className="h-3.5 w-3.5" />
          {t.configurar.capitulo}
        </div>
        <div className="space-y-2">
          <button
            onClick={() => setCapitulo('todos')}
            className={`card-elevated flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition ${
              capitulo === 'todos' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
            }`}
          >
            {t.configurar.todosCapitulos}
            <span className={capitulo === 'todos' ? 'text-white/70' : 'text-muted-foreground'}>
              {PREGUNTAS.length} {t.configurar.preguntas}
            </span>
          </button>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {capitulos.map((cap) => {
              const n = PREGUNTAS.filter((p) => p.capitulo === cap).length
              return (
                <button
                  key={cap}
                  onClick={() => setCapitulo(cap)}
                  className={`card-elevated flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition ${
                    capitulo === cap ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                  }`}
                >
                  <span className="truncate pr-2">{cap}</span>
                  <span className={`shrink-0 ${capitulo === cap ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {n}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <Button
          onClick={iniciar}
          disabled={disponibles === 0}
          className="h-12 w-full rounded-2xl bg-primary text-[15px] font-bold hover:bg-primary/90"
        >
          <Play className="mr-2 h-4 w-4" />
          {t.configurar.comenzar} ({Math.min(cantidad, disponibles)} {t.configurar.preguntas}
          {conTiempo ? ` · ${duracion} min` : ''})
        </Button>
      </div>
    </div>
  )
}

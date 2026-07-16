import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, BookMarked, Hash, Timer, TimerOff, CalendarDays } from 'lucide-react'
import { getAnios, getCapitulos, getPreguntas } from '@/lib/data'
import { getConfigExamenRemota, guardarConfigExamenRemota } from '@/lib/configExamen'
import { useAppSettings } from '@/context/AppSettings'
import type { CursoMeta } from '@/lib/cursos'

const DURACIONES = [15, 30, 40, 45, 60, 90]

export function ConfigurarExamen({
  userId,
  cursoId,
  cursoMeta,
  onBack,
  onIniciar,
}: {
  userId: string
  cursoId: string
  cursoMeta: CursoMeta
  onBack: () => void
  onIniciar: (cantidad: number, capitulo: string, tiempoLimiteMinutos: number | null, anio: number | 'todos') => void
}) {
  const { t } = useAppSettings()
  const preguntas = getPreguntas(cursoId)
  const capitulos = getCapitulos(cursoId)
  const anios = getAnios(cursoId)
  const [cantidad, setCantidad] = useState(cursoMeta.cantidadOficial)
  const [capitulo, setCapitulo] = useState<string>('todos')
  const [anio, setAnio] = useState<number | 'todos'>('todos')
  const [conTiempo, setConTiempo] = useState(false)
  const [duracion, setDuracion] = useState(cursoMeta.duracionOficialMinutos)

  useEffect(() => {
    let cancelado = false
    getConfigExamenRemota(userId, cursoId, cursoMeta.cantidadOficial, cursoMeta.duracionOficialMinutos).then((guardada) => {
      if (cancelado) return
      setCantidad(guardada.cantidad)
      setCapitulo(guardada.capitulo)
      setAnio(cursoMeta.tieneConvocatorias ? guardada.anio : 'todos')
      setConTiempo(guardada.conTiempo)
      setDuracion(guardada.duracion)
    })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, cursoId])

  const disponibles = preguntas.filter(
    (p) => (capitulo === 'todos' || p.capitulo === capitulo) && (anio === 'todos' || p.anio === anio),
  ).length

  function iniciar() {
    guardarConfigExamenRemota(userId, cursoId, { cantidad, capitulo, anio, conTiempo, duracion })
    onIniciar(cantidad, capitulo, conTiempo ? duracion : null, anio)
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
          {cursoMeta.cantidadesDisponibles.map((c) => (
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
            <div className="grid grid-cols-3 gap-2">
              {DURACIONES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuracion(d)}
                  className={`card-elevated rounded-xl py-2.5 text-center text-xs font-bold transition ${
                    duracion === d ? 'accent-gradient text-white' : 'bg-card text-foreground'
                  }`}
                >
                  {d}m{d === cursoMeta.duracionOficialMinutos ? ` (${t.configurar.duracionOficial})` : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {cursoMeta.tieneConvocatorias && (
        <div className="mt-7 space-y-3">
          <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {t.configurar.anio}
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={() => setAnio('todos')}
              className={`card-elevated rounded-2xl py-3 text-center text-xs font-bold transition ${
                anio === 'todos' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
              }`}
            >
              {t.configurar.todosAnios}
            </button>
            {anios.map((a) => (
              <button
                key={a}
                onClick={() => setAnio(a)}
                className={`card-elevated rounded-2xl py-3 text-center text-xs font-bold transition ${
                  anio === a ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

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
              {preguntas.filter((p) => anio === 'todos' || p.anio === anio).length} {t.configurar.preguntas}
            </span>
          </button>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {capitulos.map((cap) => {
              const n = preguntas.filter((p) => p.capitulo === cap && (anio === 'todos' || p.anio === anio)).length
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

      <div className="safe-bottom fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
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

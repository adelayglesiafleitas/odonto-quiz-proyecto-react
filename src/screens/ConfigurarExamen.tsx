import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/Spinner'
import {
  ArrowLeft,
  Play,
  BookMarked,
  Hash,
  Timer,
  TimerOff,
  CalendarDays,
  Check,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react'
import { getAnios, getCapitulos, getPreguntas } from '@/lib/data'
import { getConfigExamenRemota, guardarConfigExamenRemota } from '@/lib/configExamen'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import type { CursoMeta } from '@/lib/cursos'
import type { Pantalla } from '@/types'

const DURACIONES = [15, 30, 40, 45, 60, 90]

export function ConfigurarExamen({
  userId,
  cursoId,
  cursoMeta,
  onBack,
  onNavigate,
  onIniciar,
}: {
  userId: string
  cursoId: string
  cursoMeta: CursoMeta
  onBack: () => void
  onNavigate: (p: Pantalla) => void
  onIniciar: (cantidad: number, capitulos: string[], tiempoLimiteMinutos: number | null, anio: number | 'todos') => void
}) {
  const { t } = useAppSettings()
  const preguntas = getPreguntas(cursoId)
  const todosLosCapitulos = getCapitulos(cursoId)
  const anios = getAnios(cursoId)
  const [cantidad, setCantidad] = useState(cursoMeta.cantidadOficial)
  // Array vacío = "todos los capítulos"; con elementos, el examen combina
  // las preguntas de todos los capítulos elegidos (no es excluyente como
  // antes, que solo dejaba elegir uno o todos).
  const [capitulos, setCapitulos] = useState<string[]>([])
  const [anio, setAnio] = useState<number | 'todos'>('todos')
  const [conTiempo, setConTiempo] = useState(false)
  const [duracion, setDuracion] = useState(cursoMeta.duracionOficialMinutos)
  const [cargandoConfig, setCargandoConfig] = useState(true)
  // La pantalla siempre abre en modo "oficial" (colapsado), sin importar qué
  // haya quedado guardado la última vez — personalizando solo se activa
  // cuando el usuario toca "Personalizar" en esta visita.
  const [personalizando, setPersonalizando] = useState(false)

  useEffect(() => {
    let cancelado = false
    setCargandoConfig(true)
    getConfigExamenRemota(userId, cursoId, cursoMeta.cantidadOficial, cursoMeta.duracionOficialMinutos).then((guardada) => {
      if (cancelado) return
      setCantidad(guardada.cantidad)
      setCapitulos(guardada.capitulos)
      setAnio(cursoMeta.tieneConvocatorias ? guardada.anio : 'todos')
      setConTiempo(guardada.conTiempo)
      setDuracion(guardada.duracion)
      setCargandoConfig(false)
    })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, cursoId])

  const disponibles = preguntas.filter(
    (p) => (capitulos.length === 0 || capitulos.includes(p.capitulo)) && (anio === 'todos' || p.anio === anio),
  ).length

  function iniciar() {
    guardarConfigExamenRemota(userId, cursoId, { cantidad, capitulos, anio, conTiempo, duracion })
    onIniciar(cantidad, capitulos, conTiempo ? duracion : null, anio)
  }

  // Atajo del modo "oficial": arranca siempre con los valores de la ley
  // (cantidad y duración oficiales, todos los capítulos), sin tocar ni
  // pisar la configuración personalizada que el usuario tenga guardada.
  function iniciarOficial() {
    onIniciar(cursoMeta.cantidadOficial, [], cursoMeta.duracionOficialMinutos, 'todos')
  }

  function restablecer() {
    setCantidad(cursoMeta.cantidadOficial)
    setCapitulos([])
    setAnio('todos')
    setConTiempo(true)
    setDuracion(cursoMeta.duracionOficialMinutos)
  }

  function toggleCapitulo(cap: string) {
    setCapitulos((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]))
  }

  return (
    <div className="app-shell bg-background px-6 pb-56 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.configurar.titulo}</h1>
        {cargandoConfig && <Spinner className="h-4 w-4 text-muted-foreground" />}
      </div>

      {!personalizando ? (
        <>
          {/* Modo oficial: la vista por defecto. Un solo vistazo de las
              condiciones reales del examen y un botón para arrancar ya. */}
          <div className="card-elevated mt-5 flex flex-col items-center gap-3.5 rounded-[20px] bg-card px-5 py-6 text-center">
            <span className="accent-gradient flex h-14 w-14 items-center justify-center rounded-full text-white">
              <ClipboardCheck className="h-6 w-6" />
            </span>
            <div className="space-y-1.5">
              <h2 className="text-[17px] font-extrabold text-foreground">{t.configurar.heroTitulo}</h2>
              <p className="mx-auto max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
                {t.configurar.heroDescripcion}
              </p>
            </div>
            <div className="grid w-full grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary px-1 py-3">
                <Hash className="h-4 w-4 text-primary" />
                <span className="text-sm font-extrabold text-foreground">{cursoMeta.cantidadOficial}</span>
                <span className="text-[10px] text-muted-foreground">{t.configurar.preguntas}</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary px-1 py-3">
                <Timer className="h-4 w-4 text-primary" />
                <span className="text-sm font-extrabold text-foreground">{cursoMeta.duracionOficialMinutos} min</span>
                <span className="text-[10px] text-muted-foreground">{t.configurar.heroDuracionEtiqueta}</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary px-1 py-3">
                <BookMarked className="h-4 w-4 text-primary" />
                <span className="text-sm font-extrabold text-foreground">{t.configurar.heroTodos}</span>
                <span className="text-[10px] text-muted-foreground">{t.configurar.heroCapitulosEtiqueta}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPersonalizando(true)}
            className="card-elevated mt-4 flex w-full items-center justify-between rounded-2xl bg-card px-4 py-3.5 text-left"
          >
            <span className="flex items-center gap-2.5 text-sm font-bold text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {t.configurar.personalizarBoton}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </>
      ) : (
        <div className="animate-float-up">
          {/* Modo personalizado: misma franja de contexto + los mismos
              controles de siempre, ahora detrás de "Personalizar". */}
          <div className="card-elevated mt-5 flex items-center gap-2.5 rounded-2xl bg-card px-4 py-3.5">
            <span className="accent-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-extrabold text-foreground">{t.configurar.personalizandoTitulo}</p>
              <p className="truncate text-xs text-muted-foreground">
                {t.configurar.personalizandoBase(cursoMeta.cantidadOficial, cursoMeta.duracionOficialMinutos)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setPersonalizando(false)}
            className="card-elevated mt-4 flex w-full items-center justify-between rounded-2xl bg-card px-4 py-3.5 text-left"
          >
            <span className="flex items-center gap-2.5 text-sm font-bold text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {t.configurar.personalizarBoton}
            </span>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="mt-7 space-y-3">
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
              <button
                onClick={() => setAnio('todos')}
                className={`card-elevated w-full rounded-2xl px-3 py-3 text-center text-sm font-bold leading-tight transition ${
                  anio === 'todos' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                }`}
              >
                {t.configurar.todosAnios}
              </button>
              <div className="grid grid-cols-4 gap-2.5">
                {anios.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAnio(a)}
                    className={`card-elevated rounded-2xl px-1 py-3 text-center text-xs font-bold leading-tight transition ${
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
            <p className="px-1 text-xs font-medium text-muted-foreground">{t.configurar.capituloAyuda}</p>
            <div className="space-y-2">
              <button
                onClick={() => setCapitulos([])}
                className={`card-elevated flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition ${
                  capitulos.length === 0 ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                }`}
              >
                {t.configurar.todosCapitulos}
                <span className={capitulos.length === 0 ? 'text-white/70' : 'text-muted-foreground'}>
                  {preguntas.filter((p) => anio === 'todos' || p.anio === anio).length} {t.configurar.preguntas}
                </span>
              </button>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {todosLosCapitulos.map((cap) => {
                  const n = preguntas.filter((p) => p.capitulo === cap && (anio === 'todos' || p.anio === anio)).length
                  const activo = capitulos.includes(cap)
                  return (
                    <button
                      key={cap}
                      onClick={() => toggleCapitulo(cap)}
                      className={`card-elevated flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition ${
                        activo ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2 truncate pr-2">
                        {activo && <Check className="h-4 w-4 shrink-0" />}
                        <span className="truncate">{cap}</span>
                      </span>
                      <span className={`shrink-0 ${activo ? 'text-white/70' : 'text-muted-foreground'}`}>{n}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={restablecer}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t.configurar.restablecer}
            </button>
          </div>
        </div>
      )}

      <BottomNav
        activo="simulacro"
        onNavigate={onNavigate}
        accesorio={
          <div className="border-t border-border bg-background/95 p-3 backdrop-blur">
            {!personalizando ? (
              <Button
                onClick={iniciarOficial}
                className="h-12 w-full rounded-2xl bg-primary text-[15px] font-bold hover:bg-primary/90"
              >
                <Play className="mr-2 h-4 w-4" />
                {t.configurar.comenzar}
              </Button>
            ) : (
              <Button
                onClick={iniciar}
                disabled={disponibles === 0}
                className="h-12 w-full rounded-2xl bg-primary text-[15px] font-bold hover:bg-primary/90"
              >
                <Play className="mr-2 h-4 w-4" />
                {t.configurar.comenzar} ({Math.min(cantidad, disponibles)} {t.configurar.preguntas}
                {conTiempo ? ` · ${duracion} min` : ''})
              </Button>
            )}
          </div>
        }
      />
    </div>
  )
}

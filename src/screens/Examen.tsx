import { useEffect, useMemo, useRef, useState } from 'react'
import type { Pregunta } from '@/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ReportarPregunta } from '@/components/ReportarPregunta'
import { useAppSettings } from '@/context/AppSettings'
import { ArrowLeft, ArrowRight, X, Timer, AlertTriangle } from 'lucide-react'

export type RespuestaUsuario = Record<number, string[]>

function formatearTiempo(seg: number): string {
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Examen({
  userId,
  preguntas,
  tiempoLimiteMinutos,
  onCancelar,
  onFinalizar,
}: {
  userId: string
  preguntas: Pregunta[]
  tiempoLimiteMinutos: number | null
  onCancelar: () => void
  onFinalizar: (respuestas: RespuestaUsuario, tiempoUsadoSeg: number, agotoTiempo: boolean) => void
}) {
  const { t } = useAppSettings()
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState<RespuestaUsuario>({})
  const [confirmarSalir, setConfirmarSalir] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState((tiempoLimiteMinutos ?? 0) * 60)
  const inicioRef = useRef(Date.now())
  const respuestasRef = useRef<RespuestaUsuario>({})
  const finalizadoRef = useRef(false)

  respuestasRef.current = respuestas

  const pregunta = preguntas[indice]
  const esMultiple = useMemo(() => pregunta.opciones.filter((o) => o.correcta).length > 1, [pregunta])
  const seleccion = respuestas[pregunta.numero] ?? []
  const progreso = ((indice + 1) / preguntas.length) * 100
  const respondidas = Object.keys(respuestas).length

  function finalizarUnaVez(agotoTiempo: boolean) {
    if (finalizadoRef.current) return
    finalizadoRef.current = true
    const tiempoUsadoSeg = Math.round((Date.now() - inicioRef.current) / 1000)
    onFinalizar(respuestasRef.current, tiempoUsadoSeg, agotoTiempo)
  }

  useEffect(() => {
    if (tiempoLimiteMinutos === null) return
    const timer = setInterval(() => {
      setTiempoRestante((t) => {
        if (t <= 1) {
          clearInterval(timer)
          finalizarUnaVez(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiempoLimiteMinutos])

  const totalSeg = (tiempoLimiteMinutos ?? 0) * 60
  const tiempoBajo = tiempoLimiteMinutos !== null && totalSeg > 0 && tiempoRestante / totalSeg <= 0.15
  const tiempoMedio = tiempoLimiteMinutos !== null && totalSeg > 0 && tiempoRestante / totalSeg <= 0.3

  function toggleOpcion(letra: string) {
    setRespuestas((prev) => {
      const actual = prev[pregunta.numero] ?? []
      let nueva: string[]
      if (esMultiple) {
        nueva = actual.includes(letra) ? actual.filter((l) => l !== letra) : [...actual, letra]
      } else {
        nueva = [letra]
      }
      return { ...prev, [pregunta.numero]: nueva }
    })
  }

  function siguiente() {
    if (indice < preguntas.length - 1) setIndice((i) => i + 1)
    else finalizarUnaVez(false)
  }

  function anterior() {
    if (indice > 0) setIndice((i) => i - 1)
  }

  return (
    <div className="app-shell flex flex-col bg-background">
      <div className="border-b border-border px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setConfirmarSalir(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
            {t.examen.preguntaContador(indice + 1, preguntas.length)}
          </span>
          {tiempoLimiteMinutos !== null ? (
            <span
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                tiempoBajo
                  ? 'bg-destructive/15 text-destructive'
                  : tiempoMedio
                    ? 'bg-amber-400/20 text-amber-600'
                    : 'bg-accent/12 text-accent'
              }`}
            >
              {tiempoBajo ? <AlertTriangle className="h-3.5 w-3.5" /> : <Timer className="h-3.5 w-3.5" />}
              {formatearTiempo(tiempoRestante)}
            </span>
          ) : (
            <span className="w-8" />
          )}
        </div>
        <Progress value={progreso} className="mt-3 h-1.5" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-64">
        <h2 className="text-[17px] font-bold leading-snug text-foreground">{pregunta.pregunta}</h2>
        {esMultiple && (
          <p className="mt-1.5 text-xs font-medium text-muted-foreground">{t.examen.multipleAyuda}</p>
        )}

        {/* Reportar pregunta también durante el examen (no solo en Resultados):
            así lo pidió el diseño original — a veces el error se nota en el
            momento, antes de terminar. Reusa el mismo componente/tabla que
            Resultados.tsx. */}
        <div className="mt-2.5">
          <ReportarPregunta userId={userId} pregunta={pregunta} />
        </div>

        <div className="mt-5 space-y-2.5">
          {pregunta.opciones.map((op) => {
            const activa = seleccion.includes(op.letra)
            return (
              <button
                key={op.letra}
                onClick={() => toggleOpcion(op.letra)}
                className={`card-elevated flex w-full items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
                  activa ? 'border-accent bg-accent/8' : 'border-transparent bg-card'
                }`}
              >
                {/* La letra reemplaza al círculo/cuadrado como marcador único
                    (decisión 2026-08-23, mockup "Opción 1"): el marcador de
                    selección ES la letra, así que el texto arranca limpio,
                    sin nada pegado adelante. Redondo para selección única,
                    cuadrado (rounded-lg) para selección múltiple — mismo
                    código de color que antes usaban los íconos de radio. */}
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border-2 text-xs font-extrabold transition-colors ${
                    esMultiple ? 'rounded-lg' : 'rounded-full'
                  } ${
                    activa
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {op.letra}
                </span>
                <span className="text-sm font-medium leading-snug text-foreground">{op.texto}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto w-full max-w-md">
          <div className="grid grid-cols-10 gap-1">
            {preguntas.map((p, i) => {
              const respondida = (respuestas[p.numero]?.length ?? 0) > 0
              const actual = i === indice
              return (
                <button
                  key={p.numero}
                  onClick={() => setIndice(i)}
                  aria-label={t.examen.preguntaContador(i + 1, preguntas.length)}
                  aria-current={actual}
                  className={`flex aspect-square w-full items-center justify-center rounded-md border text-[10px] transition ${
                    respondida
                      ? 'border-emerald-500 bg-white font-bold text-emerald-600'
                      : 'border-white/70 bg-red-500/90 font-medium text-white'
                  } ${actual ? 'ring-2 ring-accent ring-offset-1 ring-offset-background' : ''}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex gap-3">
            <Button
              variant="outline"
              onClick={anterior}
              disabled={indice === 0}
              className="h-12 flex-1 rounded-2xl font-bold"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t.examen.anterior}
            </Button>
            <Button
              onClick={siguiente}
              className="h-12 flex-1 rounded-2xl bg-primary font-bold hover:bg-primary/90"
            >
              {indice === preguntas.length - 1 ? t.examen.finalizar : t.examen.siguiente}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {confirmarSalir && (
        <div className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="card-elevated w-full max-w-sm rounded-3xl bg-card p-6">
            <h3 className="text-base font-bold text-foreground">{t.examen.salirTitulo}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t.examen.salirDesc(respondidas, preguntas.length)}
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setConfirmarSalir(false)}>
                {t.examen.continuar}
              </Button>
              <Button
                className="h-11 flex-1 rounded-xl bg-destructive hover:bg-destructive/90"
                onClick={onCancelar}
              >
                {t.examen.salir}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

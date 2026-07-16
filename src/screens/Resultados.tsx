import { useEffect, useMemo, useState } from 'react'
import type { Pregunta } from '@/types'
import type { RespuestaUsuario } from './Examen'
import { Button } from '@/components/ui/button'
import { guardarIntento, getPromedio } from '@/lib/data'
import { useAppSettings } from '@/context/AppSettings'
import { CheckCircle2, XCircle, RotateCcw, Home as HomeIcon, ChevronDown, Clock, AlarmClockOff } from 'lucide-react'

function formatearTiempo(seg: number): string {
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function esCorrecta(pregunta: Pregunta, seleccion: string[]): boolean {
  const correctas = pregunta.opciones.filter((o) => o.correcta).map((o) => o.letra).sort()
  const dadas = [...seleccion].sort()
  return correctas.length === dadas.length && correctas.every((l, i) => l === dadas[i])
}

export function Resultados({
  cursoId,
  preguntas,
  respuestas,
  capitulo,
  anio,
  umbralAprobado,
  mostrarConvocatoria,
  tiempoLimiteMinutos,
  tiempoUsadoSeg,
  agotoTiempo,
  onRepetir,
  onInicio,
}: {
  cursoId: string
  preguntas: Pregunta[]
  respuestas: RespuestaUsuario
  capitulo: string
  anio: number | 'todos'
  umbralAprobado: number
  mostrarConvocatoria: boolean
  tiempoLimiteMinutos: number | null
  tiempoUsadoSeg: number
  agotoTiempo: boolean
  onRepetir: () => void
  onInicio: () => void
}) {
  const { t } = useAppSettings()
  const [expandido, setExpandido] = useState<number | null>(null)
  const [promedio, setPromedio] = useState(0)

  const { correctas, porcentaje, aprobado } = useMemo(() => {
    const correctas = preguntas.filter((p) => esCorrecta(p, respuestas[p.numero] ?? [])).length
    const porcentaje = Math.round((correctas / preguntas.length) * 100)
    return { correctas, porcentaje, aprobado: porcentaje >= umbralAprobado }
  }, [preguntas, respuestas, umbralAprobado])

  useEffect(() => {
    guardarIntento({
      cursoId,
      fecha: new Date().toISOString(),
      totalPreguntas: preguntas.length,
      correctas,
      porcentaje,
      aprobado,
      capitulo,
      anio,
      tiempoLimiteMinutos,
      tiempoUsadoSeg,
      agotoTiempo,
    })
    setPromedio(getPromedio(cursoId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const circunferencia = 2 * Math.PI * 54

  return (
    <div className="app-shell bg-background pb-32">
      <div className={`rounded-b-[32px] px-6 pb-8 pt-8 text-white ${aprobado ? 'brand-gradient' : 'bg-gradient-to-br from-[#7a1f2b] to-[#4a1018]'}`}>
        <p className="text-center text-xs font-bold uppercase tracking-widest text-white/60">
          {aprobado ? t.resultados.aprobado : t.resultados.noAprobado}
        </p>
        {mostrarConvocatoria && (
          <p className="mt-1 text-center text-[11px] font-semibold text-white/50">{t.resultados.convocatoria(anio)}</p>
        )}

        <div className="relative mx-auto mt-5 flex h-36 w-36 items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={aprobado ? '#1fc6c6' : '#ff8a80'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circunferencia}
              strokeDashoffset={circunferencia - (porcentaje / 100) * circunferencia}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold">{porcentaje}%</span>
            <span className="text-[10px] font-medium text-white/60">{correctas}/{preguntas.length} {t.resultados.correctasSufijo}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-center">
            <p className="text-sm font-extrabold">{umbralAprobado}%</p>
            <p className="text-[10px] text-white/60">{t.resultados.minimoAprobatorio}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-center">
            <p className="text-sm font-extrabold">{promedio}%</p>
            <p className="text-[10px] text-white/60">{t.resultados.tuPromedio}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-center">
            <p className="flex items-center justify-center gap-1 text-sm font-extrabold">
              <Clock className="h-3.5 w-3.5" />
              {formatearTiempo(tiempoUsadoSeg)}
            </p>
            <p className="text-[10px] text-white/60">
              {tiempoLimiteMinutos !== null ? t.resultados.deMin(tiempoLimiteMinutos) : t.resultados.sinLimite}
            </p>
          </div>
        </div>

        {agotoTiempo && (
          <div className="mx-auto mt-4 flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80">
            <AlarmClockOff className="h-3.5 w-3.5" />
            {t.resultados.agotoTiempo}
          </div>
        )}
      </div>

      <div className="mt-6 px-6">
        <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.resultados.repaso}</p>
        <div className="mt-3 space-y-2.5">
          {preguntas.map((p) => {
            const sel = respuestas[p.numero] ?? []
            const ok = esCorrecta(p, sel)
            const abierto = expandido === p.numero
            return (
              <div key={p.numero} className="card-elevated overflow-hidden rounded-2xl bg-card">
                <button
                  onClick={() => setExpandido(abierto ? null : p.numero)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  {ok ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                    {p.numero}. {p.pregunta}
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${abierto ? 'rotate-180' : ''}`} />
                </button>
                {abierto && (
                  <div className="space-y-1.5 border-t border-border px-4 py-3">
                    {p.opciones.map((op) => {
                      const marcada = sel.includes(op.letra)
                      return (
                        <div
                          key={op.letra}
                          className={`rounded-xl px-3 py-2 text-xs font-medium ${
                            op.correcta
                              ? 'bg-success/12 text-success'
                              : marcada
                                ? 'bg-destructive/10 text-destructive'
                                : 'text-muted-foreground'
                          }`}
                        >
                          <span className="font-bold">{op.letra}.</span> {op.texto}
                          {op.correcta ? ' ✓' : marcada ? ' ✗' : ''}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 flex gap-3 border-t border-border bg-background/95 p-4 backdrop-blur">
        <Button variant="outline" onClick={onInicio} className="h-12 flex-1 rounded-2xl font-bold">
          <HomeIcon className="mr-1.5 h-4 w-4" />
          {t.resultados.inicio}
        </Button>
        <Button onClick={onRepetir} className="h-12 flex-1 rounded-2xl bg-primary font-bold hover:bg-primary/90">
          <RotateCcw className="mr-1.5 h-4 w-4" />
          {t.resultados.repetir}
        </Button>
      </div>
    </div>
  )
}

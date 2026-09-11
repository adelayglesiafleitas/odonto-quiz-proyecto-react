import { useEffect, useState } from 'react'
import { ArrowLeft, RotateCcw, Play, AlarmClockOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/Spinner'
import { BottomNav } from '@/components/BottomNav'
import { LogoMark } from '@/components/Logo'
import { SettingsToggle } from '@/components/SettingsToggle'
import { useAppSettings } from '@/context/AppSettings'
import { getUltimosIntentos } from '@/lib/historial'
import { getAsignaturas, ICONO_CURSO } from '@/lib/asignaturas'
import type { Idioma } from '@/lib/i18n'
import type { IntentoExamen, Pantalla } from '@/types'

const LIMITE_HISTORIAL = 10

function mismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatearFecha(iso: string, idioma: Idioma): string {
  const fecha = new Date(iso)
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  const locale = idioma === 'en' ? 'en-GB' : 'es-ES'
  const hora = fecha.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  if (mismoDia(fecha, hoy)) return `${idioma === 'en' ? 'Today' : 'Hoy'} · ${hora}`
  if (mismoDia(fecha, ayer)) return `${idioma === 'en' ? 'Yesterday' : 'Ayer'} · ${hora}`
  const dia = fecha.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  return `${dia} · ${hora}`
}

function FilaDato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-bold text-foreground">{valor}</span>
    </div>
  )
}

/**
 * Historial de simulacros: los últimos 10 intentos del usuario (todas las
 * asignaturas mezcladas, más reciente primero), con la opción de repetir
 * cualquiera. Se llega acá desde Estadísticas (ver el botón agregado ahí).
 *
 * "Repetir" arma el mismo examen que vio el usuario: si el intento tiene
 * `preguntasNumeros` guardado (columna agregada junto con esta pantalla),
 * son exactamente las mismas preguntas en el mismo orden. Los intentos
 * guardados antes de esta función no tienen ese array (llega vacío), así
 * que para esos se cae a repetir con la misma configuración pero preguntas
 * nuevas al azar — es lo único posible para ese historial viejo, y se avisa
 * en el texto del diálogo (ver App.tsx → repetirIntento).
 */
export function Historial({
  userId,
  onBack,
  onNavigate,
  onRepetir,
}: {
  userId: string
  onBack: () => void
  onNavigate: (p: Pantalla) => void
  onRepetir: (intento: IntentoExamen) => Promise<void>
}) {
  const { t, idioma } = useAppSettings()
  const asignaturas = getAsignaturas(idioma)
  const [cargando, setCargando] = useState(true)
  const [intentos, setIntentos] = useState<IntentoExamen[]>([])
  const [seleccionado, setSeleccionado] = useState<IntentoExamen | null>(null)
  const [repitiendo, setRepitiendo] = useState(false)

  useEffect(() => {
    let cancelado = false
    getUltimosIntentos(userId, LIMITE_HISTORIAL).then((data) => {
      if (cancelado) return
      setIntentos(data)
      setCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [userId])

  function nombreAsignatura(cursoId: string): string {
    return asignaturas.find((a) => a.cursoId === cursoId)?.nombre ?? cursoId
  }

  async function confirmarRepetir() {
    if (!seleccionado) return
    setRepitiendo(true)
    await onRepetir(seleccionado)
    setRepitiendo(false)
    setSeleccionado(null)
  }

  return (
    <div className="app-shell bg-background pb-28 pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold text-foreground">{t.historial.titulo}</h1>
          <p className="text-xs text-muted-foreground">{t.historial.subtitulo}</p>
        </div>
      </div>

      {cargando ? (
        <div className="mt-16 flex justify-center">
          <Spinner className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : intentos.length === 0 ? (
        <div className="mt-16 px-8 text-center">
          <p className="text-sm font-bold text-foreground">{t.historial.vacioTitulo}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t.historial.vacioTexto}</p>
        </div>
      ) : (
        <div className="mt-5 space-y-2.5 px-6">
          {intentos.map((intento, i) => {
            const Icono = ICONO_CURSO[intento.cursoId] ?? ICONO_CURSO.odontologia
            return (
              <div key={`${intento.fecha}-${i}`} className="card-elevated rounded-2xl bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icono className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{nombreAsignatura(intento.cursoId)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatearFecha(intento.fecha, idioma)}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${
                      intento.aprobado ? 'bg-success/12 text-success' : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {intento.porcentaje}%
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {intento.capitulos.length === 0 ? (
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      {t.historial.examenCompleto}
                    </span>
                  ) : (
                    intento.capitulos.map((c) => (
                      <span key={c} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        {c}
                      </span>
                    ))
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      {t.historial.preguntas(intento.totalPreguntas)}
                      {' · '}
                      {intento.tiempoLimiteMinutos !== null ? `${intento.tiempoLimiteMinutos} min` : t.resultados.sinLimite}
                    </p>
                    {intento.agotoTiempo && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--amber))]">
                        <AlarmClockOff className="h-3.5 w-3.5" />
                        {t.historial.agotoTiempoCorto}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSeleccionado(intento)}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-primary transition active:scale-95"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t.historial.repetirBoton}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {seleccionado && (
        <div className="safe-bottom animate-in fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 duration-200 sm:items-center">
          <div className="card-elevated animate-in fade-in slide-in-from-bottom-4 w-full max-w-sm rounded-3xl bg-card p-6 duration-300">
            <h3 className="text-base font-bold text-foreground">{t.historial.repetirTitulo}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {seleccionado.preguntasNumeros.length > 0 ? t.historial.repetirDescExacta : t.historial.repetirDescConfig}
            </p>
            <div className="mt-4 space-y-2.5 rounded-2xl bg-secondary/60 p-4">
              <FilaDato label={t.historial.asignaturaLabel} valor={nombreAsignatura(seleccionado.cursoId)} />
              <FilaDato
                label={t.historial.alcanceLabel}
                valor={seleccionado.capitulos.length === 0 ? t.historial.examenCompleto : seleccionado.capitulos.join(', ')}
              />
              <FilaDato label={t.historial.preguntasLabel} valor={t.historial.preguntas(seleccionado.totalPreguntas)} />
              <FilaDato
                label={t.historial.limiteLabel}
                valor={seleccionado.tiempoLimiteMinutos !== null ? `${seleccionado.tiempoLimiteMinutos} min` : t.resultados.sinLimite}
              />
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-xl"
                onClick={() => setSeleccionado(null)}
                disabled={repitiendo}
              >
                {t.comun.cancelar}
              </Button>
              <Button
                className="h-11 flex-1 rounded-xl bg-primary hover:bg-primary/90"
                onClick={confirmarRepetir}
                disabled={repitiendo}
              >
                {repitiendo ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <>
                    <Play className="mr-1.5 h-4 w-4" />
                    {t.historial.empezarAhora}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activo="home" onNavigate={onNavigate} />
    </div>
  )
}

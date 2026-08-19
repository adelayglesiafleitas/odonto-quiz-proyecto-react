import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Trophy, BookOpen } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { Spinner } from '@/components/Spinner'
import { BottomNav } from '@/components/BottomNav'
import { getAsignaturas } from '@/lib/asignaturas'
import {
  getHistorialRemoto,
  calcularPromedio,
  calcularActividadSemanal,
  getEstadisticasCapitulos,
  type ActividadDia,
  type EstadisticaCapitulo,
} from '@/lib/historial'
import type { Pantalla } from '@/types'

/**
 * Pantalla propia (no vive en un tab del menú inferior) con el detalle
 * completo de estadísticas: general, actividad de la semana, por capítulo
 * y por asignatura. Se llega acá desde el botón "Ver estadísticas
 * completas" de Home, que a propósito solo muestra un resumen para no
 * cargar esa pantalla de contenido.
 *
 * Aun así, la barra de navegación inferior nunca debe faltar en ninguna
 * pantalla principal de la app (el usuario no debe quedar "varado" sin
 * forma de navegar), así que se muestra igual acá con "home" marcado como
 * la pestaña activa, ya que es de donde se llega.
 *
 * "Por capítulo" usa la función obtener_estadisticas_capitulos de Supabase
 * (ver supabase/schema.sql): la suma se hace en el servidor sobre los
 * últimos intentos de este usuario, no trayendo todo el historial acá para
 * sumarlo en el navegador.
 */
export function Estadisticas({
  userId,
  cursoId,
  onBack,
  onNavigate,
}: {
  userId: string
  cursoId: string
  onBack: () => void
  onNavigate: (p: Pantalla) => void
}) {
  const { t, idioma } = useAppSettings()
  const [cargando, setCargando] = useState(true)
  const [promedio, setPromedio] = useState(0)
  const [mejor, setMejor] = useState(0)
  const [intentos, setIntentos] = useState(0)
  const [actividad, setActividad] = useState<ActividadDia[]>([])
  const [porCapitulo, setPorCapitulo] = useState<EstadisticaCapitulo[]>([])

  useEffect(() => {
    let cancelado = false
    Promise.all([getHistorialRemoto(userId, cursoId), getEstadisticasCapitulos(cursoId)]).then(([historial, capitulos]) => {
      if (cancelado) return
      setPromedio(calcularPromedio(historial))
      setMejor(historial.reduce((max, i) => Math.max(max, i.porcentaje), 0))
      setIntentos(historial.length)
      setActividad(calcularActividadSemanal(historial.map((i) => i.fecha)))
      setPorCapitulo(capitulos)
      setCargando(false)
    })
    return () => {
      cancelado = true
    }
  }, [userId, cursoId])

  // Por ahora solo hay una asignatura con banco de preguntas (ver
  // lib/asignaturas.ts): cuando se sume una segunda, esta sección pasa a
  // iterar sobre getAsignaturas() con su propio cursoId/estadísticas cada
  // una, en vez de mostrar una sola fila fija.
  const asignatura = getAsignaturas(idioma)[0]

  const capitulosOrdenados = useMemo(
    () =>
      porCapitulo
        .map((c) => ({ ...c, porcentaje: c.total > 0 ? Math.round((c.correctas / c.total) * 100) : 0 }))
        .sort((a, b) => a.porcentaje - b.porcentaje),
    [porCapitulo],
  )

  const circunferencia = 2 * Math.PI * 42
  const maxActividad = Math.max(1, ...actividad.map((d) => d.cantidad))

  return (
    <div className="app-shell bg-background pb-28 pt-6">
      <div className="flex items-center gap-3 px-6">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.estadisticas.titulo}</h1>
      </div>

      {cargando ? (
        <div className="mt-16 flex justify-center">
          <Spinner className="h-8 w-8 text-muted-foreground" />
        </div>
      ) : intentos === 0 ? (
        <div className="mt-16 px-8 text-center">
          <p className="text-sm font-bold text-foreground">{t.estadisticas.sinDatosTitulo}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t.estadisticas.sinDatosTexto}</p>
        </div>
      ) : (
        <>
          <div className="mt-5 px-6">
            <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.estadisticas.general}</p>
            <div className="card-elevated mt-2 flex items-center gap-5 rounded-2xl bg-card p-5">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
                  <circle cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="9" />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    fill="none"
                    stroke="hsl(var(--accent))"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={circunferencia}
                    strokeDashoffset={circunferencia - (promedio / 100) * circunferencia}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <span className="absolute text-xl font-extrabold text-foreground">{promedio}%</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">{t.estadisticas.promedioGeneral}</p>
                <p className="text-xs text-muted-foreground">{t.estadisticas.intentos(intentos)}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-1 text-[11px] font-bold text-accent">
                  <Trophy className="h-3.5 w-3.5" />
                  {mejor}% {t.home.mejorPuntaje}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 px-6">
            <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.estadisticas.actividadSemanal}</p>
            <div className="card-elevated mt-2 flex items-end justify-between gap-2 rounded-2xl bg-card p-5">
              {actividad.map((dia) => (
                <div key={dia.etiqueta} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-16 w-full items-end justify-center">
                    <div
                      className={`w-2.5 rounded-full transition-all ${dia.esHoy ? 'bg-accent' : 'bg-primary/25'}`}
                      style={{ height: `${dia.cantidad > 0 ? Math.max(12, (dia.cantidad / maxActividad) * 100) : 4}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${dia.esHoy ? 'text-accent' : 'text-muted-foreground'}`}>
                    {dia.etiqueta}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {capitulosOrdenados.length > 0 && (
            <div className="mt-5 px-6">
              <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.estadisticas.porCapitulo}</p>
              <div className="card-elevated mt-2 space-y-3.5 rounded-2xl bg-card p-5">
                {capitulosOrdenados.map((c, i) => (
                  <div key={c.capitulo}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{c.capitulo}</span>
                      <span className="shrink-0 text-xs font-bold text-muted-foreground">{c.porcentaje}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-primary/10">
                      <div
                        className={`h-full rounded-full transition-all ${
                          c.porcentaje >= 70 ? 'bg-success' : c.porcentaje >= 40 ? 'bg-[#e0a72b]' : 'bg-destructive'
                        }`}
                        style={{ width: `${c.porcentaje}%` }}
                      />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      {c.correctas}/{c.total} {t.resultados.correctasSufijo}
                      {i === 0 && (
                        <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-destructive">
                          {t.estadisticas.puntoDebil}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 px-6">
            <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.estadisticas.porAsignatura}</p>
            <div className="card-elevated mt-2 flex items-center justify-between gap-3 rounded-2xl bg-card p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </span>
                <span className="truncate text-sm font-bold text-foreground">{asignatura?.nombre}</span>
              </div>
              <span className="shrink-0 text-sm font-extrabold text-foreground">{promedio}%</span>
            </div>
          </div>
        </>
      )}

      <BottomNav activo="home" onNavigate={onNavigate} />
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, Check, ChevronDown, Trophy } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { Spinner } from '@/components/Spinner'
import { BottomNav } from '@/components/BottomNav'
import { getAsignaturas, ICONO_CURSO } from '@/lib/asignaturas'
import { colorBgPorcentaje, colorStrokePorcentaje, colorTextPorcentaje } from '@/lib/utils'
import {
  getHistorialRemoto,
  calcularPromedio,
  calcularActividadSemanal,
  getEstadisticasCapitulos,
  type ActividadDia,
  type EstadisticaCapitulo,
} from '@/lib/historial'
import type { Pantalla } from '@/types'

interface ResumenAsignatura {
  promedio: number
  intentos: number
}

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
 *
 * Con más de una asignatura examinable (ver lib/asignaturas.ts), esta
 * pantalla tiene un selector propio arriba de todo: `cursoIdInicial` solo
 * define qué asignatura se ve al entrar (la que se venía examinando),
 * después el usuario puede cambiarla acá sin salir de la pantalla. Todas
 * las secciones de detalle (general, actividad, por capítulo) siguen al
 * curso seleccionado; la sección "Por asignatura" es la excepción: siempre
 * muestra el resumen de todas, sirve de selector alternativo y de
 * comparación rápida entre asignaturas.
 */
export function Estadisticas({
  userId,
  cursoIdInicial,
  onBack,
  onNavigate,
}: {
  userId: string
  cursoIdInicial: string
  onBack: () => void
  onNavigate: (p: Pantalla) => void
}) {
  const { t, idioma } = useAppSettings()
  const asignaturas = useMemo(() => getAsignaturas(idioma), [idioma])

  const [cursoSel, setCursoSel] = useState(cursoIdInicial)
  const [asignaturaAbierta, setAsignaturaAbierta] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [promedio, setPromedio] = useState(0)
  const [mejor, setMejor] = useState(0)
  const [intentos, setIntentos] = useState(0)
  const [actividad, setActividad] = useState<ActividadDia[]>([])
  const [porCapitulo, setPorCapitulo] = useState<EstadisticaCapitulo[]>([])

  // Detalle de la asignatura seleccionada (general, actividad, por capítulo).
  useEffect(() => {
    let cancelado = false
    setCargando(true)
    Promise.all([getHistorialRemoto(userId, cursoSel), getEstadisticasCapitulos(cursoSel)]).then(
      ([historial, capitulos]) => {
        if (cancelado) return
        setPromedio(calcularPromedio(historial))
        setMejor(historial.reduce((max, i) => Math.max(max, i.porcentaje), 0))
        setIntentos(historial.length)
        setActividad(calcularActividadSemanal(historial.map((i) => i.fecha)))
        setPorCapitulo(capitulos)
        setCargando(false)
      },
    )
    return () => {
      cancelado = true
    }
  }, [userId, cursoSel])

  // Resumen liviano (promedio + cantidad de intentos) de TODAS las
  // asignaturas para la sección "Por asignatura": es independiente de cuál
  // esté seleccionada arriba, porque esa sección compara todas a la vez.
  const [resumenAsignaturas, setResumenAsignaturas] = useState<Record<string, ResumenAsignatura>>({})

  useEffect(() => {
    let cancelado = false
    Promise.all(asignaturas.map((a) => getHistorialRemoto(userId, a.cursoId))).then((resultados) => {
      if (cancelado) return
      const resumen: Record<string, ResumenAsignatura> = {}
      asignaturas.forEach((a, i) => {
        const historial = resultados[i]
        resumen[a.cursoId] = { promedio: calcularPromedio(historial), intentos: historial.length }
      })
      setResumenAsignaturas(resumen)
    })
    return () => {
      cancelado = true
    }
  }, [userId, asignaturas])

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
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-extrabold text-foreground">{t.estadisticas.titulo}</h1>
      </div>

      {asignaturas.length > 1 && (
        <div className="mt-5 px-6">
          {/* Selector desplegable (mismo patrón "acordeón" que el picker de
              estilo en Ayuda.tsx: botón + ChevronDown que rota + lista que
              se abre debajo) en vez del segmentado de 3 pestañas de ancho
              fijo: ese repartía el ancho a partes iguales y "Pacientes
              especiales" quedaba cortado a "Pacient..." en cualquier
              celular en cuanto se sumó una tercera asignatura (con 2 entraba
              entero). Acá cada opción tiene todo el ancho de la pantalla
              para su nombre, así que nunca se corta y escala sin problema
              si se suma una cuarta asignatura el día de mañana. */}
          <div className="card-elevated overflow-hidden rounded-2xl bg-card">
            <button
              onClick={() => setAsignaturaAbierta((v) => !v)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
              aria-expanded={asignaturaAbierta}
            >
              {/* Ícono genérico (no el de la asignatura actual) porque el
                  texto de al lado ya no indica cuál está elegida — ver nota
                  de abajo. */}
              <BookOpen className="h-4 w-4 shrink-0 text-accent" />
              {/* Texto fijo "Escoge asignatura" en vez del nombre de la
                  asignatura actual: a pedido del usuario, el botón cerrado
                  funciona como una llamada a la acción genérica ("elegí
                  acá") y no como indicador de selección — la que está
                  elegida se ve igual con el check adentro de la lista al
                  abrir. */}
              <span className="flex-1 text-sm font-bold text-foreground">{t.estadisticas.escogeAsignatura}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  asignaturaAbierta ? 'rotate-180' : ''
                }`}
              />
            </button>
            {asignaturaAbierta && (
              <div className="space-y-1 border-t border-border p-2">
                {asignaturas.map((a) => {
                  const Icono = ICONO_CURSO[a.cursoId] ?? ICONO_CURSO.odontologia
                  const seleccionada = a.cursoId === cursoSel
                  return (
                    <button
                      key={a.cursoId}
                      onClick={() => {
                        setCursoSel(a.cursoId)
                        setAsignaturaAbierta(false)
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                        seleccionada ? 'bg-secondary text-accent' : 'text-foreground'
                      }`}
                    >
                      <Icono className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{a.nombre}</span>
                      {seleccionada && <Check className="h-4 w-4 shrink-0 text-accent" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
                    stroke={colorStrokePorcentaje(promedio)}
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
                        className={`h-full rounded-full transition-all ${colorBgPorcentaje(c.porcentaje)}`}
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
        </>
      )}

      <div className="mt-5 px-6">
        <p className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.estadisticas.porAsignatura}</p>
        <div className="mt-2 space-y-2.5">
          {asignaturas.map((a) => {
            const Icono = ICONO_CURSO[a.cursoId] ?? ICONO_CURSO.odontologia
            const resumen = resumenAsignaturas[a.cursoId]
            const seleccionada = a.cursoId === cursoSel
            return (
              <button
                key={a.cursoId}
                onClick={() => setCursoSel(a.cursoId)}
                className={`card-elevated flex w-full items-center justify-between gap-3 rounded-2xl bg-card p-4 text-left transition ${
                  seleccionada ? 'ring-2 ring-accent/50' : ''
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icono className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{a.nombre}</p>
                    {resumen && (
                      <p className="text-[11px] text-muted-foreground">{t.estadisticas.intentos(resumen.intentos)}</p>
                    )}
                  </div>
                </div>
                {resumen && (
                  <span
                    className={`shrink-0 text-sm font-extrabold ${
                      resumen.intentos > 0 ? colorTextPorcentaje(resumen.promedio) : 'text-muted-foreground'
                    }`}
                  >
                    {resumen.intentos > 0 ? `${resumen.promedio}%` : t.estadisticas.sinIntentos}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <BottomNav activo="home" onNavigate={onNavigate} />
    </div>
  )
}

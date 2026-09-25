import { useEffect, useState, type CSSProperties } from 'react'
import { Stethoscope, Plus } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import { getAsignaturas, ICONO_CURSO } from '@/lib/asignaturas'
import { CURSOS } from '@/lib/cursos'
import { getMediasPorCurso, type MediaCurso } from '@/lib/historial'
import type { Pantalla } from '@/types'

// Colores del nivel de cada asignatura (diseño "A · Anillos"). Además del
// tono se distinguen por luminosidad, para quien no distingue bien colores:
// aprobado = el primario del estilo activo, cerca = ámbar claro, flojo = rojo
// oscuro. Umbral de "cerca" fijo en 50; el de aprobado sale de cada curso.
const COLOR_CERCA = '#f4b740'
const COLOR_FLOJO = '#c0473b'
const UMBRAL_CERCA = 50

function colorNivel(media: number, aprobado: number): string {
  if (media >= aprobado) return 'hsl(var(--primary))'
  if (media >= UMBRAL_CERCA) return COLOR_CERCA
  return COLOR_FLOJO
}

// Anillo de progreso en SVG. `valor` null = asignatura sin simulacros:
// pista punteada y un guion en lugar del porcentaje (nunca "0%", que
// parecería un suspenso).
function Anillo({
  valor,
  color,
  tamano,
  grosor,
  texto,
  textoClase,
}: {
  valor: number | null
  color: string
  tamano: number
  grosor: number
  texto: string
  textoClase: string
}) {
  const r = (tamano - grosor) / 2
  const c = 2 * Math.PI * r
  return (
    <span className="relative inline-flex shrink-0" style={{ width: tamano, height: tamano }}>
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} className="-rotate-90" aria-hidden="true">
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.2)"
          strokeWidth={grosor}
          strokeDasharray={valor === null ? '3 4' : undefined}
        />
        {valor !== null && (
          <circle
            cx={tamano / 2}
            cy={tamano / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={grosor}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - Math.min(100, Math.max(0, valor)) / 100)}
            style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.3, 0.9, 0.3, 1)' }}
          />
        )}
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-extrabold tabular-nums ${textoClase}`}>
        {texto}
      </span>
    </span>
  )
}

/**
 * Paso previo a "Configurar examen": elegís la asignatura que vas a
 * examinar (ver lib/asignaturas.ts para la lista y cómo sumar una nueva).
 * Cada asignatura muestra tu media en sus últimos simulacros con un anillo
 * de color (aprobado / cerca / flojo) y arriba un resumen global.
 * Se manda también el nombre (no solo el cursoId) porque quien llama lo usa
 * para el texto de la pantalla de carga ("Cargando preguntas de Ortodoncia…")
 * mientras se trae el banco de Supabase.
 */
export function ElegirAsignatura({
  userId,
  onSeleccionar,
  onNavigate,
}: {
  userId: string | null
  onSeleccionar: (cursoId: string, nombre: string) => void
  onNavigate: (p: Pantalla) => void
}) {
  const { t, idioma } = useAppSettings()
  const asignaturas = getAsignaturas(idioma)
  // null = todavía cargando (los anillos no se dibujan hasta tener datos,
  // para no mostrar un "sin simulacros" falso durante la carga).
  const [medias, setMedias] = useState<Record<string, MediaCurso> | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelado = false
    getMediasPorCurso(userId).then((m) => {
      if (!cancelado) setMedias(m)
    })
    return () => {
      cancelado = true
    }
  }, [userId])

  const conDatos = asignaturas.filter((a) => medias?.[a.cursoId])
  const mediaGlobal =
    conDatos.length > 0
      ? Math.round(conDatos.reduce((acc, a) => acc + (medias?.[a.cursoId]?.media ?? 0), 0) / conDatos.length)
      : null
  const aprobadoDe = (cursoId: string) => CURSOS[cursoId]?.porcentajeAprobado ?? 70
  const aprobadas = conDatos.filter((a) => (medias?.[a.cursoId]?.media ?? 0) >= aprobadoDe(a.cursoId)).length
  const aprobadoGeneral = CURSOS[asignaturas[0]?.cursoId]?.porcentajeAprobado ?? 70

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-6">
        <h1 className="text-lg font-extrabold text-foreground">{t.asignaturas.titulo}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.asignaturas.subtitulo}</p>
      </div>

      {medias && (
        <div className="card-elevated mt-5 space-y-3.5 rounded-[22px] bg-card p-4 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <Anillo
              valor={mediaGlobal}
              color={mediaGlobal === null ? 'transparent' : colorNivel(mediaGlobal, aprobadoGeneral)}
              tamano={84}
              grosor={8}
              texto={mediaGlobal === null ? '—' : `${mediaGlobal}%`}
              textoClase="text-[22px] text-foreground"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-[13px] text-muted-foreground">{t.asignaturas.mediaGlobal}</p>
              <p className="text-[17px] font-extrabold leading-snug text-foreground">
                {mediaGlobal === null
                  ? t.asignaturas.sinMediaGlobal
                  : t.asignaturas.aprobarias(aprobadas, asignaturas.length)}
              </p>
              <p className="text-[13px] text-muted-foreground">{t.asignaturas.seApruebaCon(aprobadoGeneral)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { color: 'hsl(var(--primary))', texto: t.asignaturas.leyendaAprobado },
              { color: COLOR_CERCA, texto: t.asignaturas.leyendaCerca },
              { color: COLOR_FLOJO, texto: t.asignaturas.leyendaFlojo },
            ].map((l) => (
              <span
                key={l.texto}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-foreground"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                {l.texto}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-extrabold text-foreground">{t.asignaturas.elegir}</h2>
        <span className="text-right text-xs text-muted-foreground">{t.asignaturas.mediaUltimos}</span>
      </div>

      <div className="mt-3 space-y-2.5">
        {asignaturas.map((asig, i) => {
          const Icono = ICONO_CURSO[asig.cursoId] ?? Stethoscope
          const dato = medias?.[asig.cursoId] ?? null
          return (
            // El barrido va en un div aparte: si fuera en el botón, la
            // animación (con fill "both") anularía su active:scale al tocarlo.
            <div key={asig.id} className="anim-barrido" style={{ '--i': i } as CSSProperties}>
              <button
                onClick={() => onSeleccionar(asig.cursoId, asig.nombre)}
                className="card-elevated flex min-h-16 w-full items-center gap-3 rounded-2xl bg-card px-3 py-2.5 text-left transition active:scale-[0.98]"
                aria-label={dato ? `${asig.nombre}: ${dato.media}%` : asig.nombre}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                  <Icono className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold text-foreground">{asig.nombre}</span>
                  {medias && (
                    <span className="block text-xs text-muted-foreground">
                      {dato ? t.asignaturas.detalle(dato.intentos, dato.tendencia) : t.asignaturas.sinSimulacros}
                    </span>
                  )}
                </span>
                {medias && (
                  <Anillo
                    valor={dato?.media ?? null}
                    color={dato ? colorNivel(dato.media, aprobadoDe(asig.cursoId)) : 'transparent'}
                    tamano={48}
                    grosor={5}
                    texto={dato ? `${dato.media}%` : '—'}
                    textoClase={`text-xs ${dato ? 'text-foreground' : 'text-muted-foreground'}`}
                  />
                )}
              </button>
            </div>
          )
        })}

        <div
          className="anim-barrido flex items-center gap-4 rounded-2xl border border-dashed border-border p-4 text-muted-foreground"
          style={{ '--i': asignaturas.length } as CSSProperties}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary">
            <Plus className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1 text-sm font-bold">{t.configurar.masAsignaturas}</span>
        </div>
      </div>

      <BottomNav activo="simulacro" onNavigate={onNavigate} />
    </div>
  )
}

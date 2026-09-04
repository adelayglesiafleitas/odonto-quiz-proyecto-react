import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Lock,
  Play,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { RUTA_SOPORTE } from '@/lib/rutas'
import { getAcademiaHabilitada } from '@/lib/academiaAccesoRemoto'
import type { Diccionario } from '@/lib/i18n'
import type { Pantalla } from '@/types'
import {
  CAPITULOS_INMACULADA,
  INTRO_CAP1,
  LIBRO_INMACULADA,
  NODOS_CAP1,
  REPASO_CAP1_PREGUNTAS,
  TEMAS_CAP1,
  type NodoRuta,
  type PreguntaAcademia,
} from '@/data/academiaInmaculada'

/**
 * Pestaña "Academia": biblioteca de estudio por libro/capítulo, separada del
 * banco de preguntas de Simulacro/Estudio. Navegación interna en 4 niveles
 * (sin rutas nuevas, mismo patrón que el filtro de capítulo de Estudio.tsx):
 * Home (lista de libros) → Libro (índice real de 16 capítulos) → Ruta
 * (nodos del Capítulo 1) → Nodo (contenido + autoevaluación).
 *
 * Por ahora solo el Capítulo 1 ("Discapacitado Físico") tiene contenido
 * real armado — ver src/data/academiaInmaculada.ts para el porqué y las
 * salvedades de derechos de autor sobre las fotos.
 *
 * La gamificación (racha/gemas/corazones) que se diseñó en el mockup queda
 * pausada a pedido explícito — no se implementa acá todavía.
 *
 * El progreso se guarda en localStorage (por dispositivo/navegador, no en
 * Supabase): alcanza para el piloto y es independiente de la llave de
 * acceso admin-only (ver más abajo, `getAcademiaHabilitada`) — una vez
 * adentro, el progreso sigue siendo local.
 *
 * Acceso: toda la pestaña queda detrás de `perfiles.academia_habilitada`
 * (boolean, default false), controlado únicamente por un admin desde
 * odonto-quiz-admin (Usuarios.tsx) — ver claude/academia-control-acceso-
 * admin-diseno.md. El botón de la barra inferior sigue siempre visible;
 * sin acceso, lo que cambia es que `PantallaHome` se reemplaza por
 * `PantallaSinAcceso`.
 */

type VistaAcademia = 'home' | 'libro' | 'ruta' | 'nodo' | 'proximo'
type EstadoNodo = 'bloqueado' | 'disponible' | 'completado'
interface ProgresoNodo {
  estado: EstadoNodo
  estrellas?: number
}
type ProgresoCap1 = Record<string, ProgresoNodo>

const CLAVE_PROGRESO = 'academia_progreso_inmaculada_cap1_v1'
const CLAVE_RESPUESTAS = 'academia_respuestas_inmaculada_cap1_v1'

function progresoInicial(): ProgresoCap1 {
  return {
    intro: { estado: 'disponible' },
    pc: { estado: 'bloqueado' },
    epi: { estado: 'bloqueado' },
    dm: { estado: 'bloqueado' },
    repaso: { estado: 'bloqueado' },
  }
}

function cargarProgreso(): ProgresoCap1 {
  try {
    const guardado = localStorage.getItem(CLAVE_PROGRESO)
    if (guardado) return { ...progresoInicial(), ...(JSON.parse(guardado) as ProgresoCap1) }
  } catch {
    // localStorage no disponible (modo privado, etc.): seguimos con el estado inicial.
  }
  return progresoInicial()
}

function cargarRespuestas(): Record<string, number> {
  try {
    const guardado = localStorage.getItem(CLAVE_RESPUESTAS)
    if (guardado) return JSON.parse(guardado) as Record<string, number>
  } catch {
    // ignorar
  }
  return {}
}

function guardar(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // ignorar — el progreso simplemente no persiste esta sesión.
  }
}

function claveRespuesta(nodoId: string, qi: number): string {
  return `${nodoId}-${qi}`
}

export function Academia({ onNavigate }: { onNavigate: (p: Pantalla) => void }) {
  const { t } = useAppSettings()
  const { key: navegacionKey } = useLocation()
  const [vista, setVista] = useState<VistaAcademia>('home')
  const [nodoActivoId, setNodoActivoId] = useState<string | null>(null)
  const [progreso, setProgreso] = useState<ProgresoCap1>(() => cargarProgreso())
  const [respuestas, setRespuestas] = useState<Record<string, number>>(() => cargarRespuestas())
  // null mientras se consulta el perfil — evita el parpadeo de mostrar el
  // cartel de "sin acceso" un instante antes de confirmar que sí lo tiene.
  const [academiaHabilitada, setAcademiaHabilitada] = useState<boolean | null>(null)

  // Academia no tiene rutas propias para libro/ruta/nodo (todo vive en el
  // estado `vista` de acá adentro) — así que si el usuario ya está adentro
  // (por ejemplo viendo un nodo) y vuelve a tocar la pestaña "Academia" de
  // la barra inferior, React Router navega a la misma URL y el componente
  // ni se entera. `location.key` sí cambia en cada navegación aunque la URL
  // sea idéntica, así que lo usamos como señal de "se tocó la pestaña de
  // nuevo" para volver siempre al inicio, en vez de quedarse donde estaba.
  useEffect(() => {
    setVista('home')
    setNodoActivoId(null)
  }, [navegacionKey])

  useEffect(() => {
    let cancelado = false
    getAcademiaHabilitada().then((habilitada) => {
      if (!cancelado) setAcademiaHabilitada(habilitada)
    })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => guardar(CLAVE_PROGRESO, progreso), [progreso])
  useEffect(() => guardar(CLAVE_RESPUESTAS, respuestas), [respuestas])

  // Piloto: solo el Capítulo 1 tiene seguimiento de progreso real todavía
  // (ver src/data/academiaInmaculada.ts). Esto habilita únicamente al
  // Capítulo 2 a mostrarse "desbloqueado por progreso" en PantallaLibro en
  // cuanto se termina — los capítulos 3 en adelante siguen con el candado
  // genérico de "próximamente" hasta que tengan su propio contenido.
  const cap1Completo = NODOS_CAP1.every((n) => progreso[n.id]?.estado === 'completado')

  function siguienteNodoId(id: string): string | null {
    const i = NODOS_CAP1.findIndex((n) => n.id === id)
    return i >= 0 && i < NODOS_CAP1.length - 1 ? NODOS_CAP1[i + 1].id : null
  }

  function abrirNodo(id: string) {
    if (progreso[id]?.estado === 'bloqueado') return
    setNodoActivoId(id)
    setVista('nodo')
  }

  function volverARuta() {
    setVista('ruta')
    setNodoActivoId(null)
  }

  function responder(clave: string, opcionIdx: number) {
    setRespuestas((prev) => (prev[clave] !== undefined ? prev : { ...prev, [clave]: opcionIdx }))
  }

  function completarNodo(id: string, estrellas?: number) {
    setProgreso((prev) => {
      const siguiente = siguienteNodoId(id)
      const next: ProgresoCap1 = { ...prev, [id]: { estado: 'completado', estrellas } }
      if (siguiente && next[siguiente]?.estado === 'bloqueado') {
        next[siguiente] = { ...next[siguiente], estado: 'disponible' }
      }
      return next
    })
    volverARuta()
  }

  return (
    <div className="app-shell bg-background pb-28">
      {academiaHabilitada === null && (
        <div className="flex justify-center pt-32">
          <Spinner className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {academiaHabilitada === false && <PantallaSinAcceso t={t} />}

      {academiaHabilitada === true && (
        <>
          {vista === 'home' && <PantallaHome t={t} onAbrirLibro={() => setVista('libro')} />}

          {vista === 'libro' && (
            <PantallaLibro
              t={t}
              cap1Completo={cap1Completo}
              onVolver={() => setVista('home')}
              onAbrirCapitulo={() => setVista('ruta')}
              onAbrirProximo={() => setVista('proximo')}
            />
          )}

          {vista === 'proximo' && (
            <PantallaProximoCapitulo t={t} onVolver={() => setVista('libro')} onIrACap1={() => setVista('ruta')} />
          )}

          {vista === 'ruta' && (
            <PantallaRuta t={t} progreso={progreso} onVolver={() => setVista('libro')} onAbrirNodo={abrirNodo} />
          )}

          {vista === 'nodo' && nodoActivoId && (
            <PantallaNodo
              t={t}
              nodoId={nodoActivoId}
              progreso={progreso}
              respuestas={respuestas}
              onResponder={responder}
              onCompletar={completarNodo}
              onVolver={volverARuta}
            />
          )}
        </>
      )}

      <BottomNav activo="academia" onNavigate={onNavigate} />
    </div>
  )
}

function PantallaSinAcceso({ t }: { t: Diccionario }) {
  const navigate = useNavigate()
  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-16 flex flex-col items-center px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Lock className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-base font-bold text-foreground">{t.academia.sinAccesoTitulo}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.academia.sinAccesoTexto}</p>
        <Button
          onClick={() => navigate(RUTA_SOPORTE, { state: { abrirNuevo: true } })}
          className="mt-5 h-11 rounded-2xl px-6 font-bold"
        >
          {t.academia.sinAccesoBoton}
        </Button>
      </div>
    </div>
  )
}

function PantallaHome({ t, onAbrirLibro }: { t: Diccionario; onAbrirLibro: () => void }) {
  const disponibles = CAPITULOS_INMACULADA.filter((c) => c.listo).length
  return (
    <div className="px-6 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-7">
        <p className="text-xs font-bold uppercase tracking-wide text-accent">{t.academia.homeKicker}</p>
        <h1 className="mt-1 text-lg font-extrabold text-foreground">{t.academia.homeSubtitulo}</h1>
      </div>

      <button
        onClick={onAbrirLibro}
        className="card-elevated mt-5 flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left transition active:scale-[0.99]"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
          <BookOpen className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-foreground">{LIBRO_INMACULADA.titulo}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{t.academia.libroAutor}</span>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-bold text-success">
            {t.academia.homeCapDisponibles(disponibles)}
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </button>

      <div className="mt-6 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {t.academia.proximamente}
        </span>
      </div>
    </div>
  )
}

/**
 * Piloto: solo el Capítulo 1 tiene contenido y seguimiento de progreso real
 * (ver src/data/academiaInmaculada.ts). Esta función decide, para un
 * capítulo SIN contenido todavía, si ya "se ganó" mostrarse desbloqueado por
 * haber terminado el capítulo anterior — hoy eso solo puede ser cierto para
 * el Capítulo 2 (el único cuyo capítulo anterior, el 1, tiene progreso
 * real). El resto sigue con el candado genérico de "próximamente" hasta que
 * tengan su propio contenido y su propio seguimiento.
 */
function capituloAnteriorCompletado(numeroAnterior: number, cap1Completo: boolean): boolean {
  return numeroAnterior === 1 && cap1Completo
}

function PantallaLibro({
  t,
  cap1Completo,
  onVolver,
  onAbrirCapitulo,
  onAbrirProximo,
}: {
  t: Diccionario
  cap1Completo: boolean
  onVolver: () => void
  onAbrirCapitulo: () => void
  onAbrirProximo: () => void
}) {
  return (
    <div className="pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">{LIBRO_INMACULADA.titulo}</h1>
          <p className="truncate text-xs font-medium text-muted-foreground">{t.academia.libroAutor}</p>
        </div>
      </div>

      <p className="mt-4 px-6 text-sm leading-relaxed text-muted-foreground">{t.academia.libroDescripcion}</p>

      <div className="mt-4 space-y-2.5 px-6">
        {CAPITULOS_INMACULADA.filter(
          // Un capítulo sin contenido real todavía ni siquiera aparece en la
          // lista hasta que se gana su lugar completando el anterior — nada
          // de mostrarlo bloqueado/atenuado de entrada.
          (cap) => cap.listo || capituloAnteriorCompletado(cap.numero - 1, cap1Completo),
        ).map((cap) => {
          const handleClick = cap.listo ? onAbrirCapitulo : onAbrirProximo
          return (
            <button
              key={cap.numero}
              onClick={handleClick}
              className="card-elevated flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left transition active:scale-[0.99]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-sm font-extrabold text-accent">
                {cap.numero}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">{cap.titulo}</span>
                {cap.subtitulo && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{cap.subtitulo}</span>}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PantallaProximoCapitulo({
  t,
  onVolver,
  onIrACap1,
}: {
  t: Diccionario
  onVolver: () => void
  onIrACap1: () => void
}) {
  const cap2 = CAPITULOS_INMACULADA.find((c) => c.numero === 2)
  return (
    <div className="pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">
            {t.academia.libroCapituloLabel(cap2?.numero ?? 2)}
          </h1>
          {cap2 && <p className="truncate text-xs font-medium text-muted-foreground">{cap2.titulo}</p>}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/12 text-accent">
          <Sparkles className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-base font-bold text-foreground">{t.academia.libroProximamente}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.academia.proximoCapMensaje}</p>
        <Button onClick={onIrACap1} className="mt-5 h-11 rounded-2xl px-6 font-bold">
          {t.academia.proximoCapVolverCap1}
        </Button>
      </div>
    </div>
  )
}

/**
 * Geometría de la "ruta" del Capítulo 1 (rediseño aprobado por el usuario a
 * partir del concepto visual `ruta-concepto.html`): un camino curvo conecta
 * los nodos en zigzag, en vez de la grilla suelta original.
 *
 * x en % del ancho del contenedor (no px) para que funcione en cualquier
 * ancho de pantalla — el SVG usa viewBox="0 0 100 <alto>" con
 * preserveAspectRatio="none" y width:100%, así 1 unidad de x = 1% del ancho
 * real, igual que el x% de los nodos posicionados en HTML. y sí está en px
 * (altura del contenedor es fija), así 1 unidad de y = 1px real tanto en el
 * SVG como en los nodos — ambos quedan sincronizados sin importar el ancho
 * del dispositivo.
 */
const NODOS_POS_RUTA: { x: number; y: number }[] = [
  { x: 50, y: 86 },
  { x: 25, y: 236 },
  { x: 75, y: 386 },
  { x: 25, y: 536 },
  { x: 50, y: 706 },
]
const RUTA_ALTO_PX = 760

function construirCurvaRuta(puntos: { x: number; y: number }[]): string {
  if (puntos.length === 0) return ''
  let d = `M ${puntos[0].x} ${puntos[0].y}`
  for (let i = 1; i < puntos.length; i++) {
    const p0 = puntos[i - 1]
    const p1 = puntos[i]
    const midY = (p0.y + p1.y) / 2
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`
  }
  return d
}

function PantallaRuta({
  t,
  progreso,
  onVolver,
  onAbrirNodo,
}: {
  t: Diccionario
  progreso: ProgresoCap1
  onVolver: () => void
  onAbrirNodo: (id: string) => void
}) {
  const capitulo = CAPITULOS_INMACULADA[0]
  const puntos = NODOS_CAP1.map((_, i) => NODOS_POS_RUTA[i] ?? { x: 50, y: 86 + i * 150 })
  const completados = NODOS_CAP1.filter((n) => progreso[n.id]?.estado === 'completado').length
  const ultimoCompletadoIdx = NODOS_CAP1.reduce(
    (acc, n, i) => (progreso[n.id]?.estado === 'completado' ? i : acc),
    -1,
  )
  const dFondo = construirCurvaRuta(puntos)
  const dHecho = ultimoCompletadoIdx > 0 ? construirCurvaRuta(puntos.slice(0, ultimoCompletadoIdx + 1)) : ''

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">{t.academia.libroCapituloLabel(capitulo.numero)}</h1>
          <p className="truncate text-xs font-medium text-muted-foreground">{capitulo.titulo}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2.5 px-6">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-500"
            style={{ width: `${(completados / NODOS_CAP1.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 whitespace-nowrap text-[10.5px] font-bold text-muted-foreground">
          {t.academia.rutaCompletados(completados, NODOS_CAP1.length)}
        </span>
      </div>

      <div className="academia-path-wrap relative mx-6 mt-2" style={{ height: RUTA_ALTO_PX }}>
        <svg
          className="absolute inset-0"
          width="100%"
          height={RUTA_ALTO_PX}
          viewBox={`0 0 100 ${RUTA_ALTO_PX}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={dFondo} fill="none" stroke="hsl(var(--border))" strokeWidth={5} strokeDasharray="1 15" strokeLinecap="round" />
          {dHecho && <path d={dHecho} fill="none" stroke="hsl(var(--success))" strokeWidth={5.5} strokeLinecap="round" />}
        </svg>

        {NODOS_CAP1.map((nodo, i) => {
          const prog = progreso[nodo.id] ?? { estado: 'bloqueado' as EstadoNodo }
          const punto = puntos[i]
          const esJefe = nodo.tipo === 'repaso'
          const bloqueado = prog.estado === 'bloqueado'
          const actual = prog.estado === 'disponible'
          const completado = prog.estado === 'completado'
          return (
            <div
              key={nodo.id}
              className="absolute flex w-[118px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
              style={{ left: `${punto.x}%`, top: `${punto.y}px` }}
            >
              <button
                onClick={() => onAbrirNodo(nodo.id)}
                disabled={bloqueado}
                aria-label={nodo.titulo}
                title={bloqueado ? t.academia.rutaBloqueado : nodo.titulo}
                data-status={actual ? 'actual' : prog.estado}
                className={`academia-node-btn relative transition ${esJefe ? 'is-boss h-24 w-24' : 'h-[76px] w-[76px]'} ${
                  bloqueado ? '' : 'active:scale-95'
                }`}
              >
                {actual && <span className="academia-bubble">{t.academia.rutaEmpezar}</span>}
                <span className="academia-face">
                  {completado ? (
                    <Check className="h-7 w-7" strokeWidth={2.5} />
                  ) : bloqueado ? (
                    <Lock className="h-6 w-6" />
                  ) : esJefe ? (
                    <Trophy className="h-7 w-7" />
                  ) : (
                    <Play className="h-6 w-6" fill="currentColor" />
                  )}
                </span>
              </button>
              <span
                className={`max-w-[112px] text-center text-[11px] font-extrabold leading-tight ${
                  bloqueado ? 'text-muted-foreground/70' : 'text-foreground'
                }`}
              >
                {nodo.titulo}
              </span>
              {completado && prog.estrellas !== undefined && (
                <span className="flex items-center gap-0.5">
                  {[0, 1, 2].map((s) => (
                    <Star
                      key={s}
                      className={`h-2.5 w-2.5 ${
                        s < (prog.estrellas ?? 0) ? 'fill-[hsl(var(--amber))] text-[hsl(var(--amber))]' : 'fill-border text-border'
                      }`}
                    />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NodoLayout({
  titulo,
  subtitulo,
  onVolver,
  children,
}: {
  titulo: string
  subtitulo?: string
  onVolver: () => void
  children: ReactNode
}) {
  return (
    <div className="pt-6">
      <div className="flex items-center justify-between gap-3 px-6">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3 px-6">
        <button onClick={onVolver} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold text-foreground">{titulo}</h1>
          {subtitulo && <p className="truncate text-xs font-medium text-muted-foreground">{subtitulo}</p>}
        </div>
      </div>
      <div className="mt-4 space-y-3 px-6">{children}</div>
    </div>
  )
}

function TarjetaContenido({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="card-elevated rounded-2xl bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        {titulo}
      </h3>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function BotonContinuar({ onClick, texto, disabled }: { onClick: () => void; texto: string; disabled?: boolean }) {
  return (
    <div className="pb-2 pt-1">
      <Button onClick={onClick} disabled={disabled} className="h-12 w-full rounded-2xl bg-primary font-bold hover:bg-primary/90">
        {texto}
      </Button>
    </div>
  )
}

function BloqueQuiz({
  pregunta,
  qi,
  clave,
  respuestas,
  soloLectura,
  onResponder,
}: {
  pregunta: PreguntaAcademia
  qi: number
  clave: string
  respuestas: Record<string, number>
  soloLectura: boolean
  onResponder: (clave: string, opcionIdx: number) => void
}) {
  const elegido = respuestas[clave]
  const bloqueado = soloLectura || elegido !== undefined
  return (
    <div className={qi > 0 ? 'mt-4 border-t border-border pt-4' : ''}>
      <p className="text-[13px] font-bold leading-snug text-foreground">
        {qi + 1}. {pregunta.pregunta}
      </p>
      <div className="mt-2.5 space-y-1.5">
        {pregunta.opciones.map((op, oi) => {
          let estilo = 'bg-secondary text-foreground/80'
          if (bloqueado) {
            if (oi === pregunta.correcta) estilo = 'bg-success/12 text-success'
            else if (oi === elegido) estilo = 'bg-destructive/12 text-destructive'
            else estilo = 'bg-secondary/50 text-muted-foreground'
          }
          return (
            <button
              key={oi}
              disabled={bloqueado}
              onClick={() => onResponder(clave, oi)}
              className={`w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition ${estilo}`}
            >
              {op}
            </button>
          )
        })}
      </div>
      {bloqueado && <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{pregunta.feedback}</p>}
    </div>
  )
}

function calcularEstrellas(preguntas: PreguntaAcademia[], nodoId: string, respuestas: Record<string, number>): number {
  let fallos = 0
  preguntas.forEach((q, qi) => {
    if (respuestas[claveRespuesta(nodoId, qi)] !== q.correcta) fallos++
  })
  return fallos === 0 ? 3 : fallos === 1 ? 2 : 1
}

function quizCompleto(preguntas: PreguntaAcademia[], nodoId: string, respuestas: Record<string, number>): boolean {
  return preguntas.every((_, qi) => respuestas[claveRespuesta(nodoId, qi)] !== undefined)
}

function PantallaNodo({
  t,
  nodoId,
  progreso,
  respuestas,
  onResponder,
  onCompletar,
  onVolver,
}: {
  t: Diccionario
  nodoId: string
  progreso: ProgresoCap1
  respuestas: Record<string, number>
  onResponder: (clave: string, opcionIdx: number) => void
  onCompletar: (nodoId: string, estrellas?: number) => void
  onVolver: () => void
}) {
  const nodo: NodoRuta | undefined = NODOS_CAP1.find((n) => n.id === nodoId)
  if (!nodo) return null
  const prog = progreso[nodoId] ?? { estado: 'bloqueado' as EstadoNodo }
  const soloLectura = prog.estado === 'completado'
  const subtituloCap1 = 'Capítulo 1 · Discapacitado Físico'

  if (nodo.tipo === 'intro') {
    return (
      <NodoLayout titulo={nodo.titulo} subtitulo={subtituloCap1} onVolver={onVolver}>
        {INTRO_CAP1.bloques.map((b) => (
          <TarjetaContenido key={b.titulo} titulo={b.titulo}>
            <p className="text-sm leading-relaxed text-foreground/85">{b.texto}</p>
          </TarjetaContenido>
        ))}
        <BotonContinuar
          onClick={() => onCompletar(nodoId)}
          texto={soloLectura ? t.academia.nodoYaCompletado : t.academia.nodoContinuar}
        />
      </NodoLayout>
    )
  }

  if (nodo.tipo === 'repaso') {
    if (prog.estado === 'bloqueado') {
      return (
        <NodoLayout titulo={t.academia.repasoTitulo} onVolver={onVolver}>
          <div className="mt-6 flex flex-col items-center px-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Lock className="h-6 w-6" />
            </span>
            <h2 className="mt-3 text-base font-bold text-foreground">{t.academia.repasoBloqueadoTitulo}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{t.academia.repasoBloqueadoTexto}</p>
          </div>
        </NodoLayout>
      )
    }
    const preguntas = REPASO_CAP1_PREGUNTAS
    const completo = quizCompleto(preguntas, 'repaso', respuestas)
    return (
      <NodoLayout titulo={t.academia.repasoTitulo} subtitulo={CAPITULOS_INMACULADA[0].titulo} onVolver={onVolver}>
        <TarjetaContenido titulo={t.academia.nodoAutoevaluacion}>
          {preguntas.map((q, qi) => (
            <BloqueQuiz
              key={qi}
              pregunta={q}
              qi={qi}
              clave={claveRespuesta('repaso', qi)}
              respuestas={respuestas}
              soloLectura={soloLectura}
              onResponder={onResponder}
            />
          ))}
        </TarjetaContenido>
        <BotonContinuar
          disabled={!completo && !soloLectura}
          texto={soloLectura ? t.academia.nodoYaCompletado : t.academia.repasoTerminar}
          onClick={() => {
            if (soloLectura) {
              onVolver()
              return
            }
            onCompletar('repaso', calcularEstrellas(preguntas, 'repaso', respuestas))
          }}
        />
      </NodoLayout>
    )
  }

  // tipo === 'leccion'
  const tema = TEMAS_CAP1[nodo.temaId!]
  const completo = quizCompleto(tema.quiz, nodoId, respuestas)
  return (
    <NodoLayout titulo={tema.nombre} subtitulo={subtituloCap1} onVolver={onVolver}>
      <TarjetaContenido titulo={t.academia.nodoResumen}>
        <p className="text-sm leading-relaxed text-foreground/85">{tema.resumen}</p>
      </TarjetaContenido>

      <TarjetaContenido titulo={t.academia.nodoConceptos}>
        <div className="flex flex-wrap gap-1.5">
          {tema.conceptos.map((c) => (
            <span key={c} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-foreground/80">
              {c}
            </span>
          ))}
        </div>
      </TarjetaContenido>

      <TarjetaContenido titulo={t.academia.nodoClasificacion}>
        <div className="overflow-hidden rounded-xl border border-border">
          {tema.tabla.map(([a, b], i) => (
            <div key={a} className={`flex gap-3 px-3 py-2 text-xs ${i % 2 === 1 ? 'bg-secondary/50' : ''}`}>
              <span className="w-[38%] shrink-0 font-bold text-foreground">{a}</span>
              <span className="text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>
      </TarjetaContenido>

      <TarjetaContenido titulo={t.academia.nodoMnemo}>
        <div className="rounded-xl bg-accent/8 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-accent">{t.academia.nodoMnemoEtiqueta}</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/85">{tema.mnemo}</p>
        </div>
      </TarjetaContenido>

      {tema.figuras && (
        <TarjetaContenido titulo={t.academia.nodoFiguras}>
          <div className="space-y-3">
            {tema.figuras.map((f) => (
              <figure key={f.src}>
                <div className="relative overflow-hidden rounded-xl">
                  <img src={f.src} alt={f.caption} className="w-full object-cover" />
                  {f.temporal && (
                    <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                      {t.academia.nodoFiguraTemporal}
                    </span>
                  )}
                </div>
                <figcaption className="mt-1.5 text-[11px] italic leading-snug text-muted-foreground">{f.caption}</figcaption>
              </figure>
            ))}
          </div>
        </TarjetaContenido>
      )}

      <div className="card-elevated rounded-2xl bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          {t.academia.nodoCaso}
        </h3>
        <span className="mt-2 inline-block rounded-full bg-accent/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
          {t.academia.nodoCasoEtiqueta}
        </span>
        <p className="mt-2 text-sm font-medium leading-snug text-foreground">{tema.caso}</p>
        <div className="mt-3 rounded-xl bg-secondary/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t.academia.nodoRespuestaEtiqueta}</p>
          <p className="mt-1 text-[13px] leading-snug text-foreground/80">{tema.respuesta}</p>
        </div>
      </div>

      <TarjetaContenido titulo={t.academia.nodoAutoevaluacion}>
        {tema.quiz.map((q, qi) => (
          <BloqueQuiz
            key={qi}
            pregunta={q}
            qi={qi}
            clave={claveRespuesta(nodoId, qi)}
            respuestas={respuestas}
            soloLectura={soloLectura}
            onResponder={onResponder}
          />
        ))}
      </TarjetaContenido>

      <BotonContinuar
        disabled={!completo && !soloLectura}
        texto={soloLectura ? t.academia.nodoYaCompletado : t.academia.nodoTerminar}
        onClick={() => {
          if (soloLectura) {
            onVolver()
            return
          }
          onCompletar(nodoId, calcularEstrellas(tema.quiz, nodoId, respuestas))
        }}
      />
    </NodoLayout>
  )
}

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  ListChecks,
  Lock,
  Maximize2,
  Play,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import { Spinner } from '@/components/Spinner'
import { Button } from '@/components/ui/button'
import { RUTA_SOPORTE } from '@/lib/rutas'
import { getAcademiaHabilitada } from '@/lib/academiaAccesoRemoto'
import {
  cargarProgresoAcademia as cargarProgreso,
  CLAVE_PROGRESO_ACADEMIA as CLAVE_PROGRESO,
  guardarAcademia as guardar,
  type EstadoNodo,
  type ProgresoCap1,
} from '@/lib/academiaProgresoLocal'
import type { Diccionario } from '@/lib/i18n'
import type { Pantalla } from '@/types'
import {
  CAPITULOS_INMACULADA,
  INTRO_CAP1,
  LIBRO_INMACULADA,
  NODOS_CAP1,
  PRUEBAS_CAP1,
  TEMAS_CAP1,
  VIDEOS_CAP1,
  type CapituloLibro,
  type NodoRuta,
  type PreguntaAcademia,
  type TemaAcademia,
  type VideoAcademia,
} from '@/data/academiaInmaculada'

/**
 * Pestaña "Academia": biblioteca de estudio por libro/capítulo, separada del
 * banco de preguntas de Simulacro/Estudio. Navegación interna en 4 niveles
 * (sin rutas nuevas, mismo patrón que el filtro de capítulo de Estudio.tsx):
 * Home (lista de libros) → Libro (mapa con el índice real de 16 capítulos,
 * camino de nodos) → Ruta (mapa con los 7 nodos del Capítulo 1) → Nodo
 * (video o prueba).
 *
 * Rediseño 2026-09-16 (aprobado sobre el mockup del canvas de diseño
 * "Academia — Mapa de capítulos"): `PantallaLibro` pasa de lista plana a
 * camino de nodos igual al de `PantallaRuta` — los 16 capítulos quedan
 * siempre visibles (los bloqueados atenuados con candado, nunca ocultos) y
 * tocar uno desbloqueado abre una hoja inferior de confirmación antes de
 * navegar. Además, cada "prueba" deja de mostrar sus 5 preguntas fijas:
 * ahora muestra 1 sola pregunta elegida al azar del pool (ver
 * `PRUEBAS_CAP1` en academiaInmaculada.ts, que no cambió), y reintentar
 * vuelve a sortear una pregunta distinta — ver `NodoPrueba` más abajo. Como
 * la pregunta mostrada ya no es determinística, dejó de tener sentido
 * persistir "qué opción eligió" por pregunta (`respuestas` en
 * localStorage): el estado de la prueba en curso ahora es puramente local
 * al nodo (se resetea con `key={nodoId}` al cambiar de nodo, igual que ya
 * hacía `NodoVideo`).
 *
 * Por ahora solo el Capítulo 1 ("Discapacitado Físico") tiene contenido
 * real armado, con el formato video + prueba — ver
 * src/data/academiaInmaculada.ts para el contenido y las salvedades de
 * derechos de autor.
 *
 * La gamificación (racha/gemas/corazones, estrellas por prueba) que se
 * diseñó en mockups anteriores queda pausada a pedido explícito — no se
 * implementa acá todavía.
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

// ProgresoCap1/EstadoNodo y las funciones de carga/guardado de localStorage
// se movieron a src/lib/academiaProgresoLocal.ts (importadas arriba, con
// alias para no tocar el resto de este archivo) — así Estadisticas.tsx y
// Configuracion.tsx pueden leer y borrar el mismo progreso sin duplicar el
// parseo acá.

export function Academia({ onNavigate }: { onNavigate: (p: Pantalla) => void }) {
  const { t } = useAppSettings()
  const { key: navegacionKey } = useLocation()
  const [vista, setVista] = useState<VistaAcademia>('home')
  const [nodoActivoId, setNodoActivoId] = useState<string | null>(null)
  const [progreso, setProgreso] = useState<ProgresoCap1>(() => cargarProgreso())
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

  // "Restablecer estadísticas" (Configuracion.tsx) borra esta misma clave de
  // localStorage. Si esta pantalla ya estaba abierta en OTRA pestaña/ventana
  // en el momento del borrado, el evento 'storage' del navegador (que solo
  // dispara en las pestañas que NO hicieron el cambio) avisa acá para
  // recargar el progreso en memoria — si no, el próximo `guardar` de esta
  // pestaña reescribiría el progreso viejo encima del borrado recién hecho.
  useEffect(() => {
    function alCambiarStorage(e: StorageEvent) {
      // e.key === null pasa con localStorage.clear() (no lo usamos acá,
      // pero cubre el caso igual); si no, solo nos importa esta clave.
      if (e.key !== null && e.key !== CLAVE_PROGRESO) return
      setProgreso(cargarProgreso())
    }
    window.addEventListener('storage', alCambiarStorage)
    return () => window.removeEventListener('storage', alCambiarStorage)
  }, [])

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

  function completarNodo(id: string) {
    setProgreso((prev) => {
      const siguiente = siguienteNodoId(id)
      const next: ProgresoCap1 = { ...prev, [id]: { estado: 'completado' } }
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
            <PantallaNodo t={t} nodoId={nodoActivoId} progreso={progreso} onCompletar={completarNodo} onVolver={volverARuta} />
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
        className="card-elevated mt-5 flex w-full items-start gap-3.5 rounded-2xl bg-card p-4 text-left transition active:scale-[0.99]"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
          <BookOpen className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="block text-sm font-bold leading-snug text-foreground">{LIBRO_INMACULADA.titulo}</span>
          <span className="mt-1 block text-xs leading-snug text-muted-foreground">{t.academia.libroAutor}</span>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-bold text-success">
            {t.academia.homeCapDisponibles(disponibles)}
          </span>
        </span>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
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

type EstadoCapitulo = 'bloqueado' | 'disponible' | 'completado'

/**
 * Estado de cada capítulo en el mapa de `PantallaLibro`. Piloto: solo el
 * Capítulo 1 tiene contenido y seguimiento real (ver
 * src/data/academiaInmaculada.ts) — el resto se desbloquea "por progreso"
 * en cuanto se completa el anterior (hoy eso solo alcanza a habilitar el
 * Capítulo 2), pero sigue sin contenido propio hasta que lo tenga: tocarlo
 * lleva a `PantallaProximoCapitulo` en vez de a una ruta real.
 */
function estadoCapitulo(cap: CapituloLibro, cap1Completo: boolean): EstadoCapitulo {
  if (cap.numero === 1) return cap1Completo ? 'completado' : 'disponible'
  if (capituloAnteriorCompletado(cap.numero - 1, cap1Completo)) return 'disponible'
  return 'bloqueado'
}

/**
 * Geometría del mapa de los 16 capítulos del libro — mismo patrón de
 * camino en zigzag que `NODOS_POS_RUTA`/`construirCurvaRuta` más abajo
 * (rediseño 2026-09-16, aprobado sobre el mockup `Main.dc.html`). A
 * diferencia de la ruta interna de un capítulo, acá TODOS los nodos quedan
 * siempre visibles (los bloqueados se atenúan con candado, nunca se
 * ocultan) para que se vea el índice completo del libro desde el principio.
 *
 * `MAPA_Y_START` quedó en 100 (no 68) para darle lugar arriba a la burbuja
 * "Empezar" del primer nodo: esa burbuja es `position: absolute; top: -38px`
 * respecto del botón (`.academia-bubble` en index.css) y el nodo entero se
 * centra verticalmente con `-translate-y-1/2` sobre su fila completa
 * (botón + etiqueta) — con 68 quedaba recortada por el `overflow-hidden`
 * del contenedor `.academia-path-wrap`.
 */
const MAPA_Y_START = 100
const MAPA_Y_STEP = 128
const CAPITULOS_POS_MAPA: { x: number; y: number }[] = (() => {
  const xPattern = [50, 25, 75, 25, 75, 25, 75, 25, 75, 25, 75, 25, 75, 25, 75, 50]
  return CAPITULOS_INMACULADA.map((_, i) => ({ x: xPattern[i] ?? 50, y: MAPA_Y_START + i * MAPA_Y_STEP }))
})()
const MAPA_ALTO_PX = MAPA_Y_START + (CAPITULOS_INMACULADA.length - 1) * MAPA_Y_STEP + 90

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
  const [capSeleccionado, setCapSeleccionado] = useState<CapituloLibro | null>(null)
  const completados = CAPITULOS_INMACULADA.filter((cap) => estadoCapitulo(cap, cap1Completo) === 'completado').length
  const ultimoCompletadoIdx = CAPITULOS_INMACULADA.reduce(
    (acc, cap, i) => (estadoCapitulo(cap, cap1Completo) === 'completado' ? i : acc),
    -1,
  )
  const dFondo = construirCurvaRuta(CAPITULOS_POS_MAPA)
  const dHecho = ultimoCompletadoIdx > 0 ? construirCurvaRuta(CAPITULOS_POS_MAPA.slice(0, ultimoCompletadoIdx + 1)) : ''

  function confirmarApertura() {
    if (!capSeleccionado) return
    const handler = capSeleccionado.listo ? onAbrirCapitulo : onAbrirProximo
    setCapSeleccionado(null)
    handler()
  }

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

      <p className="mt-3 px-6 text-xs leading-relaxed text-muted-foreground">{t.academia.libroDescripcion}</p>

      <div className="mt-3.5 flex items-center gap-2.5 px-6">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-500"
            style={{ width: `${(completados / CAPITULOS_INMACULADA.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 whitespace-nowrap text-[10.5px] font-bold text-muted-foreground">
          {t.academia.rutaCompletados(completados, CAPITULOS_INMACULADA.length)}
        </span>
      </div>

      <div className="academia-path-wrap relative mx-6 mt-4 overflow-hidden" style={{ height: MAPA_ALTO_PX }}>
        <svg
          className="absolute inset-0"
          width="100%"
          height={MAPA_ALTO_PX}
          viewBox={`0 0 100 ${MAPA_ALTO_PX}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={dFondo} fill="none" stroke="hsl(var(--border))" strokeWidth={5} strokeDasharray="1 15" strokeLinecap="round" />
          {dHecho && <path d={dHecho} fill="none" stroke="hsl(var(--success))" strokeWidth={5.5} strokeLinecap="round" />}
        </svg>

        {CAPITULOS_INMACULADA.map((cap, i) => {
          const estado = estadoCapitulo(cap, cap1Completo)
          const punto = CAPITULOS_POS_MAPA[i]
          const bloqueado = estado === 'bloqueado'
          const actual = estado === 'disponible'
          const completado = estado === 'completado'
          return (
            <div
              key={cap.numero}
              className="absolute flex w-[118px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
              style={{ left: `${punto.x}%`, top: `${punto.y}px` }}
            >
              <button
                onClick={() => setCapSeleccionado(cap)}
                disabled={bloqueado}
                aria-label={cap.titulo}
                title={bloqueado ? t.academia.rutaBloqueado : cap.titulo}
                data-status={actual ? 'actual' : estado}
                className={`academia-node-btn relative h-[68px] w-[68px] transition ${bloqueado ? '' : 'active:scale-95'}`}
              >
                {actual && <span className="academia-bubble">{t.academia.rutaEmpezar}</span>}
                <span className="academia-face">
                  {completado ? (
                    <Check className="h-7 w-7" strokeWidth={2.5} />
                  ) : bloqueado ? (
                    <Lock className="h-6 w-6" />
                  ) : (
                    <span className="text-xl font-extrabold">{cap.numero}</span>
                  )}
                </span>
              </button>
              <span
                className={`max-w-[112px] text-center text-[11px] font-extrabold leading-tight ${
                  bloqueado ? 'text-muted-foreground/70' : 'text-foreground'
                }`}
              >
                {cap.titulo}
              </span>
            </div>
          )
        })}
      </div>

      {capSeleccionado && (
        <>
          <div
            className="animate-in fade-in fixed inset-0 z-40 bg-black/40 duration-200"
            onClick={() => setCapSeleccionado(null)}
          />
          {/* Envoltorio fixed a todo el viewport (necesario para clavarse al
              fondo de la pantalla), pero el contenido real de la hoja va
              adentro acotado a `max-w-md` y centrado — el mismo ancho que
              usa el `app-shell` de la app (ver App.tsx) — para que en
              desktop no se estire de punta a punta del navegador y pierda
              los márgenes contra el resto de la pantalla, que sí vive
              dentro de esa columna centrada. */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
            <div
              role="dialog"
              aria-modal="true"
              className="safe-bottom animate-in fade-in slide-in-from-bottom-4 card-elevated w-full max-w-md rounded-t-[22px] bg-card p-5 pb-7 duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10.5px] font-extrabold uppercase tracking-wide text-accent">
                    {t.academia.libroCapituloLabel(capSeleccionado.numero)}
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-foreground">{capSeleccionado.titulo}</p>
                  {capSeleccionado.subtitulo && (
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">{capSeleccionado.subtitulo}</p>
                  )}
                </div>
                <button
                  onClick={() => setCapSeleccionado(null)}
                  aria-label={t.academia.libroCerrarSheet}
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button onClick={confirmarApertura} className="mt-4 h-12 w-full rounded-2xl font-bold">
                {t.academia.libroAbrirCapitulo}
              </Button>
            </div>
          </div>
        </>
      )}
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
 * partir del concepto visual `ruta-concepto.html`, extendido en 2026-09-14
 * de 5 a 7 nodos para el formato video + prueba): un camino curvo conecta
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
  { x: 75, y: 686 },
  { x: 25, y: 836 },
  { x: 50, y: 986 },
]
const RUTA_ALTO_PX = 1046

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

function iconoNodo(nodo: NodoRuta, estado: EstadoNodo) {
  if (estado === 'completado') return <Check className="h-7 w-7" strokeWidth={2.5} />
  if (estado === 'bloqueado') return <Lock className="h-6 w-6" />
  if (nodo.esFinal) return <Trophy className="h-7 w-7" />
  if (nodo.tipo === 'video') return <Play className="h-6 w-6" fill="currentColor" />
  if (nodo.tipo === 'prueba') return <ListChecks className="h-6 w-6" />
  return <BookOpen className="h-6 w-6" />
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
  const { estilo } = useAppSettings()
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

      <div className="academia-path-wrap relative mx-6 mt-2 overflow-hidden" style={{ height: RUTA_ALTO_PX }}>
        {/* Fondo ilustrado del estilo Academia (atlas cientifico papel y
            tinta) — ver claude/academia-propuesta-cientifico-ilustrado-cap1.md.
            Solo se muestra con este estilo activo; el resto usa el punteado
            generico de .academia-path-wrap. */}
        {estilo === 'academia' && (
          <>
            <img
              src="/estilos/academia/cerebro.jpg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -right-[8%] top-0 w-[46%] max-w-[220px] opacity-90"
            />
            <img
              src="/estilos/academia/silla-ruedas.jpg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -left-[6%] bottom-2 w-[42%] max-w-[200px] opacity-90"
            />
          </>
        )}
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
          const esJefe = Boolean(nodo.esFinal)
          const bloqueado = prog.estado === 'bloqueado'
          const actual = prog.estado === 'disponible'
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
                <span className="academia-face">{iconoNodo(nodo, prog.estado)}</span>
              </button>
              <span
                className={`max-w-[112px] text-center text-[11px] font-extrabold leading-tight ${
                  bloqueado ? 'text-muted-foreground/70' : 'text-foreground'
                }`}
              >
                {nodo.titulo}
              </span>
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

/**
 * Nodo "prueba": muestra 1 sola pregunta elegida al azar del pool de la
 * prueba (`PRUEBAS_CAP1[...]`, 5 preguntas reales por prueba — sin cambios
 * en los datos, ver academiaInmaculada.ts). Estado 100% local al
 * componente (se resetea al cambiar de nodo vía `key={nodoId}` en
 * `PantallaNodo`, igual que ya hacía `NodoVideo`): no hay más
 * `respuestas` persistido en localStorage porque la pregunta mostrada ya
 * no es fija por nodo.
 *
 * Si la responde mal, "Reintentar" vuelve a sortear una pregunta DISTINTA
 * del mismo pool (nunca repite la que acaba de fallar, salvo que el pool
 * tenga una sola). Si acierta, queda habilitado continuar — sin sistema de
 * estrellas (pausado a pedido explícito, ver comentario arriba del
 * archivo).
 */
function NodoPrueba({
  t,
  preguntas,
  soloLectura,
  esUltima,
  etiquetaSiguiente,
  onContinuar,
}: {
  t: Diccionario
  preguntas: PreguntaAcademia[]
  soloLectura: boolean
  esUltima: boolean
  etiquetaSiguiente: string | null
  onContinuar: () => void
}) {
  const [qIndex, setQIndex] = useState(() => Math.floor(Math.random() * preguntas.length))
  const [seleccion, setSeleccion] = useState<number | null>(null)
  const [intentos, setIntentos] = useState(0)

  const pregunta = preguntas[qIndex]
  const respondido = seleccion !== null
  const acertada = respondido && seleccion === pregunta.correcta
  const puedeContinuar = soloLectura || acertada

  function elegir(oi: number) {
    if (seleccion !== null) return
    setSeleccion(oi)
    setIntentos((n) => n + 1)
  }

  function reintentar() {
    let siguiente = Math.floor(Math.random() * preguntas.length)
    if (preguntas.length > 1 && siguiente === qIndex) siguiente = (siguiente + 1) % preguntas.length
    setQIndex(siguiente)
    setSeleccion(null)
  }

  return (
    <>
      <TarjetaContenido titulo={t.academia.nodoAutoevaluacion}>
        {soloLectura ? (
          <p className="text-sm leading-relaxed text-foreground/85">{t.academia.pruebaYaCompletadaTexto}</p>
        ) : (
          <>
            <p className="text-[13px] font-bold leading-snug text-foreground">{pregunta.pregunta}</p>
            <div className="mt-2.5 space-y-1.5">
              {pregunta.opciones.map((op, oi) => {
                let estilo = 'bg-secondary text-foreground/80'
                if (respondido) {
                  if (oi === pregunta.correcta) estilo = 'bg-success/12 text-success'
                  else if (oi === seleccion) estilo = 'bg-destructive/12 text-destructive'
                  else estilo = 'bg-secondary/50 text-muted-foreground'
                }
                return (
                  <button
                    key={oi}
                    disabled={respondido}
                    onClick={() => elegir(oi)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs font-medium transition ${estilo}`}
                  >
                    {op}
                  </button>
                )
              })}
            </div>
            {respondido && <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{pregunta.feedback}</p>}
          </>
        )}
      </TarjetaContenido>

      {!soloLectura && respondido && !acertada && (
        <div className="card-elevated rounded-2xl bg-destructive/10 p-4 text-center">
          <p className="text-sm font-bold text-destructive">{t.academia.pruebaNoAprobadaTitulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.academia.pruebaNoAprobadaTexto}</p>
          <Button onClick={reintentar} className="mt-3 h-10 rounded-xl px-5 font-bold">
            {t.academia.pruebaReintentar}
          </Button>
        </div>
      )}

      {!soloLectura && acertada && !esUltima && (
        <div className="card-elevated rounded-2xl bg-success/10 p-4 text-center">
          <p className="text-sm font-bold text-success">{t.academia.pruebaAprobadaTitulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.academia.pruebaAprobadaTexto(intentos)}</p>
        </div>
      )}

      {!soloLectura && acertada && esUltima && (
        <div className="card-elevated rounded-2xl bg-success/10 p-4 text-center">
          <p className="text-sm font-bold text-success">{t.academia.capituloCompletadoTitulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.academia.capituloCompletadoTexto}</p>
        </div>
      )}

      <BotonContinuar
        disabled={!puedeContinuar}
        texto={
          soloLectura
            ? t.academia.nodoYaCompletado
            : acertada
              ? etiquetaSiguiente
                ? t.academia.continuarA(etiquetaSiguiente)
                : t.academia.capituloCompletadoBoton
              : t.academia.pruebaNecesitas
        }
        onClick={onContinuar}
      />
    </>
  )
}

/**
 * Reproductor del nodo "video". `<video controls playsInline>` nativo del
 * navegador — ya incluye su propio botón de pantalla completa en todos los
 * navegadores modernos; se suma además un botón propio (esquina superior
 * derecha) que llama a la Fullscreen API estándar o, en iOS Safari (que no
 * la soporta en <video>), a `webkitEnterFullscreen()`. El fullscreen nativo
 * ya rota a horizontal solo al girar el dispositivo — no hace falta forzar
 * la orientación a mano. El evento `ended` sigue disparando igual estando
 * en pantalla completa, así que el desbloqueo de la prueba no se ve
 * afectado por esto.
 *
 * `key={nodoId}` en el `PantallaNodo` que renderiza este componente fuerza
 * que se remonte (y por lo tanto reinicie `terminado`) al cambiar de video.
 */
function NodoVideo({
  t,
  video,
  tema,
  soloLectura,
  etiquetaSiguiente,
  onContinuar,
}: {
  t: Diccionario
  video: VideoAcademia
  tema: TemaAcademia
  soloLectura: boolean
  etiquetaSiguiente: string | null
  onContinuar: () => void
}) {
  const [terminado, setTerminado] = useState(soloLectura)
  const videoRef = useRef<HTMLVideoElement>(null)
  const puedeContinuar = soloLectura || terminado

  function entrarPantallaCompleta() {
    const el = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!el) return
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen()
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- son videos propios sin pista de subtítulos todavía */}
        <video ref={videoRef} src={video.src} controls playsInline className="aspect-video w-full" onEnded={() => setTerminado(true)} />
        <button
          type="button"
          onClick={entrarPantallaCompleta}
          aria-label={t.academia.pantallaCompleta}
          title={t.academia.pantallaCompleta}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/45 text-white backdrop-blur-sm"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <TarjetaContenido titulo={t.academia.nodoResumen}>
        <p className="text-sm leading-relaxed text-foreground/85">{tema.resumen}</p>
      </TarjetaContenido>

      <BotonContinuar
        disabled={!puedeContinuar}
        texto={
          soloLectura
            ? t.academia.nodoYaCompletado
            : puedeContinuar && etiquetaSiguiente
              ? t.academia.continuarA(etiquetaSiguiente)
              : t.academia.videoBloqueadoTexto
        }
        onClick={onContinuar}
      />
    </>
  )
}

function PantallaNodo({
  t,
  nodoId,
  progreso,
  onCompletar,
  onVolver,
}: {
  t: Diccionario
  nodoId: string
  progreso: ProgresoCap1
  onCompletar: (nodoId: string) => void
  onVolver: () => void
}) {
  const nodo: NodoRuta | undefined = NODOS_CAP1.find((n) => n.id === nodoId)
  if (!nodo) return null
  const prog = progreso[nodoId] ?? { estado: 'bloqueado' as EstadoNodo }
  const soloLectura = prog.estado === 'completado'
  const subtituloCap1 = 'Capítulo 1 · Discapacitado Físico'
  const idx = NODOS_CAP1.findIndex((n) => n.id === nodoId)
  const siguienteNodo = idx >= 0 ? NODOS_CAP1[idx + 1] : undefined

  if (nodo.tipo === 'intro') {
    return (
      <NodoLayout titulo={nodo.titulo} subtitulo={subtituloCap1} onVolver={onVolver}>
        {INTRO_CAP1.bloques.map((b) => (
          <TarjetaContenido key={b.titulo} titulo={b.titulo}>
            <p className="text-sm leading-relaxed text-foreground/85">{b.texto}</p>
          </TarjetaContenido>
        ))}
        <BotonContinuar
          onClick={() => (soloLectura ? onVolver() : onCompletar(nodoId))}
          texto={soloLectura ? t.academia.nodoYaCompletado : t.academia.nodoContinuar}
        />
      </NodoLayout>
    )
  }

  if (nodo.tipo === 'video') {
    const video = VIDEOS_CAP1.find((v) => v.id === nodo.videoId)
    const tema = nodo.temaId ? TEMAS_CAP1[nodo.temaId] : undefined
    if (!video || !tema) return null
    return (
      <NodoLayout titulo={tema.nombre} subtitulo={subtituloCap1} onVolver={onVolver}>
        <NodoVideo
          key={nodoId}
          t={t}
          video={video}
          tema={tema}
          soloLectura={soloLectura}
          etiquetaSiguiente={siguienteNodo?.titulo ?? null}
          onContinuar={() => (soloLectura ? onVolver() : onCompletar(nodoId))}
        />
      </NodoLayout>
    )
  }

  // tipo === 'prueba'
  const preguntas = nodo.pruebaId ? PRUEBAS_CAP1[nodo.pruebaId] : undefined
  if (!preguntas) return null
  const esUltima = !siguienteNodo
  const temaLabel = nodo.temaId ? TEMAS_CAP1[nodo.temaId].nombre : CAPITULOS_INMACULADA[0].titulo

  return (
    <NodoLayout titulo={nodo.titulo} subtitulo={temaLabel} onVolver={onVolver}>
      <NodoPrueba
        key={nodoId}
        t={t}
        preguntas={preguntas}
        soloLectura={soloLectura}
        esUltima={esUltima}
        etiquetaSiguiente={siguienteNodo?.titulo ?? null}
        onContinuar={() => (soloLectura ? onVolver() : onCompletar(nodoId))}
      />
    </NodoLayout>
  )
}

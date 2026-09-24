import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  ListChecks,
  Lock,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Sparkles,
  Star,
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
import { cargarProgresoAcademia, normalizarProgresoAcademia, progresoInicialAcademia, porcentajeCap1, type EstadoNodo, type ProgresoCap1 } from '@/lib/academiaProgresoLocal'
import {
  PREGUNTAS_PUNTUABLES_CAP1,
  PUNTOS_CAPITULOS,
  PUNTOS_LECCION_CAP1,
  PUNTOS_POR_CAPITULO,
  PUNTOS_PRUEBA_LIBRO,
  PUNTOS_TOTAL,
  calcularPuntuacion,
  estrellasIntentos,
  estrellasLeccion,
  fmtPuntos,
  intentosDePregunta,
  puntosPregunta,
} from '@/lib/academiaPuntuacion'
import { getProgresoAcademiaRemoto, guardarProgresoAcademiaRemoto } from '@/lib/academiaProgresoRemoto'
import type { Diccionario } from '@/lib/i18n'
import type { Pantalla } from '@/types'
import {
  CAPITULOS_INMACULADA,
  INTRO_CAP1,
  LIBRO_INMACULADA,
  NODOS_CAP1,
  PREGUNTAS_PRUEBA_FINAL_CAP1,
  PRUEBAS_CAP1,
  TEMAS_CAP1,
  VIDEOS_CAP1,
  type CapituloLibro,
  type NodoRuta,
  type PreguntaAcademia,
  type VideoAcademia,
} from '@/data/academiaInmaculada'

/**
 * Pestaña "Academia": biblioteca de estudio por libro/capítulo, separada del
 * banco de preguntas de Simulacro/Estudio. Navegación interna en 3 niveles
 * (sin rutas nuevas, mismo patrón que el filtro de capítulo de Estudio.tsx):
 * Home (lista de libros) → Libro (lista desplegable con el índice real de 16
 * capítulos — el capítulo con contenido se abre in situ mostrando sus nodos)
 * → Nodo (video o prueba).
 *
 * REDISEÑO 2026-09-18 (lista desplegable, reemplaza el mapa en zigzag —
 * concepto aprobado en el canvas "Academia — copia fiel del diseño + flujo
 * de Parálisis Cerebral"): `PantallaLibro` fusiona los antiguos Nivel 1
 * (mapa de 16 capítulos) y Nivel 2 (ruta de 5 nodos del Capítulo 1) en una
 * sola lista: cada capítulo listo (`cap.listo`) se expande/colapsa in situ
 * mostrando sus `NODOS_CAP1` como filas con check/candado, en vez de navegar
 * a una pantalla de "Ruta" aparte — `PantallaRuta` (el camino curvo con
 * SVG) se elimina, junto con `construirCurvaRuta`/`NODOS_POS_RUTA`/
 * `CAPITULOS_POS_MAPA`/`MAPA_*`, todos sin otro uso. Los capítulos sin
 * contenido (`!cap.listo`) siguen exactamente igual que antes: fila simple,
 * toca abrir la hoja de confirmación → `PantallaProximoCapitulo`. Nivel 3
 * (`PantallaNodo`/`NodoVideo`/`ModalPruebaVideo`/`NodoPrueba`) NO cambia —
 * ya hace el mecanismo real (video → pregunta de corte → video → … → prueba
 * final), solo cambia cómo se llega a él. Se dejó afuera el panel lateral
 * fijo del mockup de referencia (dos columnas): la app entera vive siempre
 * en la columna centrada de ancho fijo del `app-shell` (ver
 * claude/desktop-layout-opcion-a-implementada.md), así que esta lista ya
 * funciona igual en mobile/tablet/PC sin layout aparte — no hace falta un
 * segundo panel para eso.
 *
 * CORRECCIÓN 2026-09-18 (mismo día, sobre lo de arriba) — el capítulo 1
 * expandido ya NO lista los 5 `NODOS_CAP1` sueltos: el usuario aclaró que
 * video1/video2/video3 son las 3 partes de UN solo tema (Parálisis
 * Cerebral, ver corrección en academiaInmaculada.ts), no un video por tema.
 * Ahora la fila de "Parálisis Cerebral" es la única con contenido real
 * (toca resumir/continuar los 5 nodos de siempre puertas adentro, sin
 * cambios en `PantallaNodo`), y Epilepsia/Distrofia Muscular se muestran
 * como filas con candado + "Próximamente" — `iconoTemaChico` se elimina
 * (ya no hace falta un ícono por nodo en esta lista). También se corrige
 * `NodoVideo`: si el video termina en pantalla completa, se sale de
 * pantalla completa antes de abrir `ModalPruebaVideo` — la API de
 * Fullscreen nativa pinta el elemento fullscreen por encima de cualquier
 * otro nodo del DOM (aunque tenga z-index alto), así que sin este fix la
 * pregunta quedaba tapada detrás del video congelado en su último cuadro
 * si el usuario lo había puesto en pantalla completa (típico al girar el
 * celular a horizontal para ver mejor) — pedido explícito del usuario:
 * "si rotás el celular, la pregunta tiene que salir siempre delante".
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
 * REDISEÑO 2026-09-17 (chispa visual + flujo video/prueba en modal, ver
 * claude/academia-diseno-visual-brainstorm.md): la Ruta y el Mapa de
 * capítulos ganan color de acento propio por capítulo (derivado de los
 * tokens --accent/--primary/--amber existentes, nunca un color fijo nuevo —
 * ver .academia-accent-N en index.css), textura de fondo (ya existía en
 * .academia-path-wrap), la mascota "Muelín" (ver componente `Muelin` más
 * abajo) y una celebración puntual (confetti + "pop") sobre el nodo recién
 * completado. Además, prueba1/prueba2 dejan de ser nodos propios de la ruta:
 * ahora video1/video2 abren solos una ventana modal con 1 pregunta al
 * terminar (ver `ModalPruebaVideo`), sin volver al mapa entre video y video
 * — video3 sigue igual que antes (botón "Continuar a Prueba final", sin
 * modal, esa prueba sigue siendo un nodo aparte).
 *
 * El progreso se guarda en Supabase (tabla `academia_progreso`, por
 * user_id — ver academiaProgresoRemoto.ts), no en localStorage: así el
 * mismo usuario ve su progreso en cualquier dispositivo, y dos cuentas
 * distintas usadas en el mismo celular no se pisan entre sí. Es
 * independiente de la llave de acceso admin-only (ver más abajo,
 * `getAcademiaHabilitada`).
 *
 * Acceso: toda la pestaña queda detrás de `perfiles.academia_habilitada`
 * (boolean, default false), controlado únicamente por un admin desde
 * odonto-quiz-admin (Usuarios.tsx) — ver claude/academia-control-acceso-
 * admin-diseno.md. El botón de la barra inferior sigue siempre visible;
 * sin acceso, lo que cambia es que `PantallaHome` se reemplaza por
 * `PantallaSinAcceso`.
 */

type VistaAcademia = 'home' | 'libro' | 'nodo' | 'proximo' | 'resumen'

// ProgresoCap1/EstadoNodo y las funciones de carga/guardado de localStorage
// se movieron a src/lib/academiaProgresoLocal.ts (importadas arriba, con
// alias para no tocar el resto de este archivo) — así Estadisticas.tsx y
// Configuracion.tsx pueden leer y borrar el mismo progreso sin duplicar el
// parseo acá.

export function Academia({ userId, onNavigate }: { userId: string; onNavigate: (p: Pantalla) => void }) {
  const { t } = useAppSettings()
  const { key: navegacionKey } = useLocation()
  const [vista, setVista] = useState<VistaAcademia>('home')
  const [repitiendo, setRepitiendo] = useState(false)
  const [nodoActivoId, setNodoActivoId] = useState<string | null>(null)
  const [progreso, setProgreso] = useState<ProgresoCap1>(() => progresoInicialAcademia())
  // false hasta que termina la carga inicial desde Supabase — evita que el
  // efecto de guardado de abajo pise la base con el estado inicial (todo
  // bloqueado) antes de haber leído el progreso real de este usuario.
  const [progresoCargado, setProgresoCargado] = useState(false)
  // null mientras se consulta el perfil — evita el parpadeo de mostrar el
  // cartel de "sin acceso" un instante antes de confirmar que sí lo tiene.
  const [academiaHabilitada, setAcademiaHabilitada] = useState<boolean | null>(null)
  // Id del nodo que se acaba de completar (intro/video3/pruebaFinal, los que
  // vuelven a la lista) — resalta brevemente esa fila dentro del capítulo
  // desplegado en PantallaLibro y se limpia solo a los pocos segundos.
  // video1/video2 no pasan por acá: su celebración es el estado "¡Bien!" de
  // Muelín adentro del modal (ver ModalPruebaVideo), no vuelven a la lista.
  const [recienCompletadoId, setRecienCompletadoId] = useState<string | null>(null)

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
    getAcademiaHabilitada(userId).then((habilitada) => {
      if (!cancelado) setAcademiaHabilitada(habilitada)
    })
    return () => {
      cancelado = true
    }
  }, [userId])

  // Carga el progreso real de este usuario desde Supabase al entrar (o si
  // cambia de cuenta sin recargar la página — userId en las dependencias).
  // Si todavía no tiene fila en la base pero sí progreso viejo guardado en
  // este dispositivo de antes de este cambio (localStorage), lo migra una
  // sola vez a su cuenta en vez de perderlo.
  useEffect(() => {
    let cancelado = false
    setProgresoCargado(false)
    getProgresoAcademiaRemoto(userId).then(async (remoto) => {
      if (cancelado) return
      if (remoto) {
        setProgreso(normalizarProgresoAcademia(remoto))
      } else {
        const local = cargarProgresoAcademia()
        const tieneAvanceLocal = Object.values(local).some((n) => n.estado === 'completado')
        if (tieneAvanceLocal) {
          await guardarProgresoAcademiaRemoto(userId, local)
          if (cancelado) return
          setProgreso(local)
        }
      }
      if (!cancelado) setProgresoCargado(true)
    })
    return () => {
      cancelado = true
    }
  }, [userId])

  useEffect(() => {
    if (!progresoCargado) return
    guardarProgresoAcademiaRemoto(userId, progreso)
  }, [progreso, progresoCargado, userId])

  useEffect(() => {
    if (!recienCompletadoId) return
    const timer = setTimeout(() => setRecienCompletadoId(null), 2400)
    return () => clearTimeout(timer)
  }, [recienCompletadoId])

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

  function abrirNodo(id: string, repetir = false) {
    if (progreso[id]?.estado === 'bloqueado') return
    // Repetir la lección (2026-09-19): con todo completado, se vuelve a
    // recorrer intro → videos → pruebas con las preguntas activas (no en
    // modo solo-lectura). El progreso ya guardado no se pierde.
    setRepitiendo(repetir)
    setNodoActivoId(id)
    setVista('nodo')
  }

  function volverALibro() {
    setRepitiendo(false)
    setVista('libro')
    setNodoActivoId(null)
  }

  /**
   * Marca `id` como completado y fija su marca de puntuación (`intentos` de
   * la primera vez que se respondió). Si el nodo ya tenía marca, no se toca:
   * repetir la lección es práctica y no cambia la nota (ver
   * academiaPuntuacion.ts). Un nodo completado antes de que existiera la
   * puntuación no tiene marca, así que la primera repetición queda como la
   * oficial.
   */
  function conMarca(prev: ProgresoCap1, id: string, intentosPreguntas?: number[]): ProgresoCap1 {
    const actual = prev[id]
    const marca = actual?.intentosPreguntas ?? (intentosPreguntas && intentosPreguntas.length > 0 ? intentosPreguntas : undefined)
    return { ...prev, [id]: { ...actual, estado: 'completado', ...(marca ? { intentosPreguntas: marca } : {}) } }
  }

  /**
   * Guarda una pregunta fallada en el nodo: una entrada por `preguntaId` con
   * cuántas veces se falló (`veces`) y la fecha del último fallo. No cambia el estado
   * del nodo ni da/quita puntos: es el registro para repasar más adelante.
   */
  function registrarFallo(nodoId: string, preguntaId: string) {
    setProgreso((prev) => {
      const actual = prev[nodoId] ?? { estado: 'bloqueado' as EstadoNodo }
      const previos = actual.errores ?? []
      const anterior = previos.find((e) => e.preguntaId === preguntaId)
      const resto = previos.filter((e) => e.preguntaId !== preguntaId)
      const veces = (anterior?.veces ?? (anterior ? 1 : 0)) + 1
      return { ...prev, [nodoId]: { ...actual, errores: [...resto, { preguntaId, fecha: new Date().toISOString(), veces }] } }
    })
  }

  /**
   * Guarda por dónde va el video (pausas aprobadas / parado en una pregunta)
   * sin tocar el estado del nodo — ver NodoVideo.
   */
  function guardarEstadoVideo(nodoId: string, estado: EstadoVideoGuardado) {
    setProgreso((prev) => {
      const actual = prev[nodoId] ?? { estado: 'bloqueado' as EstadoNodo }
      return { ...prev, [nodoId]: { ...actual, pausasSuperadas: estado.pausasSuperadas, enPausa: estado.enPausa } }
    })
  }

  function completarNodo(id: string, intentosPreguntas?: number[]) {
    setProgreso((prev) => {
      const siguiente = siguienteNodoId(id)
      const next: ProgresoCap1 = conMarca(prev, id, intentosPreguntas)
      if (siguiente && next[siguiente]?.estado === 'bloqueado') {
        next[siguiente] = { ...next[siguiente], estado: 'disponible' }
      }
      return next
    })
    setRecienCompletadoId(id)
    // Al cerrar el tema (prueba final) se muestra el resumen con las estrellas;
    // el resto de los nodos vuelve al libro como siempre.
    if (!siguienteNodoId(id)) {
      setRepitiendo(false)
      setNodoActivoId(null)
      setVista('resumen')
      return
    }
    volverALibro()
  }

  /**
   * Variante de `completarNodo` para video1/video2 (rediseño 2026-09-17):
   * marca `id` completado y desbloquea `siguienteId` igual que siempre, pero
   * en vez de volver al mapa se queda en la vista "nodo" y salta directo al
   * siguiente video — es lo que permite el flujo continuo video1→pregunta→
   * video2→pregunta→video3 sin pasar por el mapa entre medio. El
   * `key={nodoId}` de NodoVideo hace el resto: al cambiar `nodoActivoId`
   * remonta el componente con el video nuevo, lo que también reinicia su
   * animación de entrada (ver NodoVideo más abajo).
   */
  function avanzarSinVolver(id: string, siguienteId: string) {
    setProgreso((prev) => {
      const next: ProgresoCap1 = conMarca(prev, id)
      if (next[siguienteId]?.estado === 'bloqueado') {
        next[siguienteId] = { ...next[siguienteId], estado: 'disponible' }
      }
      return next
    })
    setNodoActivoId(siguienteId)
  }

  return (
    <div className="app-shell bg-background pb-28">
      {(academiaHabilitada === null || (academiaHabilitada === true && !progresoCargado)) && (
        <div className="flex justify-center pt-32">
          <Spinner className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {academiaHabilitada === false && <PantallaSinAcceso t={t} />}

      {academiaHabilitada === true && progresoCargado && (
        <>
          {vista === 'home' && <PantallaHome t={t} onAbrirLibro={() => setVista('libro')} />}

          {vista === 'libro' && (
            <PantallaLibro
              t={t}
              cap1Completo={cap1Completo}
              progreso={progreso}
              recienCompletadoId={recienCompletadoId}
              onVolver={() => setVista('home')}
              onAbrirNodo={abrirNodo}
              onAbrirProximo={() => setVista('proximo')}
            />
          )}

          {vista === 'proximo' && (
            <PantallaProximoCapitulo t={t} onVolver={() => setVista('libro')} onIrACap1={() => setVista('libro')} />
          )}

          {vista === 'resumen' && <PantallaResumenTema t={t} progreso={progreso} onVolver={volverALibro} />}

          {vista === 'nodo' && nodoActivoId && (
            <PantallaNodo
              t={t}
              nodoId={nodoActivoId}
              progreso={progreso}
              repitiendo={repitiendo}
              onCompletar={completarNodo}
              onAvanzarSinVolver={avanzarSinVolver}
              onFallo={registrarFallo}
              onGuardarVideo={guardarEstadoVideo}
              onVolver={volverALibro}
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

function PantallaLibro({
  t,
  cap1Completo,
  progreso,
  recienCompletadoId,
  onVolver,
  onAbrirNodo,
  onAbrirProximo,
}: {
  t: Diccionario
  cap1Completo: boolean
  progreso: ProgresoCap1
  recienCompletadoId: string | null
  onVolver: () => void
  onAbrirNodo: (id: string, repetir?: boolean) => void
  onAbrirProximo: () => void
}) {
  const [capSeleccionado, setCapSeleccionado] = useState<CapituloLibro | null>(null)
  // El Capítulo 1 arranca desplegado (es el único con contenido real hoy),
  // igual que en el diseño de referencia. Un solo capítulo desplegado a la
  // vez — tocar el chevron de otro listo cerraría este, aunque hoy solo hay
  // uno (`cap.listo`).
  const [expandidoNumero, setExpandidoNumero] = useState<number | null>(1)
  const completados = CAPITULOS_INMACULADA.filter((cap) => estadoCapitulo(cap, cap1Completo) === 'completado').length
  const completadosCap1 = NODOS_CAP1.filter((n) => progreso[n.id]?.estado === 'completado').length
  const punt = calcularPuntuacion(progreso)
  const siguienteNodoCap1 = NODOS_CAP1.find((n) => progreso[n.id]?.estado === 'disponible')
  // A dónde navega la fila "Parálisis Cerebral": retoma en el próximo nodo
  // sin completar, o vuelve a 'intro' si ya se completaron los 5 (repaso).
  const nodoDestinoCap1 = siguienteNodoCap1 ?? NODOS_CAP1[0]
  // Resalta la fila "Parálisis Cerebral" (no un nodo suelto — ya no se
  // listan por separado) apenas se vuelve a la lista tras completar
  // cualquiera de sus 5 nodos internos.
  const pcRecienCompletado = recienCompletadoId !== null && NODOS_CAP1.some((n) => n.id === recienCompletadoId)

  function confirmarApertura() {
    setCapSeleccionado(null)
    onAbrirProximo()
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

      <div className="mx-6 mt-4 rounded-2xl bg-foreground p-4 text-background">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold opacity-70">{t.academia.puntTuNota}</p>
            <p className="text-3xl font-extrabold leading-tight">
              {fmtPuntos(punt.notaTotal)} <span className="text-base font-bold opacity-70">/ {PUNTOS_TOTAL}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1.5 text-sm font-extrabold">
              <Star className="h-4 w-4" style={{ color: COLOR_ESTRELLA }} fill="currentColor" aria-hidden="true" />
              {punt.estrellas} / {punt.estrellasMax}
            </p>
            <p className="text-[11px] font-bold opacity-70">{t.academia.puntEstrellasGanadas}</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/20">
          <div className="h-full rounded-full" style={{ width: `${Math.max(punt.notaTotal, 0)}%`, minWidth: punt.notaTotal > 0 ? 6 : 0, background: COLOR_ESTRELLA }} />
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-bold opacity-70">
          <span>
            {t.academia.puntCapitulos}: {fmtPuntos(punt.notaTotal)} / {PUNTOS_CAPITULOS}
          </span>
          <span>
            {t.academia.puntPruebaLibro}: 0 / {PUNTOS_PRUEBA_LIBRO}
          </span>
        </div>
      </div>

      {/* Lista desplegable (rediseño 2026-09-18, reemplaza el mapa en
          zigzag): una línea vertical fina conecta los círculos numerados,
          igual función que el camino curvo de antes pero sin SVG — cada
          capítulo es una fila; el que tiene contenido (`cap.listo`) se
          expande in situ mostrando sus nodos reales en vez de navegar a otra
          pantalla. */}
      {/* Diseño "Opción B" (2026-09-19): todas las tarjetas de capítulo al
          mismo ancho que la tarjeta de nota (mx-6), con el círculo adentro;
          sin la línea vertical del camino ni círculos que sobresalgan. */}
      <div className="relative mx-6 mt-4">
        <div className="relative flex flex-col gap-2.5">
          {CAPITULOS_INMACULADA.map((cap) => {
            const estado = estadoCapitulo(cap, cap1Completo)
            const bloqueado = estado === 'bloqueado'
            const completado = estado === 'completado'
            // Corrección 2026-09-19 (copia exacta del mockup de referencia):
            // binario fijo, no la rotación de 4 acentos de index.css (esa es
            // para el mapa en zigzag viejo) — teal para el único capítulo con
            // contenido real, violeta para el resto, sin importar si está
            // bloqueado o "disponible" sin contenido (cap.2 tras completar
            // el 1). Colores puntuales del mockup, no del skin activo — ver
            // .academia-color-activo/.academia-color-bloqueado en index.css.
            const acento = cap.listo ? 'academia-color-activo' : 'academia-color-bloqueado'
            const expandido = expandidoNumero === cap.numero
            const pctCap1 = porcentajeCap1(progreso)

            const circulo = (
              <span
                className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold"
                style={{ background: 'var(--academia-accent, hsl(var(--accent)))', color: 'var(--academia-accent-ink, hsl(var(--accent-foreground)))' }}
              >
                {bloqueado ? (
                  <Lock className="h-[18px] w-[18px]" />
                ) : completado ? (
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  cap.numero
                )}
              </span>
            )

            if (cap.listo) {
              return (
                // Corrección 2026-09-19 (copia exacta del mockup de
                // referencia, comparado lado a lado con la app real): dos
                // ajustes — 1) el círculo numerado va POR ENCIMA de la
                // tarjeta, superpuesto a su borde izquierdo (como en el
                // timeline), no metido adentro del padding — por eso sale de
                // este `relative` envoltorio con position absolute, y la
                // tarjeta gana `pl-14` para dejarle el hueco; antes el
                // círculo quedaba empujado por el padding de la tarjeta y no
                // alineaba con la línea vertical del timeline. 2) la tarjeta
                // pasa de "borde brillante + fondo plano" a "fondo con un
                // toque de color + borde casi invisible" (el mockup no tiene
                // un contorno marcado, es el fondo el que se ve teñido).
                <div key={cap.numero} className="relative">
                  <div
                    className={`${acento} rounded-[22px] border p-3.5`}
                    style={{
                      borderColor: 'color-mix(in srgb, var(--academia-accent, hsl(var(--accent))) 14%, transparent)',
                      background: 'color-mix(in srgb, hsl(var(--card)) 85%, var(--academia-accent, hsl(var(--accent))) 15%)',
                    }}
                  >
                    <button
                      onClick={() => setExpandidoNumero(expandido ? null : cap.numero)}
                      aria-expanded={expandido}
                      className="flex w-full items-center gap-3.5 text-left"
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold"
                        style={{ background: 'var(--academia-accent, hsl(var(--accent)))', color: 'var(--academia-accent-ink, hsl(var(--accent-foreground)))' }}
                      >
                        {completado ? <Check className="h-5 w-5" strokeWidth={2.5} /> : cap.numero}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-extrabold text-foreground">{cap.titulo}</span>
                        {cap.subtitulo && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{cap.subtitulo}</span>}
                      </span>
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                        style={{ background: `conic-gradient(var(--academia-accent, hsl(var(--accent))) ${pctCap1 * 3.6}deg, hsl(var(--secondary)) 0deg)` }}
                      >
                        <span
                          className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-card text-[11px] font-extrabold"
                          style={{ color: 'var(--academia-accent, hsl(var(--accent)))' }}
                        >
                          {Math.round(pctCap1)}%
                        </span>
                      </span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expandido ? '' : '-rotate-90'}`} />
                    </button>

                    {expandido && (
                    <div className="mt-2.5 flex flex-col gap-0.5 border-t border-border/60 pt-2.5">
                      {/* "Parálisis Cerebral" es el único tema con contenido
                          real del capítulo: sus 5 nodos (intro, 3 videos,
                          prueba final) no se listan sueltos acá — tocar la
                          fila retoma o repasa esa ruta completa puertas
                          adentro (PantallaNodo, sin cambios). */}
                      <button
                        onClick={() => (cap1Completo ? onAbrirNodo(NODOS_CAP1[0].id, true) : onAbrirNodo(nodoDestinoCap1.id))}
                        className={`flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors duration-700 ${
                          pcRecienCompletado ? 'bg-success/10' : ''
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            cap1Completo ? 'bg-success text-success-foreground' : 'border-2 text-foreground'
                          }`}
                          style={
                            !cap1Completo
                              ? { borderColor: 'var(--academia-accent, hsl(var(--accent)))', color: 'var(--academia-accent, hsl(var(--accent)))' }
                              : undefined
                          }
                        >
                          {cap1Completo ? (
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                          ) : (
                            <Play className="h-[13px] w-[13px]" fill="currentColor" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-semibold text-foreground">{TEMAS_CAP1.pc.nombre}</span>
                          <span className="block text-[11px] font-medium text-muted-foreground">
                            {cap1Completo ? t.academia.nodoRepetir : `${completadosCap1}/${NODOS_CAP1.length}`}
                          </span>
                        </span>
                        {punt.preguntasRespondidas > 0 && (
                          <span className="shrink-0 text-right">
                            <Estrellas t={t} n={estrellasLeccion(punt)} size={14} />
                            <span className="block text-[11px] font-extrabold text-muted-foreground">
                              {fmtPuntos(punt.notaCap1)} / {fmtPuntos(PUNTOS_LECCION_CAP1)}
                            </span>
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      </button>

                      {/* Epilepsia y Distrofia Muscular: sin video propio
                          todavía (ver corrección 2026-09-18 en
                          academiaInmaculada.ts) — filas informativas, no
                          clicables. */}
                      {(['epi', 'dm'] as const).map((temaId) => (
                        <div key={temaId} className="flex items-center gap-3 rounded-xl px-2 py-2.5 opacity-60">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground/70">
                            <Lock className="h-[13px] w-[13px]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13.5px] font-semibold text-muted-foreground/70">{TEMAS_CAP1[temaId].nombre}</span>
                            <span className="block text-[11px] font-medium text-muted-foreground/60">{t.academia.libroProximamente}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <button
                key={cap.numero}
                onClick={() => setCapSeleccionado(cap)}
                disabled={bloqueado}
                aria-label={cap.titulo}
                title={bloqueado ? t.academia.rutaBloqueado : cap.titulo}
                className={`${acento} flex items-center gap-3.5 rounded-[18px] border border-border/60 bg-card px-3.5 py-3 text-left`}
              >
                {circulo}
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[14.5px] font-bold ${bloqueado ? 'text-muted-foreground/70' : 'text-foreground'}`}>{cap.titulo}</span>
                  {cap.subtitulo && <span className="mt-0.5 block truncate text-xs text-muted-foreground/80">{cap.subtitulo}</span>}
                </span>
                <span className="shrink-0 text-xs font-bold text-muted-foreground/70">0 / {PUNTOS_POR_CAPITULO}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/70" />
              </button>
            )
          })}
        </div>
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

// Assets reales de "Muelín" (recorte de referencia del usuario, 2026-09-17
// — reemplaza al SVG dibujado a mano que había antes). Vive en public/ como
// los videos/imágenes de academiaInmaculada.ts, así que se referencia por
// ruta absoluta, no por import.
/**
 * Voz de la Academia (audios 2026-09-24, en public/academia/audio/, MP3
 * recortados y con el volumen igualado). Un solo reproductor compartido:
 * cada frase nueva corta la anterior para que nunca se pisen. Si el
 * navegador bloquea el audio, se ignora en silencio (la app sigue igual).
 *
 * Mapa: prueba-intermedia → se abre la pregunta de una pausa (solo la
 * primera vez de cada pausa) · acierto-seguir → acierta la pausa (el video
 * retoma cuando termina la frase) · fallo-reintentar → falla la pausa ·
 * prueba-final → tarjeta de entrada de la prueba final · leccion-concluida →
 * acierta la última pregunta de la prueba final · repaso-errores → reservado
 * para la pantalla de repaso de errores (todavía no existe).
 */
const VOZ_ACADEMIA = {
  pruebaIntermedia: '/academia/audio/prueba-intermedia.mp3',
  aciertoSeguir: '/academia/audio/acierto-seguir.mp3',
  falloReintentar: '/academia/audio/fallo-reintentar.mp3',
  pruebaFinal: '/academia/audio/prueba-final.mp3',
  leccionConcluida: '/academia/audio/leccion-concluida.mp3',
  repasoErrores: '/academia/audio/repaso-errores.mp3',
} as const

let vozActual: HTMLAudioElement | null = null

function reproducirVoz(clave: keyof typeof VOZ_ACADEMIA) {
  if (typeof Audio === 'undefined') return
  detenerVoz()
  const audio = new Audio(VOZ_ACADEMIA[clave])
  vozActual = audio
  audio.play().catch(() => {})
}

function detenerVoz() {
  if (!vozActual) return
  vozActual.pause()
  vozActual = null
}

/** Resuelve cuando termina la frase que está sonando (o enseguida si no hay ninguna). Tope de seguridad: `maxMs`. */
function esperarFinVoz(maxMs = 6000): Promise<void> {
  const audio = vozActual
  if (!audio || audio.ended || audio.error) return Promise.resolve()
  return new Promise((resolve) => {
    const fin = () => {
      clearTimeout(tope)
      audio.removeEventListener('ended', fin)
      audio.removeEventListener('error', fin)
      audio.removeEventListener('pause', fin)
      resolve()
    }
    const tope = setTimeout(fin, maxMs)
    audio.addEventListener('ended', fin)
    audio.addEventListener('error', fin)
    audio.addEventListener('pause', fin)
  })
}

const MUELIN_SRC: Record<'neutral' | 'feliz' | 'de-nuevo', string> = {
  neutral: '/academia/muelin/neutral.png',
  feliz: '/academia/muelin/feliz.png',
  'de-nuevo': '/academia/muelin/de-nuevo.png',
}

/**
 * Mascota "Muelín": ahora una imagen real (recorte de referencia que pasó
 * el usuario, 2026-09-17) en vez del SVG placeholder de la primera versión.
 * Al ser una imagen con colores propios, a diferencia del SVG anterior ya
 * NO se acomoda sola a cada estilo/skin ni al modo oscuro — mismo PNG
 * siempre. `className` sigue fijando el tamaño de la caja (ej. "h-12
 * w-12"); la imagen entra en contain para no deformarse.
 */
function Muelin({ expresion, className }: { expresion: 'neutral' | 'feliz' | 'de-nuevo'; className?: string }) {
  return <img src={MUELIN_SRC[expresion]} alt="" aria-hidden="true" className={`${className ?? ''} object-contain`} />
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

const COLOR_ESTRELLA = '#f4b400'

/** Fila de 3 estrellas (llenas hasta `n`). `apagadas` = gris, para el modo práctica. */
function Estrellas({ t, n, size = 16, apagadas = false }: { t: Diccionario; n: number; size?: number; apagadas?: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={t.academia.puntEstrellasAria(n)}>
      {[0, 1, 2].map((i) => {
        const llena = i < n
        return (
          <Star
            key={i}
            width={size}
            height={size}
            aria-hidden="true"
            strokeWidth={1.5}
            className={llena && apagadas ? 'text-muted-foreground/50' : !llena ? 'text-muted-foreground/30' : undefined}
            style={llena && !apagadas ? { color: COLOR_ESTRELLA } : undefined}
            fill={llena ? 'currentColor' : 'none'}
          />
        )
      })}
    </span>
  )
}

/**
 * Resultado de puntuación de una pregunta acertada. Si el nodo todavía no
 * tenía marca (`marcaPrevia === undefined`) esta vez cuenta: muestra las
 * estrellas y los puntos ganados. Si ya la tenía es modo práctica: estrellas
 * apagadas con la marca oficial y "sin puntos esta vez".
 */
function ResultadoPuntos({ t, intentos, marcaPrevia }: { t: Diccionario; intentos: number; marcaPrevia?: number }) {
  if (marcaPrevia !== undefined) {
    return (
      <div className="mt-2 flex flex-col items-center gap-1.5">
        <span className="rounded-full bg-secondary px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          {t.academia.puntPracticaTitulo}
        </span>
        <Estrellas t={t} n={3} size={30} apagadas />
        <p className="text-sm font-extrabold text-muted-foreground">{t.academia.puntSinPuntos}</p>
        <p className="text-[11px] leading-snug text-muted-foreground">{t.academia.puntPracticaTexto}</p>
        <p className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
          {t.academia.puntMarcaOficial} <Estrellas t={t} n={estrellasIntentos(marcaPrevia)} size={13} />
        </p>
      </div>
    )
  }
  return (
    <div className="mt-2 flex flex-col items-center gap-1.5">
      <Estrellas t={t} n={estrellasIntentos(intentos)} size={34} />
      <p className="rounded-full bg-amber-100 px-3 py-0.5 text-base font-extrabold text-amber-800">
        {t.academia.puntSumaPts(fmtPuntos(puntosPregunta(intentos)))}
      </p>
      <p className="text-[11px] leading-snug text-muted-foreground">
        {intentos <= 1 ? t.academia.puntPrimerIntento : t.academia.puntTrasFallar}
      </p>
    </div>
  )
}

/**
 * Resumen que se abre al terminar la prueba final: estrellas por pregunta,
 * puntos del tema, nota total y la insignia "Sin fallos".
 */
function PantallaResumenTema({ t, progreso, onVolver }: { t: Diccionario; progreso: ProgresoCap1; onVolver: () => void }) {
  const punt = calcularPuntuacion(progreso)
  return (
    <NodoLayout titulo={t.academia.puntResumenTitulo} subtitulo="Capítulo 1 · Discapacitado Físico" onVolver={onVolver}>
      <div className="rounded-3xl bg-primary p-5 text-center text-primary-foreground">
        <p className="text-[13px] font-bold opacity-80">{t.academia.puntTemaCompletada(TEMAS_CAP1.pc.nombre)}</p>
        <div className="mt-2 flex justify-center">
          <Estrellas t={t} n={estrellasLeccion(punt)} size={40} />
        </div>
        <p className="mt-2 text-4xl font-extrabold leading-none">
          {fmtPuntos(punt.notaCap1)} <span className="text-base font-bold opacity-80">/ {fmtPuntos(PUNTOS_LECCION_CAP1)} pts</span>
        </p>
        <p className="mt-2 text-xs font-bold opacity-80">
          {t.academia.puntTuNota}: {fmtPuntos(punt.notaTotal)} / {PUNTOS_TOTAL}
        </p>
      </div>

      <div className="space-y-2">
        {PREGUNTAS_PUNTUABLES_CAP1.map((n, i) => {
          const intentos = intentosDePregunta(progreso, n)
          return (
            <div key={`${n.nodoId}:${n.indice}`} className="card-elevated flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{n.titulo}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {t.academia.puntPreguntaN(i + 1)}
                  {intentos ? ` · ${t.academia.puntIntentoTexto(intentos)}` : ''}
                </p>
              </div>
              <Estrellas t={t} n={intentos ? estrellasIntentos(intentos) : 0} size={18} />
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          {punt.sinFallos ? <Star className="h-4 w-4" style={{ color: COLOR_ESTRELLA }} fill="currentColor" /> : <Lock className="h-4 w-4" />}
        </span>
        <div>
          <p className="text-[13px] font-bold text-foreground">
            {punt.sinFallos ? t.academia.puntInsigniaSinFallosGanada : t.academia.puntInsigniaSinFallos}
          </p>
          <p className="text-xs font-medium text-muted-foreground">{t.academia.puntInsigniaSinFallosDesc}</p>
        </div>
      </div>

      <p className="px-1 text-center text-xs font-medium text-muted-foreground">{t.academia.puntPracticaAviso}</p>
      <BotonContinuar onClick={onVolver} texto={t.academia.puntVolverLibro} />
    </NodoLayout>
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
 *
 * Corrección 2026-09-18 — la prueba final (`esFinal`) muestra primero una
 * tarjeta de intro ("¡Muy bien! Ahora una prueba") con un botón "Comenzar
 * prueba" antes de la pregunta en sí: se llega acá directo desde video3 sin
 * volver a la lista (ver `onContinuar` de los nodos de video en
 * `PantallaNodo`), así que hace falta ese aviso — antes se entraba
 * directo a la pregunta sin transición.
 */
function NodoPrueba({
  t,
  preguntas,
  soloLectura,
  esUltima,
  esFinal,
  etiquetaSiguiente,
  marcaPrevia,
  onFallo,
  onContinuar,
  titulo,
  onSalir,
}: {
  t: Diccionario
  /** Nombre del nodo ("Prueba final", "Cuestionario de anestesia"), para el aviso de arriba. */
  titulo: string
  /** Cerrar con la X: vuelve a la ruta sin completar. */
  onSalir: () => void
  preguntas: PreguntaAcademia[]
  soloLectura: boolean
  esUltima: boolean
  esFinal: boolean
  etiquetaSiguiente: string | null
  /** Marca oficial que ya tiene este nodo: intentos por pregunta (undefined = todavía no tiene: esta vez cuenta). */
  marcaPrevia?: number[]
  /** Se llama cada vez que se falla la pregunta `indice` — la pantalla padre guarda el error. */
  onFallo: (indice: number) => void
  /** Al terminar: intentos que hicieron falta en cada pregunta, en orden. */
  onContinuar: (intentosPreguntas: number[]) => void
}) {
  // Arranca "comenzada" si es solo-lectura (repaso) o si no es la prueba
  // final (hoy no hay otro caso de nodo "prueba" standalone, pero por las
  // dudas no le mostramos intro a algo que no sea el cierre del capítulo).
  const [comenzada, setComenzada] = useState(soloLectura || !esFinal)
  // Cambio 2026-09-19: las preguntas son FIJAS y van en orden (ya no se
  // sortea una al azar). Una pregunta fallada se queda hasta acertarla; los
  // intentos de cada una se cuentan por separado y son los que puntúan.
  const [qIndex, setQIndex] = useState(0)
  const [seleccion, setSeleccion] = useState<number | null>(null)
  const [intentosPorPregunta, setIntentosPorPregunta] = useState<number[]>(() => preguntas.map(() => 0))
  const [saliendo, setSaliendo] = useState(false)

  // Voz: "Vamos a realizar una última prueba" al mostrar la entrada de la prueba final.
  useEffect(() => {
    if (!comenzada) reproducirVoz('pruebaFinal')
    // Cuestionario de un tema (no final, 2026-09-24): misma voz que las pausas.
    else if (!esFinal && !soloLectura) reproducirVoz('pruebaIntermedia')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar la tarjeta de entrada
  }, [])

  if (!comenzada) {
    return (
      <div className="card-elevated flex flex-col items-center gap-3 rounded-2xl bg-card p-6 text-center">
        <Muelin expresion="feliz" className="h-16 w-16" />
        <p className="text-base font-extrabold text-foreground">{t.academia.pruebaFinalIntroTitulo}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{t.academia.pruebaFinalIntroTexto}</p>
        <Button onClick={() => setComenzada(true)} className="mt-1 h-12 w-full rounded-2xl font-bold">
          {t.academia.pruebaComenzar}
        </Button>
      </div>
    )
  }

  // Ya completada (sin repetir): solo el aviso y volver.
  if (soloLectura) {
    return (
      <>
        <TarjetaContenido titulo={titulo}>
          <p className="text-sm leading-relaxed text-foreground/85">{t.academia.pruebaYaCompletadaTexto}</p>
        </TarjetaContenido>
        <BotonContinuar texto={t.academia.nodoYaCompletado} onClick={() => onContinuar(intentosPorPregunta)} />
      </>
    )
  }

  const pregunta = preguntas[qIndex]
  const hayMasPreguntas = qIndex < preguntas.length - 1
  const intentosActual = intentosPorPregunta[qIndex]
  const fallada = seleccion !== null && seleccion !== pregunta.correcta

  function elegir(oi: number) {
    if (seleccion !== null) return
    setSeleccion(oi)
    setIntentosPorPregunta((arr) => arr.map((n, i) => (i === qIndex ? n + 1 : n)))
    if (oi !== pregunta.correcta) {
      onFallo(qIndex)
      if (!esFinal) reproducirVoz('falloReintentar')
    }
    // Voz: al acertar la última pregunta de la prueba final, cierre de la
    // lección; en un cuestionario de tema, "vamos a seguir con la lección".
    else if (qIndex === preguntas.length - 1) reproducirVoz(esFinal ? 'leccionConcluida' : 'aciertoSeguir')
  }

  // La pregunta fallada se queda: mismo enunciado, nueva oportunidad.
  function reintentar() {
    detenerVoz()
    setSeleccion(null)
  }

  function siguientePregunta() {
    detenerVoz()
    setQIndex((i) => i + 1)
    setSeleccion(null)
  }

  // Última pregunta acertada: espera a que termine la frase y sale con
  // transición antes de seguir (el padre guarda la marca / avanza).
  function terminar() {
    if (saliendo) return
    esperarFinVoz().then(() => {
      setSaliendo(true)
      setTimeout(() => onContinuar(intentosPorPregunta), 260)
    })
  }

  const tituloAcierto = !hayMasPreguntas && esFinal && esUltima ? t.academia.capituloCompletadoTitulo : t.academia.pruebaAprobadaTitulo
  const textoSeguir = hayMasPreguntas
    ? t.academia.nodoContinuar
    : etiquetaSiguiente
      ? t.academia.continuarA(etiquetaSiguiente)
      : t.academia.capituloCompletadoBoton

  return (
    <CapasPregunta
      key={qIndex}
      t={t}
      pregunta={pregunta}
      seleccion={seleccion}
      onElegir={elegir}
      etiqueta={titulo}
      etiquetaCorta={t.academia.videoPreguntaDe(qIndex + 1, preguntas.length)}
      iconoEtiqueta={<ListChecks className="h-3.5 w-3.5 shrink-0" />}
      saliendo={saliendo}
      onCerrar={() => {
        detenerVoz()
        onSalir()
      }}
      panelAcierto={
        <div className="mt-1 flex flex-col gap-2 rounded-2xl bg-success/12 p-3">
          <p className="text-center text-base font-black text-success">{tituloAcierto}</p>
          {!hayMasPreguntas && esFinal && esUltima && (
            <p className="text-center text-xs leading-relaxed text-muted-foreground">{t.academia.capituloCompletadoTexto}</p>
          )}
          {/* Solo la prueba final puntúa: estrellas y puntos de esta pregunta. */}
          {esFinal && <ResultadoPuntos t={t} intentos={intentosActual} marcaPrevia={marcaPrevia?.[qIndex]} />}
          <Button onClick={hayMasPreguntas ? siguientePregunta : terminar} disabled={saliendo} className="h-11 w-full rounded-xl font-extrabold">
            {textoSeguir}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      }
      avisoFallo={
        esFinal && fallada && marcaPrevia === undefined ? (
          <p className="text-xs font-semibold leading-snug text-destructive">{t.academia.puntAvisoFallo}</p>
        ) : undefined
      }
      accionesFallo={
        <Button onClick={reintentar} className="h-12 w-full rounded-2xl font-extrabold">
          {t.academia.pruebaReintentar}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      }
    />
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
 * afectado por esto — pero la VISIBILIDAD del modal de la pregunta sí: por
 * eso `alTerminarVideo` sale de pantalla completa antes de abrirlo (ver
 * corrección 2026-09-18 ahí mismo), para que nunca quede tapado detrás del
 * video.
 *
 * `key={nodoId}` en el `PantallaNodo` que renderiza este componente fuerza
 * que se remonte (y por lo tanto reinicie `terminado`) al cambiar de video.
 */
// Aviso "girá tu celular" (diseño aprobado 2026-09-17, variante "ventana"):
// se guarda por video, no por sesión, para que sea de verdad "la primera
// vez que se abre ese video" y no reaparezca cada vez que se reabre la
// app. Mismo patrón try/catch que el resto de localStorage en Academia.
const CLAVE_GIRAR_CELULAR_VISTOS = 'academia_girar_celular_visto_v1'

function yaVioAvisoGirarCelular(videoId: string): boolean {
  try {
    const guardado = localStorage.getItem(CLAVE_GIRAR_CELULAR_VISTOS)
    const vistos: unknown = guardado ? JSON.parse(guardado) : []
    return Array.isArray(vistos) && vistos.includes(videoId)
  } catch {
    // Sin localStorage (modo privado, etc.): no insistimos con el aviso.
    return true
  }
}

function marcarAvisoGirarCelularVisto(videoId: string) {
  try {
    const guardado = localStorage.getItem(CLAVE_GIRAR_CELULAR_VISTOS)
    const vistos: unknown = guardado ? JSON.parse(guardado) : []
    const lista = Array.isArray(vistos) ? (vistos as string[]) : []
    if (!lista.includes(videoId)) localStorage.setItem(CLAVE_GIRAR_CELULAR_VISTOS, JSON.stringify([...lista, videoId]))
  } catch {
    // ignorar — el aviso simplemente puede volver a aparecer esta sesión.
  }
}

/** Estado del video que se guarda en el progreso (solo nodo `video`, fuera de "repetir"). */
interface EstadoVideoGuardado {
  pausasSuperadas: number
  enPausa: boolean
}

/**
 * Rediseño 2026-09-23 — UN SOLO VIDEO que se va parando. En cada punto de
 * `video.pausas` el video se pausa, sale de pantalla completa (para que la
 * pregunta nunca quede tapada, ver corrección 2026-09-18) y abre
 * `ModalPruebaVideo` con 1 pregunta de esa prueba intermedia. Al acertar,
 * sigue reproduciendo desde ahí. No se puede adelantar más allá de la
 * próxima pausa pendiente (el `seeking` se recorta a esa pausa). Al terminar
 * el video, botón "Continuar a Prueba final" como antes.
 *
 * Progreso: las pausas aprobadas (`pausasSuperadas`) y si quedó parado en
 * una pregunta sin responder (`enPausa`) se guardan en el nodo, así al
 * volver retoma en la última pausa aprobada — o directamente en la pregunta
 * pendiente — sin tener que ver el tramo otra vez. En modo "repetir" no se
 * guarda nada: arranca de 0 con las pausas activas. En modo solo-lectura
 * (nodo ya completado) no hay pausas: el video se ve libre.
 */
function NodoVideo({
  t,
  video,
  soloLectura,
  etiquetaSiguiente,
  estadoInicial,
  onGuardarEstado,
  onContinuar,
  onFalloModal,
  onSalirModal,
}: {
  t: Diccionario
  video: VideoAcademia
  soloLectura: boolean
  etiquetaSiguiente: string | null
  /** Dónde retomar (pausas ya aprobadas / parado en una pregunta). */
  estadoInicial: EstadoVideoGuardado
  /** Guarda el avance del video en el progreso. undefined = no guardar (modo repetir). */
  onGuardarEstado?: (estado: EstadoVideoGuardado) => void
  onContinuar: () => void
  /** Se llama cada vez que se falla la pregunta de una pausa — la pantalla padre guarda el error. */
  onFalloModal: (preguntaId: string) => void
  /** Se llama al cerrar el modal con la "X" sin haber acertado — vuelve al mapa. */
  onSalirModal: () => void
}) {
  const pausas = soloLectura ? [] : video.pausas
  const [superadas, setSuperadas] = useState(() => Math.min(estadoInicial.pausasSuperadas, pausas.length))
  const [modalAbierto, setModalAbierto] = useState(false)
  // Sube cada vez que se abre el modal: remonta ModalPruebaVideo para que
  // salga una pregunta nueva y se reinicie su animación de salida.
  const [aperturas, setAperturas] = useState(0)
  // La voz "vamos a realizar una pequeña prueba" suena solo la primera vez
  // que se abre cada pausa (no al volver de "Repetir trozo").
  const [anunciar, setAnunciar] = useState(false)
  const pausasAnunciadasRef = useRef(new Set<number>())
  const [terminado, setTerminado] = useState(soloLectura)
  const [seg, setSeg] = useState(0)
  const [avisoGirarVisible, setAvisoGirarVisible] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Refs espejo para los handlers del <video> (evitan leer estado viejo).
  const superadasRef = useRef(superadas)
  const modalAbiertoRef = useRef(false)
  const posicionadoRef = useRef(false)

  const pendiente = pausas[superadas]
  const seccion = [...video.secciones].reverse().find((s) => seg >= s.desde) ?? video.secciones[0]
  const tema = TEMAS_CAP1[seccion.temaId]

  useEffect(() => {
    if (soloLectura) return
    if (typeof window === 'undefined' || !window.matchMedia) return
    const esMobile = window.matchMedia('(pointer: coarse)').matches
    if (esMobile && !yaVioAvisoGirarCelular(video.id)) setAvisoGirarVisible(true)
  }, [video.id, soloLectura])

  function cerrarAvisoGirar() {
    setAvisoGirarVisible(false)
    marcarAvisoGirarCelularVisto(video.id)
  }

  useEffect(() => {
    if (!avisoGirarVisible || typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(orientation: landscape)')
    const alCambiarOrientacion = () => {
      if (mq.matches) cerrarAvisoGirar()
    }
    mq.addEventListener('change', alCambiarOrientacion)
    return () => mq.removeEventListener('change', alCambiarOrientacion)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cerrarAvisoGirar depende de video.id, no de sí misma
  }, [avisoGirarVisible, video.id])

  // Sale de pantalla completa: Fullscreen API estándar, Safari viejo y el
  // reproductor nativo de iOS (webkitExitFullscreen sobre el <video>).
  function salirPantallaCompleta() {
    const doc = document as Document & { webkitExitFullscreen?: () => void; webkitFullscreenElement?: Element | null }
    const el = videoRef.current as (HTMLVideoElement & { webkitExitFullscreen?: () => void; webkitDisplayingFullscreen?: boolean }) | null
    if (doc.fullscreenElement) doc.exitFullscreen?.().catch(() => {})
    else if (doc.webkitFullscreenElement) doc.webkitExitFullscreen?.()
    if (el?.webkitDisplayingFullscreen) el.webkitExitFullscreen?.()
  }

  function abrirPregunta() {
    const indice = superadasRef.current
    setAnunciar(!pausasAnunciadasRef.current.has(indice))
    pausasAnunciadasRef.current.add(indice)
    modalAbiertoRef.current = true
    setModalAbierto(true)
    setAperturas((n) => n + 1)
  }

  function llegarAPausa() {
    const el = videoRef.current
    const pausa = pausas[superadasRef.current]
    if (!el || !pausa || modalAbiertoRef.current) return
    el.pause()
    if (el.currentTime > pausa.seg) el.currentTime = pausa.seg
    salirPantallaCompleta()
    abrirPregunta()
    onGuardarEstado?.({ pausasSuperadas: superadasRef.current, enPausa: true })
  }

  // Al tener los metadatos, coloca el video donde corresponde retomar.
  function alCargarMetadatos() {
    const el = videoRef.current
    if (!el || posicionadoRef.current) return
    posicionadoRef.current = true
    if (soloLectura) return
    const pausa = pausas[superadasRef.current]
    if (estadoInicial.enPausa && pausa) {
      el.currentTime = pausa.seg
      setSeg(pausa.seg)
      abrirPregunta()
    } else if (superadasRef.current > 0) {
      const desde = pausas[superadasRef.current - 1].seg
      el.currentTime = desde
      setSeg(desde)
    }
  }

  function alActualizarTiempo() {
    const el = videoRef.current
    if (!el) return
    setSeg(el.currentTime)
    const pausa = pausas[superadasRef.current]
    if (pausa && el.currentTime >= pausa.seg - 0.05) llegarAPausa()
  }

  // No se puede saltar la próxima pregunta arrastrando la barra.
  function alBuscar() {
    const el = videoRef.current
    const pausa = pausas[superadasRef.current]
    if (el && pausa && el.currentTime > pausa.seg) el.currentTime = pausa.seg
  }

  function alReproducir() {
    if (avisoGirarVisible) cerrarAvisoGirar()
    if (modalAbiertoRef.current) videoRef.current?.pause()
  }

  function alTerminarVideo() {
    if (pausas[superadasRef.current]) return llegarAPausa()
    setTerminado(true)
    salirPantallaCompleta()
  }

  function alAprobarPausa() {
    const nuevas = superadasRef.current + 1
    superadasRef.current = nuevas
    modalAbiertoRef.current = false
    setSuperadas(nuevas)
    setModalAbierto(false)
    onGuardarEstado?.({ pausasSuperadas: nuevas, enPausa: false })
    videoRef.current?.play().catch(() => {})
  }

  // "Repetir trozo": cierra la pregunta y vuelve a reproducir el tramo
  // desde la pausa anterior (o desde el inicio). Al llegar otra vez a la
  // pausa, la pregunta se reabre sola.
  function repetirTrozo() {
    detenerVoz()
    const el = videoRef.current
    modalAbiertoRef.current = false
    setModalAbierto(false)
    const desde = superadasRef.current > 0 ? pausas[superadasRef.current - 1].seg : 0
    onGuardarEstado?.({ pausasSuperadas: superadasRef.current, enPausa: false })
    if (!el) return
    el.currentTime = desde
    setSeg(desde)
    el.play().catch(() => {})
  }

  function entrarPantallaCompleta() {
    const el = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!el) return
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen()
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 px-1">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide"
          style={{ background: 'color-mix(in srgb, var(--academia-accent, hsl(var(--accent))) 15%, transparent)', color: 'var(--academia-accent, hsl(var(--accent)))' }}
        >
          {seccion.titulo}
        </span>
        {pausas.length > 0 && (
          <span className="flex items-center gap-1.5" aria-label={`${superadas}/${pausas.length}`}>
            {pausas.map((p, i) => (
              <span
                key={p.seg}
                className={`flex h-5 w-5 items-center justify-center rounded-full ${i < superadas ? 'bg-success text-success-foreground' : 'bg-secondary text-muted-foreground'}`}
              >
                {i < superadas ? <Check className="h-3 w-3" strokeWidth={3} /> : <ListChecks className="h-3 w-3" />}
              </span>
            ))}
          </span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-black">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- son videos propios sin pista de subtítulos todavía */}
        <video
          ref={videoRef}
          src={video.src}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full"
          onLoadedMetadata={alCargarMetadatos}
          onTimeUpdate={alActualizarTiempo}
          onSeeking={alBuscar}
          onPlay={alReproducir}
          onEnded={alTerminarVideo}
        />
        <button
          type="button"
          onClick={entrarPantallaCompleta}
          aria-label={t.academia.pantallaCompleta}
          title={t.academia.pantallaCompleta}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/45 text-white backdrop-blur-sm"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {avisoGirarVisible && (
          <div
            role="button"
            tabIndex={0}
            onClick={cerrarAvisoGirar}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') cerrarAvisoGirar()
            }}
            className="academia-aviso-girar absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/70 px-5 text-center"
          >
            <Smartphone className="academia-aviso-girar-icono h-11 w-11 text-white" aria-hidden="true" />
            <p className="text-[13.5px] font-extrabold leading-snug text-white">{t.academia.girarCelularTitulo}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                cerrarAvisoGirar()
              }}
              className="mt-0.5 rounded-full border border-white/50 bg-white/15 px-4 py-1.5 text-xs font-extrabold text-white"
            >
              {t.academia.girarCelularBoton}
            </button>
            <p className="text-[10px] font-semibold text-white/60">{t.academia.girarCelularAyuda}</p>
          </div>
        )}
      </div>

      <TarjetaContenido titulo={`${t.academia.nodoResumen} · ${tema.nombre}`}>
        <p className="text-sm leading-relaxed text-foreground/85">{tema.resumen}</p>
      </TarjetaContenido>

      <BotonContinuar
        disabled={!terminado}
        texto={
          soloLectura
            ? t.academia.nodoYaCompletado
            : terminado && etiquetaSiguiente
              ? t.academia.continuarA(etiquetaSiguiente)
              : t.academia.videoBloqueadoTexto
        }
        onClick={onContinuar}
      />

      {pendiente && (
        <ModalPruebaVideo
          key={`${superadas}-${aperturas}`}
          t={t}
          abierto={modalAbierto}
          preguntas={PRUEBAS_CAP1[pendiente.pruebaId]}
          indices={pendiente.preguntas}
          numero={superadas + 1}
          anunciar={anunciar}
          total={pausas.length}
          onRepetirTrozo={repetirTrozo}
          onFallo={(indice) => onFalloModal(`${pendiente.pruebaId}:${indice}`)}
          onAprobado={alAprobarPausa}
          onCerrar={() => {
            detenerVoz()
            modalAbiertoRef.current = false
            setModalAbierto(false)
            onSalirModal()
          }}
        />
      )}
    </>
  )
}

/**
 * Pregunta "por capas" (rediseño 2026-09-24) — un solo diseño para las
 * pausas del video (`ModalPruebaVideo`), los cuestionarios de tema y la
 * prueba final (`NodoPrueba`):
 *   1. lo de atrás (video pausado o la pantalla del nodo) queda oscurecido;
 *   2. la tarjeta de la pregunta encima — abajo en móvil vertical, en 2
 *      columnas (pregunta | opciones) en móvil horizontal, centrada en
 *      tablet/PC, y scrollea por dentro si no entra: nunca se corta;
 *   3. si se falla, la corrección sube por encima (pregunta atenuada) con
 *      Muelín "de nuevo", tu respuesta vs la correcta y el dato clave.
 * Todo respeta la zona segura (env(safe-area-inset-*), ver .academia-pv-*
 * en index.css). Solo dibuja: el estado (selección, intentos, puntos) lo
 * lleva quien la usa.
 */
function CapasPregunta({
  t,
  pregunta,
  seleccion,
  onElegir,
  etiqueta,
  etiquetaCorta,
  iconoEtiqueta,
  accionIzquierda,
  pista,
  saliendo = false,
  onCerrar,
  panelAcierto,
  accionesFallo,
  avisoFallo,
}: {
  t: Diccionario
  pregunta: PreguntaAcademia
  seleccion: number | null
  onElegir: (oi: number) => void
  /** Parte larga del aviso de arriba (se oculta en pantallas angostas), ej. "Vídeo en pausa". */
  etiqueta: string
  /** Parte corta, siempre visible, ej. "Pregunta 1 de 3". */
  etiquetaCorta: string
  iconoEtiqueta?: ReactNode
  /** Botón de la izquierda de la barra (ej. "Repetir trozo"). */
  accionIzquierda?: ReactNode
  pista?: string
  saliendo?: boolean
  onCerrar: () => void
  /** Lo que aparece debajo de las opciones al acertar (título, puntos, botón para seguir). */
  panelAcierto?: ReactNode
  /** Botones de la capa de corrección. */
  accionesFallo: ReactNode
  /** Aviso extra en la capa de corrección (ej. los puntos que ya no se alcanzan). */
  avisoFallo?: ReactNode
}) {
  const respondido = seleccion !== null
  const acertada = respondido && seleccion === pregunta.correcta
  const fallada = respondido && !acertada
  const letras = ['A', 'B', 'C', 'D', 'E', 'F']
  const panelRef = useRef<HTMLDivElement>(null)

  // En pantallas bajas el panel de "¡Bien!" puede quedar fuera de la vista
  // de la tarjeta: se lo trae a la vista al aparecer.
  useEffect(() => {
    if (acertada) panelRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [acertada])

  return (
    <div
      className={`academia-pv-overlay duration-200 ${saliendo ? 'animate-out fade-out' : 'animate-in fade-in'}`}
      role="dialog"
      aria-modal="true"
      aria-label={t.academia.nodoAutoevaluacion}
    >
      {/* Barra superior: acción · aviso · cerrar */}
      <div className="flex shrink-0 items-center gap-2">
        {accionIzquierda}
        <span className="flex-1" />
        <span className="flex h-8 min-w-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 px-3 text-xs font-extrabold text-white/90">
          {iconoEtiqueta}
          <span className="hidden truncate min-[520px]:inline">{etiqueta} · </span>
          {etiquetaCorta}
        </span>
        <button
          type="button"
          onClick={onCerrar}
          aria-label={t.academia.libroCerrarSheet}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Capa 2: la pregunta */}
      <div className="academia-pv-cuerpo">
        <div
          className={`academia-pv-tarjeta card-elevated bg-card duration-300 ${
            saliendo ? 'animate-out fade-out slide-out-to-bottom-4' : 'animate-in fade-in slide-in-from-bottom-4'
          } ${fallada ? 'academia-pv-atenuada' : ''}`}
          aria-hidden={fallada}
        >
          <div className="academia-pv-grid">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex items-start gap-3">
                <Muelin expresion={acertada ? 'feliz' : 'neutral'} className="academia-pv-muelin h-12 w-12 shrink-0" />
                <p className="min-w-0 flex-1 text-[15.5px] font-extrabold leading-snug text-foreground lg:text-lg">{pregunta.pregunta}</p>
              </div>
              {!respondido && pista && <p className="academia-pv-pista text-xs font-bold text-muted-foreground">{pista}</p>}
            </div>

            <div className="flex min-w-0 flex-col justify-center gap-2">
              {pregunta.opciones.map((op, oi) => {
                const esCorrecta = respondido && oi === pregunta.correcta
                const esMia = respondido && oi === seleccion && !esCorrecta
                const caja = esCorrecta
                  ? 'border-success bg-success/12 text-success'
                  : esMia
                    ? 'border-destructive bg-destructive/12 text-destructive'
                    : respondido
                      ? 'border-transparent bg-secondary/50 text-muted-foreground'
                      : 'border-border bg-secondary text-foreground hover:border-primary/60'
                const insignia = esCorrecta
                  ? 'bg-success text-success-foreground'
                  : esMia
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-background/70 text-muted-foreground'
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={respondido}
                    onClick={() => onElegir(oi)}
                    className={`flex min-h-[50px] w-full items-center gap-3 rounded-2xl border-2 px-2.5 py-2 text-left text-sm font-bold transition active:scale-[0.99] ${caja}`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-black ${insignia}`}>
                      {esCorrecta ? <Check className="h-4 w-4" strokeWidth={3} /> : esMia ? <X className="h-4 w-4" strokeWidth={3} /> : letras[oi]}
                    </span>
                    <span className="min-w-0 flex-1">{op}</span>
                  </button>
                )
              })}

              {acertada && panelAcierto && <div ref={panelRef}>{panelAcierto}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Capa 3: la corrección, por encima de la pregunta */}
      {fallada && (
        <div className="academia-pv-capa-fallo">
          <div className="academia-pv-fallo card-elevated animate-in fade-in slide-in-from-bottom-6 bg-card duration-300" role="alertdialog" aria-live="assertive">
            <div className="academia-pv-grid">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Muelin expresion="de-nuevo" className="h-16 w-16 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xl font-black text-destructive">{t.academia.videoFalloTitulo}</p>
                    <p className="text-[13px] font-semibold leading-snug text-muted-foreground">{t.academia.videoFalloTexto}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 text-[13.5px] font-bold">
                  <p className="flex items-start gap-2 text-destructive">
                    <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-destructive text-destructive-foreground">
                      <X className="h-3 w-3" strokeWidth={3.5} />
                    </span>
                    <span>
                      {t.academia.videoTuRespuesta}: {pregunta.opciones[seleccion ?? 0]}
                    </span>
                  </p>
                  <p className="flex items-start gap-2 text-success">
                    <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-success text-success-foreground">
                      <Check className="h-3 w-3" strokeWidth={3.5} />
                    </span>
                    <span>
                      {t.academia.videoCorrecta}: {pregunta.opciones[pregunta.correcta]}
                    </span>
                  </p>
                </div>
                {avisoFallo}
              </div>

              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex gap-2.5 rounded-2xl bg-secondary p-3">
                  <Lightbulb className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-500" />
                  <p className="text-[13px] font-medium leading-relaxed text-foreground/85">
                    <span className="font-extrabold text-foreground">{t.academia.videoDatoClave}:</span> {pregunta.feedback}
                  </p>
                </div>
                <div className="mt-auto flex flex-col-reverse gap-2 min-[480px]:flex-row">{accionesFallo}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Ventana de pregunta sobre el video en pausa (rediseño 2026-09-24, vistas
 * responsive — ver canvas "Academia — preguntas sobre el vídeo").
 *
 * Capas, de atrás hacia adelante:
 *   1. El video queda detrás, pausado, oscurecido y levemente desenfocado
 *      (el overlay es translúcido: se ve el cuadro donde se paró).
 *   2. La tarjeta de la pregunta encima. En móvil vertical va abajo (zona
 *      del pulgar); en móvil horizontal se parte en 2 columnas (pregunta |
 *      opciones) para que NUNCA quede cortada; en tablet/PC va centrada.
 *   3. Si falla: la corrección sube POR ENCIMA de la pregunta (que queda
 *      atenuada), con Muelín "de nuevo", tu respuesta vs la correcta, el
 *      dato clave y los botones Repetir trozo / Reintentar.
 *
 * Nada interactivo toca los bordes: todo el padding sale de
 * env(safe-area-inset-*) con un mínimo (ver .academia-pv-* en index.css),
 * así el notch, las esquinas redondeadas y la barra de gestos no se comen
 * nada. Si el alto no alcanza, la tarjeta scrollea por dentro.
 *
 * Lógica sin cambios respecto a 2026-09-23: pregunta FIJA (la primera de
 * `indices`), si se falla se repite la MISMA hasta acertarla, no da puntos
 * y cada fallo se guarda (onFallo). Nuevo: "Repetir trozo" (onRepetirTrozo)
 * cierra la ventana y vuelve a reproducir el tramo desde la pausa anterior.
 */
function ModalPruebaVideo({
  t,
  abierto,
  preguntas,
  indices,
  numero,
  total,
  anunciar,
  onFallo,
  onAprobado,
  onRepetirTrozo,
  onCerrar,
}: {
  t: Diccionario
  abierto: boolean
  preguntas: PreguntaAcademia[]
  /** Índices de `preguntas` para esta pausa: sale siempre el primero (pregunta fija). Sin esto, la primera del pool. */
  indices?: number[]
  /** Número de esta pausa (1-based) y total de pausas del video, para el aviso "Pregunta n de m". */
  numero: number
  total: number
  /** true = primera vez que se abre esta pausa: suena la voz de entrada. */
  anunciar: boolean
  /** Se llama cada vez que se falla (índice de la pregunta dentro del pool). Estas pruebas no dan puntos, solo guardan el error. */
  onFallo: (indice: number) => void
  onAprobado: () => void
  /** Cierra la ventana y vuelve a ver el tramo del video que lleva a esta pregunta. */
  onRepetirTrozo: () => void
  onCerrar: () => void
}) {
  const qIndex = indices && indices.length > 0 ? indices[0] : 0
  const [seleccion, setSeleccion] = useState<number | null>(null)
  const [saliendo, setSaliendo] = useState(false)
  const [esperandoVoz, setEsperandoVoz] = useState(false)

  // Voz de entrada: "Bien. Vamos ahora a realizar una pequeña prueba".
  useEffect(() => {
    if (abierto && anunciar) reproducirVoz('pruebaIntermedia')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir (el modal se remonta en cada apertura)
  }, [abierto])

  if (!abierto) return null

  const pregunta = preguntas[qIndex]
  const respondido = seleccion !== null
  const acertada = respondido && seleccion === pregunta.correcta
  const fallada = respondido && !acertada

  function elegir(oi: number) {
    if (seleccion !== null) return
    setSeleccion(oi)
    if (oi !== pregunta.correcta) {
      onFallo(qIndex)
      reproducirVoz('falloReintentar')
    } else {
      reproducirVoz('aciertoSeguir')
    }
  }

  // Misma pregunta, otra oportunidad.
  function reintentar() {
    detenerVoz()
    setSeleccion(null)
  }

  // Espera a que termine "Muy bien, vamos a seguir con la lección" (para que
  // no se pise con el audio del video) y sale con transición antes de
  // avisarle al padre (el video retoma solo).
  function confirmarAprobado() {
    if (esperandoVoz || saliendo) return
    setEsperandoVoz(true)
    esperarFinVoz().then(() => {
      setSaliendo(true)
      setTimeout(() => onAprobado(), 260)
    })
  }

  return (
    <CapasPregunta
      t={t}
      pregunta={pregunta}
      seleccion={seleccion}
      onElegir={elegir}
      etiqueta={t.academia.videoEnPausa}
      etiquetaCorta={t.academia.videoPreguntaDe(numero, total)}
      iconoEtiqueta={<Pause className="h-3 w-3 shrink-0" fill="currentColor" />}
      accionIzquierda={
        <button
          type="button"
          onClick={onRepetirTrozo}
          disabled={fallada}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/15 pl-2.5 pr-3.5 text-[13px] font-extrabold text-white backdrop-blur-sm transition active:scale-[0.97] disabled:invisible"
        >
          <RotateCcw className="h-4 w-4" />
          {t.academia.videoRepetirTrozo}
        </button>
      }
      pista={t.academia.videoPista}
      saliendo={saliendo}
      onCerrar={onCerrar}
      panelAcierto={
        <div className="mt-1 flex items-center gap-3 rounded-2xl bg-success/12 p-2.5 pl-3.5">
          <p className="flex-1 text-base font-black text-success">{t.academia.pruebaAprobadaTitulo}</p>
          <Button onClick={confirmarAprobado} disabled={esperandoVoz} className="h-11 rounded-xl px-5 font-extrabold">
            {t.academia.videoSeguir}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      }
      accionesFallo={
        <>
          <Button variant="outline" onClick={onRepetirTrozo} className="h-12 w-full rounded-2xl font-extrabold min-[480px]:w-auto min-[480px]:flex-1">
            <RotateCcw className="mr-1.5 h-4 w-4" />
            {t.academia.videoRepetirTrozo}
          </Button>
          <Button onClick={reintentar} className="h-12 w-full rounded-2xl font-extrabold min-[480px]:w-auto min-[480px]:flex-[1.4]">
            {t.academia.pruebaReintentar}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </>
      }
    />
  )
}

function PantallaNodo({
  t,
  nodoId,
  progreso,
  repitiendo,
  onCompletar,
  onAvanzarSinVolver,
  onFallo,
  onGuardarVideo,
  onVolver,
}: {
  t: Diccionario
  nodoId: string
  progreso: ProgresoCap1
  repitiendo: boolean
  onCompletar: (nodoId: string, intentosPreguntas?: number[]) => void
  onAvanzarSinVolver: (nodoId: string, siguienteId: string) => void
  onFallo: (nodoId: string, preguntaId: string) => void
  onGuardarVideo: (nodoId: string, estado: EstadoVideoGuardado) => void
  onVolver: () => void
}) {
  const nodo: NodoRuta | undefined = NODOS_CAP1.find((n) => n.id === nodoId)
  if (!nodo) return null
  const prog = progreso[nodoId] ?? { estado: 'bloqueado' as EstadoNodo }
  const soloLectura = prog.estado === 'completado' && !repitiendo
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
          onClick={() => {
            if (soloLectura) return onVolver()
            // Corrección 2026-09-19: al terminar la intro se sigue directo al
            // primer video (mismo mecanismo que video1→video2), sin volver a
            // la lista del libro.
            if (siguienteNodo) return onAvanzarSinVolver(nodoId, siguienteNodo.id)
            return onCompletar(nodoId)
          }}
          texto={soloLectura ? t.academia.nodoYaCompletado : t.academia.nodoContinuar}
        />
      </NodoLayout>
    )
  }

  if (nodo.tipo === 'video') {
    const video = VIDEOS_CAP1.find((v) => v.id === nodo.videoId)
    if (!video) return null
    // Rediseño 2026-09-23: un solo video con pausas (ver NodoVideo). En modo
    // repetir arranca de 0 y no pisa lo guardado; en solo-lectura no hay
    // pausas.
    const estadoInicial = repitiendo || soloLectura ? { pausasSuperadas: 0, enPausa: false } : { pausasSuperadas: prog.pausasSuperadas ?? 0, enPausa: Boolean(prog.enPausa) }
    return (
      <NodoLayout titulo={video.titulo} subtitulo={subtituloCap1} onVolver={onVolver}>
        <NodoVideo
          key={nodoId}
          t={t}
          video={video}
          soloLectura={soloLectura}
          etiquetaSiguiente={siguienteNodo?.titulo ?? null}
          estadoInicial={estadoInicial}
          onGuardarEstado={repitiendo || soloLectura ? undefined : (estado) => onGuardarVideo(nodoId, estado)}
          onContinuar={() => {
            if (soloLectura) return onVolver()
            // Al terminar el video se pasa directo al nodo siguiente, sin
            // volver a la lista (igual que antes con video3).
            if (siguienteNodo) return onAvanzarSinVolver(nodoId, siguienteNodo.id)
            return onCompletar(nodoId)
          }}
          onFalloModal={(preguntaId) => onFallo(nodoId, preguntaId)}
          onSalirModal={onVolver}
        />
      </NodoLayout>
    )
  }

  // tipo === 'prueba'
  const poolPreguntas = nodo.pruebaId ? PRUEBAS_CAP1[nodo.pruebaId] : undefined
  if (!poolPreguntas) return null
  // La prueba final usa las primeras N preguntas del pool, fijas y en orden.
  const preguntas = nodo.esFinal ? poolPreguntas.slice(0, PREGUNTAS_PRUEBA_FINAL_CAP1) : poolPreguntas
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
        esFinal={Boolean(nodo.esFinal)}
        etiquetaSiguiente={siguienteNodo?.titulo ?? null}
        marcaPrevia={prog.intentosPreguntas}
        titulo={nodo.titulo}
        onSalir={onVolver}
        onFallo={(indice) => onFallo(nodoId, `${nodo.pruebaId}:${indice}`)}
        onContinuar={(intentosPreguntas) => {
          if (soloLectura) return onVolver()
          // Cuestionario de un tema (no puntúa): sigue directo al nodo
          // siguiente, igual que video → siguiente. La prueba final guarda la
          // marca con los intentos y cierra con el resumen.
          if (!nodo.esFinal && siguienteNodo) return onAvanzarSinVolver(nodoId, siguienteNodo.id)
          return onCompletar(nodoId, intentosPreguntas)
        }}
      />
    </NodoLayout>
  )
}

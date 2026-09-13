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
  Library,
  FileText,
} from 'lucide-react'
import { getAnios, getCapitulos, getLibros, getPreguntas } from '@/lib/data'
import { getConfigExamenRemota, guardarConfigExamenRemota } from '@/lib/configExamen'
import { getLibroPacientesEspecialesHabilitado } from '@/lib/fuenteLibroAccesoRemoto'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import type { CursoMeta } from '@/lib/cursos'
import type { Pantalla } from '@/types'

// Nombre corto para mostrar cada libro en dos líneas dentro del selector de
// capítulo: autora primero (es bibliografía para examinarse, lo que importa
// es de quién es el libro) y el tema debajo, más chico. Sin esto el título
// completo de `libro` (ej. "Odontología en Pacientes con Necesidades
// Especiales (Inmaculada Tomás)") se corta con "…" antes de llegar al
// nombre de la autora.
const NOMBRES_CORTOS_LIBRO: Record<string, { autor: string; tema: string }> = {
  'Odontología en Pacientes con Necesidades Especiales (Inmaculada Tomás)': {
    autor: 'Inmaculada Tomás',
    tema: 'Necesidades Especiales',
  },
}

function formatearLibro(libro: string): { autor: string; tema: string } {
  return NOMBRES_CORTOS_LIBRO[libro] ?? { autor: libro, tema: '' }
}

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
  const libros = cursoMeta.tieneLibros ? getLibros(cursoId) : []
  const anios = getAnios(cursoId)
  // Elegir Fuente "Libro" para ir capítulo por capítulo del libro es una
  // función reservada para una futura versión de pago: se activa por
  // usuario desde la columna `perfiles.libro_pacientes_especiales_habilitado`
  // (mismo patrón que `academia_habilitada`, ver fuenteLibroAccesoRemoto.ts
  // — de solo lectura acá, solo un admin la puede prender). Mientras esté en
  // false (el default para todo el mundo) las preguntas del libro se siguen
  // pudiendo sumar enteras desde Fuente "Exámenes" (la fila con el nombre
  // del libro en la lista de capítulos, más abajo) — lo único que depende
  // de este flag es la posibilidad de elegir sus capítulos sueltos.
  const [mostrarSelectorFuenteLibro, setMostrarSelectorFuenteLibro] = useState(false)
  const [cantidad, setCantidad] = useState(cursoMeta.cantidadOficial)
  // Array vacío = "todos los capítulos"; con elementos, el examen combina
  // las preguntas de todos los capítulos elegidos (no es excluyente como
  // antes, que solo dejaba elegir uno o todos). Los capítulos son siempre
  // relativos a la Fuente activa (ver más abajo): cambiar de Fuente o de
  // libro reinicia esta selección.
  const [capitulos, setCapitulos] = useState<string[]>([])
  const [anio, setAnio] = useState<number | 'todos'>('todos')
  const [conTiempo, setConTiempo] = useState(false)
  const [duracion, setDuracion] = useState(cursoMeta.duracionOficialMinutos)
  const [cargandoConfig, setCargandoConfig] = useState(true)
  // La pantalla siempre abre en modo "oficial" (colapsado), sin importar qué
  // haya quedado guardado la última vez — personalizando solo se activa
  // cuando el usuario toca "Personalizar" en esta visita.
  const [personalizando, setPersonalizando] = useState(false)
  // Fuente de las preguntas dentro del modo personalizado: "examenes" (banco
  // de siempre) o "libro" (preguntas cargadas desde un libro de texto, solo
  // si cursoMeta.tieneLibros). No existe como concepto en la base de datos:
  // se infiere/guarda a través de qué capítulos quedan elegidos, ver el
  // useEffect de carga y iniciar() más abajo.
  const [fuente, setFuente] = useState<'examenes' | 'libro'>('examenes')
  const [libroSeleccionado, setLibroSeleccionado] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    setCargandoConfig(true)
    ;(async () => {
      // El flag se resuelve ANTES de decidir la Fuente inferida más abajo:
      // si se usara el estado `mostrarSelectorFuenteLibro` directamente ahí,
      // podría llegar todavía en su valor inicial (false) por la carrera
      // entre esta promesa y el render — se guarda en una variable local en
      // vez de depender del estado.
      const libroHabilitado = cursoMeta.tieneLibros ? await getLibroPacientesEspecialesHabilitado() : false
      if (cancelado) return
      setMostrarSelectorFuenteLibro(libroHabilitado)

      const guardada = await getConfigExamenRemota(
        userId,
        cursoId,
        cursoMeta.cantidadOficial,
        cursoMeta.duracionOficialMinutos,
      )
      if (cancelado) return
      setCantidad(guardada.cantidad)
      setCapitulos(guardada.capitulos)
      setAnio(cursoMeta.tieneConvocatorias ? guardada.anio : 'todos')
      setConTiempo(guardada.conTiempo)
      setDuracion(guardada.duracion)
      // La config guardada solo tiene `capitulos` (no un campo de fuente
      // propio): se reconstruye a partir del libro de la primera pregunta
      // encontrada en ese capítulo. Un capítulo de Exámenes nunca coincide
      // con un capítulo de libro (nombres siempre distintos), así que esto
      // es inambiguo. Array vacío = Exámenes (comportamiento de siempre).
      // Con el selector de Fuente "Libro" deshabilitado (usuario sin el
      // flag), esta inferencia queda desactivada a propósito: aunque la
      // config guardada tenga capítulos de un libro (por ej. elegidos con
      // la fila-atajo de Fuente Exámenes), la pantalla se queda en Fuente
      // "Exámenes".
      if (libroHabilitado) {
        const primerCapitulo = guardada.capitulos[0]
        const libroDelPrimero = primerCapitulo
          ? preguntas.find((p) => p.capitulo === primerCapitulo)?.libro
          : undefined
        setFuente(libroDelPrimero ? 'libro' : 'examenes')
        setLibroSeleccionado(libroDelPrimero ?? null)
      } else {
        setFuente('examenes')
        setLibroSeleccionado(null)
      }
      setCargandoConfig(false)
    })()
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, cursoId])

  // Preguntas de la fuente activa. Con Fuente "Libro" se restringe a las del
  // libro elegido (para poder elegir sus capítulos sin mezclarlos con otro
  // libro futuro). Con Fuente "Exámenes" es el banco completo del curso: acá
  // no se descartan las preguntas de libro, así "Todos los capítulos" suma
  // también las 307 preguntas del libro sin que sus 16 capítulos aparezcan
  // como opciones sueltas en esta lista (eso solo pasa al elegir Fuente
  // "Libro") — el filtro por nombre de capítulo (Exámenes CRADO/Otros
  // Exámenes) ya las deja afuera de esos dos conteos igual.
  const preguntasDeFuente =
    fuente === 'libro' && libroSeleccionado ? preguntas.filter((p) => p.libro === libroSeleccionado) : preguntas
  const todosLosCapitulos =
    fuente === 'libro' && libroSeleccionado ? getCapitulos(cursoId, libroSeleccionado) : getCapitulos(cursoId, null)

  const disponibles = preguntasDeFuente.filter(
    (p) => (capitulos.length === 0 || capitulos.includes(p.capitulo)) && (anio === 'todos' || p.anio === anio),
  ).length

  // "Todos los capítulos" en Fuente Libro tiene que resolverse a la lista
  // concreta de capítulos de ESE libro antes de guardar/arrancar: un array
  // vacío en seleccionarPreguntas() trae el curso entero (exámenes + todos
  // los libros), que es lo que se quiere para Fuente Exámenes pero no para
  // Fuente Libro cuando el usuario quiso acotarse a un libro puntual.
  function capitulosParaIniciar(): string[] {
    if (fuente === 'libro' && libroSeleccionado && capitulos.length === 0) {
      return getCapitulos(cursoId, libroSeleccionado)
    }
    return capitulos
  }

  function elegirFuente(nueva: 'examenes' | 'libro') {
    setFuente(nueva)
    setLibroSeleccionado(nueva === 'libro' ? libros[0] ?? null : null)
    setCapitulos([])
  }

  function elegirLibro(libro: string) {
    setLibroSeleccionado(libro)
    setCapitulos([])
  }

  function iniciar() {
    const capitulosFinal = capitulosParaIniciar()
    guardarConfigExamenRemota(userId, cursoId, { cantidad, capitulos: capitulosFinal, anio, conTiempo, duracion })
    onIniciar(cantidad, capitulosFinal, conTiempo ? duracion : null, anio)
  }

  // Atajo del modo "oficial": arranca siempre con los valores de la ley
  // (cantidad y duración oficiales, todos los capítulos), sin tocar ni
  // pisar la configuración personalizada que el usuario tenga guardada.
  // El chequeo de `preguntas.length` es una defensa contra que el banco
  // todavía no haya cargado (o haya fallado) — antes esto nunca hacía falta
  // porque el banco venía embebido en JSON y siempre tenía datos; ahora que
  // depende de una consulta a Supabase, arrancar un examen sin preguntas
  // rompía la pantalla de Examen más adelante.
  function iniciarOficial() {
    if (preguntas.length === 0) return
    onIniciar(cursoMeta.cantidadOficial, [], cursoMeta.duracionOficialMinutos, 'todos')
  }

  function restablecer() {
    setCantidad(cursoMeta.cantidadOficial)
    setCapitulos([])
    setAnio('todos')
    setConTiempo(true)
    setDuracion(cursoMeta.duracionOficialMinutos)
    setFuente('examenes')
    setLibroSeleccionado(null)
  }

  function toggleCapitulo(cap: string) {
    setCapitulos((prev) => (prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]))
  }

  // Fila "atajo" que aparece en Fuente Exámenes junto a Exámenes CRADO/Otros
  // Exámenes: un libro entero como si fuera un único capítulo más. Activarla
  // agrega de una todos los capítulos reales de ese libro a la selección (se
  // combinan con lo que ya esté elegido, igual que combinar dos capítulos de
  // examen); desactivarla los saca a todos juntos.
  function toggleLibroCompleto(libro: string) {
    const capitulosDelLibro = getCapitulos(cursoId, libro)
    const yaCompleto = capitulosDelLibro.length > 0 && capitulosDelLibro.every((c) => capitulos.includes(c))
    setCapitulos((prev) =>
      yaCompleto
        ? prev.filter((c) => !capitulosDelLibro.includes(c))
        : [...prev.filter((c) => !capitulosDelLibro.includes(c)), ...capitulosDelLibro],
    )
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

          {mostrarSelectorFuenteLibro && cursoMeta.tieneLibros && (
            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <Library className="h-3.5 w-3.5" />
                {t.configurar.fuente}
              </div>
              <p className="px-1 text-xs font-medium text-muted-foreground">{t.configurar.fuenteAyuda}</p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => elegirFuente('examenes')}
                  className={`card-elevated flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition ${
                    fuente === 'examenes' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  {t.configurar.fuenteExamenes}
                </button>
                <button
                  onClick={() => elegirFuente('libro')}
                  className={`card-elevated flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition ${
                    fuente === 'libro' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                  }`}
                >
                  <Library className="h-4 w-4" />
                  {t.configurar.fuenteLibro}
                </button>
              </div>

              {fuente === 'libro' && libros.length > 0 && (
                <div className="animate-float-up space-y-2 pt-1">
                  {libros.map((libro) => (
                    <button
                      key={libro}
                      onClick={() => elegirLibro(libro)}
                      className={`card-elevated flex w-full items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition ${
                        libroSeleccionado === libro ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                      }`}
                    >
                      {libroSeleccionado === libro && <Check className="h-4 w-4 shrink-0" />}
                      <span className="min-w-0 truncate">{libro}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
                  {preguntasDeFuente.filter((p) => anio === 'todos' || p.anio === anio).length} {t.configurar.preguntas}
                </span>
              </button>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {todosLosCapitulos.map((cap) => {
                  const n = preguntasDeFuente.filter(
                    (p) => p.capitulo === cap && (anio === 'todos' || p.anio === anio),
                  ).length
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
                {fuente === 'examenes' &&
                  libros.map((libro) => {
                    const capitulosDelLibro = getCapitulos(cursoId, libro)
                    const n = preguntas.filter(
                      (p) => p.libro === libro && (anio === 'todos' || p.anio === anio),
                    ).length
                    const activo = capitulosDelLibro.length > 0 && capitulosDelLibro.every((c) => capitulos.includes(c))
                    const { autor, tema } = formatearLibro(libro)
                    return (
                      <button
                        key={libro}
                        onClick={() => toggleLibroCompleto(libro)}
                        className={`card-elevated flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition ${
                          activo ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2 pr-2">
                          {activo && <Check className="h-4 w-4 shrink-0" />}
                          <Library className="h-4 w-4 shrink-0" />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate">{autor}</span>
                            {tema && (
                              <span
                                className={`truncate text-xs font-medium ${
                                  activo ? 'text-white/70' : 'text-muted-foreground'
                                }`}
                              >
                                {tema}
                              </span>
                            )}
                          </span>
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
                disabled={preguntas.length === 0}
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

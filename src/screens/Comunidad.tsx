import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  BellOff,
  Bell,
  Check,
  ChevronDown,
  Info,
  LogOut,
  Lock,
  Megaphone,
  MessagesSquare,
  MoreVertical,
  Pause,
  Pin,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import {
  aceptarNormas,
  aliasDe,
  borrarMensaje,
  crearAlias,
  enviarMensaje,
  esEquipo,
  listarMensajes,
  listarMisMembresias,
  listarSalas,
  marcarLeida,
  noLeidosPorSala,
  obtenerAlias,
  resumenSalas,
  salirDeSala,
  setSilenciado,
  suscribirseAListado,
  suscribirseASala,
  unirseASala,
  verificarMensaje,
  type MensajeChat,
  type MiembroSala,
  type ResumenSala,
  type Sala,
} from '@/lib/comunidad'
import type { Pantalla } from '@/types'

const TX = {
  es: {
    titulo: 'Comunidad',
    buscarGrupo: 'Buscar grupo',
    sinResultados: 'Ningún grupo coincide',
    chat: 'Chat',
    proximamente: 'Próximamente',
    masSecciones: 'Más secciones de la comunidad',
    masSeccionesDesc: 'Estamos preparando nuevas formas de estudiar en comunidad.',
    equipo: 'Equipo',
    avisosNombre: 'Avisos del equipo',
    soloLectura: 'Solo el equipo puede escribir aquí',
    pausa: 'Grupo en pausa: el equipo reactivará el chat pronto',
    pendiente: 'Tu solicitud está pendiente de aprobación',
    escribe: 'Escribe un mensaje…',
    lento: (s: number) => `modo lento ${s} s`,
    miembros: (n: number) => `${n} ${n === 1 ? 'miembro' : 'miembros'}`,
    sinMensajes: 'Aún no hay mensajes',
    verificada: 'Respuesta verificada por el equipo',
    borrado: 'Mensaje eliminado por el equipo',
    respondiendo: 'Respondiendo a',
    vacio: 'Aún no hay mensajes. ¡Escribe el primero!',
    elige: 'Elige un grupo para empezar a chatear',
    hoy: 'Hoy',
    ayer: 'Ayer',
    nuevos: (n: number) => `${n} ${n === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}`,
    buscarMensajes: 'Buscar en el grupo',
    sinCoincidencias: 'Sin coincidencias',
    normasFijadas: 'Normas del grupo',
    fijado: 'Fijado',
    aliasTitulo: 'Elige tu alias',
    aliasDesc: 'Es el nombre que verán los demás. Nunca mostramos tu correo. 3 a 20 caracteres: letras, números, punto, guion y guion bajo.',
    aliasPlaceholder: 'Tu alias',
    aliasGuardar: 'Guardar alias',
    aliasDuplicado: 'Ese alias ya está en uso.',
    aliasFormato: 'Usa 3 a 20 caracteres: letras, números, . - _',
    aliasProhibido: 'Ese alias no está permitido.',
    aliasError: 'No se pudo guardar. Inténtalo de nuevo.',
    normasTitulo: 'Normas del grupo',
    normasAceptar: 'Acepto las normas',
    normasSub: 'Para escribir en este grupo debes aceptar las normas.',
    menuSilenciar: 'Silenciar notificaciones',
    menuActivar: 'Activar notificaciones',
    menuInfo: 'Información y normas',
    menuSalir: 'Salir del grupo',
    borrar: 'Eliminar',
    verificar: 'Verificar',
    quitarVerif: 'Quitar verificación',
    responder: 'Responder',
    cerrar: 'Cerrar',
    enviarError: 'No se pudo enviar.',
    tu: 'Tú',
    anonimo: 'Usuario',
    acceso: 'Con aprobación',
    bajar: 'Ir al último mensaje',
  },
  en: {
    titulo: 'Community',
    buscarGrupo: 'Search group',
    sinResultados: 'No group matches',
    chat: 'Chat',
    proximamente: 'Coming soon',
    masSecciones: 'More community sections',
    masSeccionesDesc: 'We are preparing new ways to study together.',
    equipo: 'Team',
    avisosNombre: 'Team announcements',
    soloLectura: 'Only the team can write here',
    pausa: 'Group paused: the team will reactivate the chat soon',
    pendiente: 'Your request is pending approval',
    escribe: 'Write a message…',
    lento: (s: number) => `slow mode ${s} s`,
    miembros: (n: number) => `${n} ${n === 1 ? 'member' : 'members'}`,
    sinMensajes: 'No messages yet',
    verificada: 'Answer verified by the team',
    borrado: 'Message removed by the team',
    respondiendo: 'Replying to',
    vacio: 'No messages yet. Write the first one!',
    elige: 'Pick a group to start chatting',
    hoy: 'Today',
    ayer: 'Yesterday',
    nuevos: (n: number) => `${n} new ${n === 1 ? 'message' : 'messages'}`,
    buscarMensajes: 'Search in group',
    sinCoincidencias: 'No matches',
    normasFijadas: 'Group rules',
    fijado: 'Pinned',
    aliasTitulo: 'Choose your alias',
    aliasDesc: 'This is the name others will see. We never show your email. 3 to 20 characters: letters, numbers, dot, dash and underscore.',
    aliasPlaceholder: 'Your alias',
    aliasGuardar: 'Save alias',
    aliasDuplicado: 'That alias is already taken.',
    aliasFormato: 'Use 3 to 20 characters: letters, numbers, . - _',
    aliasProhibido: 'That alias is not allowed.',
    aliasError: 'Could not save. Try again.',
    normasTitulo: 'Group rules',
    normasAceptar: 'I accept the rules',
    normasSub: 'To write in this group you must accept the rules.',
    menuSilenciar: 'Mute notifications',
    menuActivar: 'Unmute notifications',
    menuInfo: 'Info and rules',
    menuSalir: 'Leave group',
    borrar: 'Remove',
    verificar: 'Verify',
    quitarVerif: 'Remove verification',
    responder: 'Reply',
    cerrar: 'Close',
    enviarError: 'Could not send.',
    tu: 'You',
    anonimo: 'User',
    acceso: 'Approval required',
    bajar: 'Go to latest message',
  },
}
type Tx = typeof TX.es

function iniciales(nombre: string): string {
  const limpio = nombre.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]/g, ' ').trim()
  const partes = limpio.split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

function tono(clave: string): number {
  let h = 0
  for (let i = 0; i < clave.length; i++) h = (h * 31 + clave.charCodeAt(i)) % 360
  return h
}

function Avatar({ nombre, clave, size, avisos }: { nombre: string; clave: string; size: number; avisos?: boolean }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        backgroundColor: avisos ? 'hsl(var(--accent))' : `hsl(${tono(clave)} 52% 40%)`,
      }}
    >
      {avisos ? <Megaphone style={{ width: size * 0.48, height: size * 0.48 }} /> : iniciales(nombre)}
    </span>
  )
}

const loc = (idioma: string) => (idioma === 'en' ? 'en-US' : 'es-ES')

function hora(iso: string, idioma: string): string {
  return new Date(iso).toLocaleTimeString(loc(idioma), { hour: '2-digit', minute: '2-digit' })
}

function mismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Hora si es de hoy, "Ayer", día de la semana si es de esta semana, o fecha corta. */
function marcaLista(iso: string, idioma: string, tx: Tx): string {
  const f = new Date(iso)
  const ahora = new Date()
  if (mismoDia(f, ahora)) return hora(iso, idioma)
  const ayer = new Date(ahora)
  ayer.setDate(ahora.getDate() - 1)
  if (mismoDia(f, ayer)) return tx.ayer
  const dias = (ahora.getTime() - f.getTime()) / 86_400_000
  if (dias < 7) return f.toLocaleDateString(loc(idioma), { weekday: 'short' })
  return f.toLocaleDateString(loc(idioma), { day: '2-digit', month: '2-digit' })
}

function etiquetaDia(iso: string, idioma: string, tx: Tx): string {
  const f = new Date(iso)
  const ahora = new Date()
  if (mismoDia(f, ahora)) return tx.hoy
  const ayer = new Date(ahora)
  ayer.setDate(ahora.getDate() - 1)
  if (mismoDia(f, ayer)) return tx.ayer
  return f.toLocaleDateString(loc(idioma), { day: 'numeric', month: 'long' })
}

function useAncho(): boolean {
  const consulta = '(min-width: 1024px)'
  const [ancho, setAncho] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches)
  useEffect(() => {
    const mq = window.matchMedia(consulta)
    const fn = () => setAncho(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return ancho
}

const esAvisos = (s: Sala) => s.escribe === 'equipo' && !s.asignatura

export function Comunidad({ userId, onNavigate }: { userId: string; onNavigate: (p: Pantalla) => void }) {
  const { idioma } = useAppSettings()
  const tx: Tx = idioma === 'en' ? TX.en : TX.es
  const ancho = useAncho()

  const [salas, setSalas] = useState<Sala[] | null>(null)
  const [miembros, setMiembros] = useState<Map<string, MiembroSala>>(new Map())
  const [noLeidos, setNoLeidos] = useState<Map<string, number>>(new Map())
  const [resumen, setResumen] = useState<Map<string, ResumenSala>>(new Map())
  const [autoresLista, setAutoresLista] = useState<Map<string, string>>(new Map())
  const [equipo, setEquipo] = useState(false)
  const [alias, setAlias] = useState<string | null | undefined>(undefined)
  const [salaId, setSalaId] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')

  const recargarListado = useCallback(async () => {
    const [s, m, n, r] = await Promise.all([listarSalas(), listarMisMembresias(userId), noLeidosPorSala(), resumenSalas()])
    setSalas(s)
    setMiembros(m)
    setNoLeidos(n)
    setResumen(r)
    const ids = [...r.values()].map((x) => x.ultAutorId).filter((x): x is string => !!x)
    if (ids.length) setAutoresLista(await aliasDe(ids))
  }, [userId])

  useEffect(() => {
    let cancelado = false
    Promise.all([esEquipo(), obtenerAlias(userId)]).then(([e, a]) => {
      if (cancelado) return
      setEquipo(e)
      setAlias(a)
    })
    recargarListado()
    return () => {
      cancelado = true
    }
  }, [userId, recargarListado])

  // Mantiene viva la lista (último mensaje, contadores): un canal propio con
  // nombre único, distinto del de cada grupo abierto y del de la barra.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    const programar = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(recargarListado, 400)
    }
    const quitar = suscribirseAListado(programar)
    window.addEventListener('comunidad:leido', programar)
    return () => {
      if (timer) clearTimeout(timer)
      window.removeEventListener('comunidad:leido', programar)
      quitar()
    }
  }, [recargarListado])

  // Estables a propósito: SalaChat los usa como dependencia de la suscripción Realtime.
  const recargarMiembros = useCallback(async () => setMiembros(await listarMisMembresias(userId)), [userId])
  const cambioSala = useCallback(
    (s: Sala) => setSalas((prev) => prev?.map((x) => (x.id === s.id ? s : x)) ?? prev),
    [],
  )

  const sala = useMemo(() => salas?.find((s) => s.id === salaId) ?? null, [salas, salaId])

  // Avisos fijo arriba; el resto, por actividad reciente.
  const salasOrdenadas = useMemo(() => {
    const lista = [...(salas ?? [])]
    lista.sort((a, b) => {
      if (esAvisos(a) !== esAvisos(b)) return esAvisos(a) ? -1 : 1
      const ta = resumen.get(a.id)?.ultEn ?? ''
      const tb = resumen.get(b.id)?.ultEn ?? ''
      if (ta !== tb) return ta < tb ? 1 : -1
      return a.orden - b.orden
    })
    const q = filtro.trim().toLowerCase()
    return q ? lista.filter((s) => (esAvisos(s) ? tx.avisosNombre : s.nombre).toLowerCase().includes(q)) : lista
  }, [salas, resumen, filtro, tx.avisosNombre])

  async function abrirSala(s: Sala) {
    if (!miembros.has(s.id) && !equipo) {
      await unirseASala(s.id, userId)
      setMiembros(await listarMisMembresias(userId))
    }
    setSalaId(s.id)
  }

  async function cerrarSala() {
    setSalaId(null)
    await recargarListado()
  }

  const lista = (
    <ListaGrupos
      tx={tx}
      idioma={idioma}
      userId={userId}
      salas={salasOrdenadas}
      cargando={salas === null}
      miembros={miembros}
      noLeidos={noLeidos}
      resumen={resumen}
      autores={autoresLista}
      activa={salaId}
      filtro={filtro}
      onFiltro={setFiltro}
      onAbrir={abrirSala}
    />
  )

  const panel = sala ? (
    <SalaChat
      key={sala.id}
      sala={sala}
      userId={userId}
      equipo={equipo}
      alias={alias ?? null}
      miembro={miembros.get(sala.id) ?? null}
      miembrosN={resumen.get(sala.id)?.miembros ?? null}
      embebido={ancho}
      tx={tx}
      idioma={idioma}
      onAlias={setAlias}
      onMiembro={recargarMiembros}
      onSalaCambio={cambioSala}
      onVolver={cerrarSala}
    />
  ) : null

  // Móvil con un grupo abierto: el chat ocupa toda la pantalla.
  if (!ancho && panel) return panel

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <h1 className="mt-6 text-lg font-extrabold text-foreground">{tx.titulo}</h1>

      {ancho ? (
        <div className="card-elevated mt-4 grid h-[calc(100dvh-14rem)] min-h-[420px] grid-cols-[340px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-border bg-card">
          <div className="min-h-0 overflow-y-auto border-r border-border">{lista}</div>
          <div className="min-h-0">
            {panel ?? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <MessagesSquare className="h-10 w-10 opacity-50" />
                <p className="text-sm font-semibold">{tx.elige}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card-elevated mt-4 overflow-hidden rounded-2xl bg-card">{lista}</div>
      )}

      <BottomNav activo="comunidad" onNavigate={onNavigate} />
    </div>
  )
}

/* ------------------------------------------------------------------ */

function ListaGrupos({
  tx,
  idioma,
  userId,
  salas,
  cargando,
  miembros,
  noLeidos,
  resumen,
  autores,
  activa,
  filtro,
  onFiltro,
  onAbrir,
}: {
  tx: Tx
  idioma: string
  userId: string
  salas: Sala[]
  cargando: boolean
  miembros: Map<string, MiembroSala>
  noLeidos: Map<string, number>
  resumen: Map<string, ResumenSala>
  autores: Map<string, string>
  activa: string | null
  filtro: string
  onFiltro: (v: string) => void
  onAbrir: (s: Sala) => void
}) {
  return (
    <div>
      <div className="p-3">
        <label className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-muted-foreground">
          <Search className="h-4 w-4 shrink-0" />
          <input
            id="comunidad-buscar-grupo"
            value={filtro}
            onChange={(e) => onFiltro(e.target.value)}
            placeholder={tx.buscarGrupo}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="px-1.5 pb-2">
        {cargando && <div className="p-6 text-center text-sm text-muted-foreground">…</div>}
        {!cargando && salas.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">{tx.sinResultados}</p>
        )}
        {salas.map((s) => {
          const m = miembros.get(s.id)
          const n = noLeidos.get(s.id) ?? 0
          const r = resumen.get(s.id)
          const avisos = esAvisos(s)
          const activo = activa === s.id
          const nombre = avisos ? tx.avisosNombre : s.nombre

          let previa: ReactNode = s.asignatura ?? tx.soloLectura
          if (m?.estado === 'pendiente') previa = tx.pendiente
          else if (r?.ultCuerpo !== null && r?.ultCuerpo !== undefined) {
            const autor = r.ultBorrado
              ? null
              : r.ultAutorId === userId && !r.ultEsEquipo
                ? tx.tu
                : r.ultEsEquipo
                  ? autores.get(r.ultAutorId ?? '') ?? tx.equipo
                  : autores.get(r.ultAutorId ?? '') ?? tx.anonimo
            previa = r.ultBorrado ? (
              <em>{tx.borrado}</em>
            ) : (
              <>
                <b className="font-bold">{autor}:</b> {r.ultCuerpo}
              </>
            )
          } else if (r) previa = tx.sinMensajes

          return (
            <button
              key={s.id}
              onClick={() => onAbrir(s)}
              className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition ${
                activo ? 'bg-accent text-accent-foreground' : 'active:bg-secondary/60'
              }`}
            >
              <Avatar nombre={nombre} clave={s.id} size={46} avisos={avisos} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[15px] font-extrabold">
                  <span className="truncate">{nombre}</span>
                  {m?.silenciado && <BellOff className="h-3 w-3 shrink-0 opacity-70" />}
                  {s.pausada && <Pause className="h-3 w-3 shrink-0 opacity-70" />}
                </p>
                <p className={`truncate text-[12.5px] ${activo ? 'text-accent-foreground/85' : 'text-muted-foreground'}`}>
                  {previa}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`text-[11px] ${activo ? 'text-accent-foreground/85' : 'text-muted-foreground'}`}>
                  {r?.ultEn ? marcaLista(r.ultEn, idioma, tx) : ''}
                </span>
                {n > 0 ? (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold ${
                      activo
                        ? 'bg-white text-accent'
                        : m?.silenciado
                          ? 'bg-muted-foreground text-background'
                          : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    {n > 99 ? '99+' : n}
                  </span>
                ) : avisos ? (
                  <Pin className="h-3.5 w-3.5 opacity-60" />
                ) : (
                  <span className="h-5" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {!filtro && (
        <div className="mx-3 mb-3 flex items-center gap-3 rounded-2xl border-2 border-dashed border-border p-3 opacity-70">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <span className="truncate">{tx.masSecciones}</span>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-muted-foreground">
                {tx.proximamente}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">{tx.masSeccionesDesc}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

interface SalaChatProps {
  sala: Sala
  userId: string
  equipo: boolean
  alias: string | null
  miembro: MiembroSala | null
  miembrosN: number | null
  embebido: boolean
  tx: Tx
  idioma: string
  onAlias: (a: string) => void
  onMiembro: () => Promise<void>
  onSalaCambio: (s: Sala) => void
  onVolver: () => void
}

const FONDO_CHAT = {
  backgroundImage:
    'radial-gradient(circle at 20% 30%, hsl(var(--accent) / 0.08) 0 2px, transparent 3px), radial-gradient(circle at 70% 70%, hsl(var(--accent) / 0.08) 0 2px, transparent 3px)',
  backgroundSize: '34px 34px, 34px 34px',
}

function SalaChat({
  sala,
  userId,
  equipo,
  alias,
  miembro,
  miembrosN,
  embebido,
  tx,
  idioma,
  onAlias,
  onMiembro,
  onSalaCambio,
  onVolver,
}: SalaChatProps) {
  const [mensajes, setMensajes] = useState<MensajeChat[] | null>(null)
  const [aliases, setAliases] = useState<Map<string, string>>(new Map())
  const [texto, setTexto] = useState('')
  const [respondiendo, setRespondiendo] = useState<MensajeChat | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [menu, setMenu] = useState(false)
  const [info, setInfo] = useState(false)
  const [pedirAlias, setPedirAlias] = useState(false)
  const [pedirNormas, setPedirNormas] = useState(false)
  const [accionesDe, setAccionesDe] = useState<string | null>(null)
  const [silenciado, setSilenciadoLocal] = useState(miembro?.silenciado ?? false)
  const [normasOk, setNormasOk] = useState(miembro?.normasAceptadas ?? false)
  const [buscando, setBuscando] = useState(false)
  const [consulta, setConsulta] = useState('')
  const [divisor, setDivisor] = useState<{ id: string; n: number } | null>(null)
  const [lejos, setLejos] = useState(false)
  const [nuevosAbajo, setNuevosAbajo] = useState(0)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const cercaRef = useRef(true)
  const prevLenRef = useRef(0)
  const lecturaInicial = useRef(miembro?.ultimaLectura ?? null)

  const avisos = esAvisos(sala)
  const nombreSala = avisos ? tx.avisosNombre : sala.nombre
  const activo = equipo || miembro?.estado === 'activo'

  const cargarAliases = useCallback(async (lista: MensajeChat[]) => {
    const nuevos = await aliasDe(lista.map((m) => m.autorId))
    setAliases((prev) => {
      const copia = new Map(prev)
      nuevos.forEach((v, k) => copia.set(k, v))
      return copia
    })
  }, [])

  useEffect(() => {
    if (!activo) {
      setMensajes([])
      return
    }
    let cancelado = false
    listarMensajes(sala.id).then((lista) => {
      if (cancelado) return
      // "N mensajes nuevos": los de otros posteriores a la última lectura, calculado una sola vez al abrir.
      const desde = lecturaInicial.current
      if (desde && !equipo) {
        const nuevos = lista.filter((m) => m.creadoEn > desde && m.autorId !== userId)
        if (nuevos.length) setDivisor({ id: nuevos[0].id, n: nuevos.length })
      }
      setMensajes(lista)
      cargarAliases(lista)
      if (!equipo) marcarLeida(sala.id, userId)
    })
    const quitar = suscribirseASala(
      sala.id,
      (m) => {
        setMensajes((prev) => (prev && !prev.some((x) => x.id === m.id) ? [...prev, m] : prev))
        cargarAliases([m])
        if (!equipo) marcarLeida(sala.id, userId)
      },
      (m) => setMensajes((prev) => prev?.map((x) => (x.id === m.id ? m : x)) ?? prev),
      onSalaCambio,
    )
    return () => {
      cancelado = true
      quitar()
    }
  }, [sala.id, activo, equipo, userId, cargarAliases, onSalaCambio])

  const irAbajo = useCallback((suave: boolean) => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: suave ? 'smooth' : 'auto' })
  }, [])

  // Al llegar mensajes: baja solo si ya estabas abajo o el mensaje es tuyo; si no, cuenta los nuevos.
  useEffect(() => {
    if (!mensajes) return
    const len = mensajes.length
    const anterior = prevLenRef.current
    prevLenRef.current = len
    if (len === anterior) return
    const ultimo = mensajes[len - 1]
    if (anterior === 0 || cercaRef.current || ultimo?.autorId === userId) {
      requestAnimationFrame(() => irAbajo(anterior !== 0))
    } else {
      setNuevosAbajo((n) => n + (len - anterior))
    }
  }, [mensajes, userId, irAbajo])

  function alScroll() {
    const el = scrollRef.current
    if (!el) return
    const cerca = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    cercaRef.current = cerca
    setLejos(!cerca)
    if (cerca) setNuevosAbajo(0)
  }

  const visibles = useMemo(() => {
    if (!mensajes) return null
    const q = consulta.trim().toLowerCase()
    return q ? mensajes.filter((m) => !m.borrado && m.cuerpo.toLowerCase().includes(q)) : mensajes
  }, [mensajes, consulta])

  const porId = useMemo(() => new Map((mensajes ?? []).map((m) => [m.id, m])), [mensajes])

  function nombreDe(m: MensajeChat): string {
    if (m.autorId === userId && !m.esEquipo) return alias ?? tx.tu
    if (m.esEquipo) return aliases.get(m.autorId) ?? tx.equipo
    return aliases.get(m.autorId) ?? tx.anonimo
  }

  const puedeEscribir = equipo || (!avisos && !sala.pausada && sala.escribe === 'todos' && miembro?.estado === 'activo')

  function intentarEscribir() {
    if (equipo) return
    if (!alias) return setPedirAlias(true)
    if (!normasOk) return setPedirNormas(true)
  }

  async function enviar() {
    const cuerpo = texto.trim()
    if (!cuerpo || enviando) return
    if (!equipo && !alias) return setPedirAlias(true)
    if (!equipo && !normasOk) return setPedirNormas(true)
    setEnviando(true)
    setError(null)
    const r = await enviarMensaje(sala.id, userId, cuerpo, respondiendo?.id)
    setEnviando(false)
    if (r.ok) {
      setTexto('')
      setRespondiendo(null)
    } else {
      setError(r.error ?? tx.enviarError)
    }
  }

  async function alternarSilencio() {
    const nuevo = !silenciado
    setMenu(false)
    if (await setSilenciado(sala.id, userId, nuevo)) setSilenciadoLocal(nuevo)
  }

  async function salir() {
    setMenu(false)
    await salirDeSala(sala.id, userId)
    await onMiembro()
    onVolver()
  }

  const fijado = sala.fijado || sala.normas.split('\n')[0] || ''
  const subtitulo = sala.pausada
    ? tx.pausa
    : avisos
      ? tx.soloLectura
      : [miembrosN !== null ? tx.miembros(miembrosN) : sala.asignatura, sala.modoLentoSeg > 0 ? tx.lento(sala.modoLentoSeg) : null]
          .filter(Boolean)
          .join(' · ')

  return (
    <div className={embebido ? 'flex h-full min-h-0 flex-col bg-background' : 'mx-auto flex h-[100dvh] w-full flex-col bg-background'}>
      {/* Cabecera */}
      <header className="relative flex items-center gap-2 border-b border-border bg-card px-3 py-2.5">
        {!embebido && (
          <button onClick={onVolver} aria-label={tx.cerrar} className="flex h-9 w-9 items-center justify-center rounded-full text-foreground active:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <Avatar nombre={sala.nombre} clave={sala.id} size={40} avisos={avisos} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold leading-tight text-foreground">{nombreSala}</p>
          <p className="flex items-center gap-1 truncate text-[11.5px] text-muted-foreground">
            {sala.pausada && <Pause className="h-3 w-3 shrink-0" />}
            <span className="truncate">{subtitulo}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setBuscando((v) => !v)
            setConsulta('')
          }}
          aria-label={tx.buscarMensajes}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-secondary"
        >
          <Search className="h-5 w-5" />
        </button>
        <button onClick={() => setMenu((v) => !v)} aria-label="Menú" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground active:bg-secondary">
          <MoreVertical className="h-5 w-5" />
        </button>
        {menu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
            <div className="card-elevated absolute right-3 top-full z-50 mt-1 w-60 overflow-hidden rounded-2xl border border-border bg-card py-1">
              <button onClick={alternarSilencio} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground active:bg-secondary">
                {silenciado ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                {silenciado ? tx.menuActivar : tx.menuSilenciar}
              </button>
              <button
                onClick={() => {
                  setMenu(false)
                  setInfo(true)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground active:bg-secondary"
              >
                <Info className="h-4 w-4" />
                {tx.menuInfo}
              </button>
              {!equipo && (
                <button onClick={salir} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-destructive active:bg-secondary">
                  <LogOut className="h-4 w-4" />
                  {tx.menuSalir}
                </button>
              )}
            </div>
          </>
        )}
      </header>

      {buscando && (
        <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            id="comunidad-buscar-mensaje"
            autoFocus
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder={tx.buscarMensajes}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => {
              setBuscando(false)
              setConsulta('')
            }}
            aria-label={tx.cerrar}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Mensaje fijado / normas */}
      {fijado && !avisos && (
        <button
          onClick={() => setInfo(true)}
          className="flex items-stretch gap-2.5 border-b border-border bg-secondary/70 px-4 py-1.5 text-left"
        >
          <span className="w-[3px] shrink-0 rounded-full bg-accent" />
          <span className="min-w-0">
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-accent">
              <ShieldCheck className="h-3 w-3" />
              {sala.fijado ? tx.fijado : tx.normasFijadas}
            </span>
            <span className="block truncate text-[12.5px] text-foreground">{fijado}</span>
          </span>
        </button>
      )}

      {/* Mensajes */}
      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={alScroll} className="h-full overflow-y-auto px-3 py-3" style={FONDO_CHAT}>
          {miembro?.estado === 'pendiente' && !equipo && (
            <p className="mt-10 text-center text-sm text-muted-foreground">{tx.pendiente}</p>
          )}
          {mensajes && mensajes.length === 0 && activo && (
            <p className="mt-10 text-center text-sm text-muted-foreground">{tx.vacio}</p>
          )}
          {consulta.trim() && visibles && visibles.length === 0 && (
            <p className="mt-10 text-center text-sm text-muted-foreground">{tx.sinCoincidencias}</p>
          )}
          {visibles?.map((m, i) => {
            const propio = m.autorId === userId
            const prev = visibles[i - 1]
            const sig = visibles[i + 1]
            const nuevoDia = !prev || !mismoDia(new Date(prev.creadoEn), new Date(m.creadoEn))
            const cerca = (a?: MensajeChat) =>
              !!a && a.autorId === m.autorId && Math.abs(new Date(a.creadoEn).getTime() - new Date(m.creadoEn).getTime()) < 5 * 60_000 && mismoDia(new Date(a.creadoEn), new Date(m.creadoEn))
            const primero = nuevoDia || !cerca(prev)
            const ultimo = !cerca(sig)
            const citado = m.respondeA ? porId.get(m.respondeA) : undefined
            const nombre = nombreDe(m)

            return (
              <div key={m.id}>
                {nuevoDia && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-black/30 px-3 py-0.5 text-[11.5px] font-bold text-white">
                      {etiquetaDia(m.creadoEn, idioma, tx)}
                    </span>
                  </div>
                )}
                {divisor?.id === m.id && !consulta.trim() && (
                  <div className="-mx-3 my-3 bg-secondary/80 py-1 text-center text-xs font-extrabold text-accent">
                    {tx.nuevos(divisor.n)}
                  </div>
                )}
                <div className={`flex items-end gap-2 ${propio ? 'justify-end' : 'justify-start'} ${primero ? 'mt-3' : 'mt-0.5'}`}>
                  {!propio && (
                    <div className="w-8 shrink-0">
                      {ultimo &&
                        (m.esEquipo ? (
                          <Avatar nombre={tx.equipo} clave="equipo" size={32} avisos />
                        ) : (
                          <Avatar nombre={nombre} clave={m.autorId} size={32} />
                        ))}
                    </div>
                  )}
                  <div className={`flex max-w-[80%] flex-col ${propio ? 'items-end' : 'items-start'}`}>
                    <div
                      onClick={() => equipo && !m.borrado && setAccionesDe(accionesDe === m.id ? null : m.id)}
                      className={`relative px-3 py-1.5 text-[14px] leading-snug shadow-sm ${
                        m.borrado
                          ? 'rounded-2xl border border-dashed border-border bg-transparent italic text-muted-foreground'
                          : propio
                            ? `accent-gradient text-white ${ultimo ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}`
                            : `bg-card text-foreground ${ultimo ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`
                      }`}
                    >
                      {primero && !propio && !m.borrado && (
                        <p className="mb-0.5 flex items-center gap-1.5 text-[12px] font-extrabold" style={{ color: m.esEquipo ? 'hsl(var(--accent))' : `hsl(${tono(m.autorId)} 55% 42%)` }}>
                          {nombre}
                          {m.esEquipo && (
                            <span className="rounded-md bg-accent/15 px-1 py-[1px] text-[9px] font-extrabold uppercase text-accent">{tx.equipo}</span>
                          )}
                        </p>
                      )}
                      {m.borrado ? (
                        <span className="text-[13px]">{tx.borrado}</span>
                      ) : (
                        <>
                          {citado && (
                            <div className={`mb-1 rounded-lg border-l-4 px-2 py-1 text-[12px] ${propio ? 'border-white/70 bg-white/15' : 'border-accent bg-secondary'}`}>
                              <p className="font-bold">{nombreDe(citado)}</p>
                              <p className="line-clamp-2 opacity-80">{citado.borrado ? tx.borrado : citado.cuerpo}</p>
                            </div>
                          )}
                          <span className="whitespace-pre-wrap break-words">{m.cuerpo}</span>
                          <span className={`ml-2 inline-flex translate-y-[3px] items-center gap-0.5 text-[10px] ${propio ? 'text-white/75' : 'text-muted-foreground'}`}>
                            {hora(m.creadoEn, idioma)}
                            {propio && <Check className="h-3 w-3" />}
                          </span>
                        </>
                      )}
                    </div>
                    {m.verificado && !m.borrado && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-accent">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        {tx.verificada}
                      </p>
                    )}
                    {!m.borrado && puedeEscribir && (
                      <button onClick={() => setRespondiendo(m)} className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                        {tx.responder}
                      </button>
                    )}
                    {equipo && accionesDe === m.id && !m.borrado && (
                      <div className="mt-1 flex gap-2">
                        <button
                          onClick={async () => {
                            await verificarMensaje(m.id, !m.verificado)
                            setAccionesDe(null)
                          }}
                          className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-foreground"
                        >
                          <BadgeCheck className="h-3.5 w-3.5" />
                          {m.verificado ? tx.quitarVerif : tx.verificar}
                        </button>
                        <button
                          onClick={async () => {
                            await borrarMensaje(m.id, userId)
                            setAccionesDe(null)
                          }}
                          className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-bold text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {tx.borrar}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {lejos && (
          <button
            onClick={() => irAbajo(true)}
            aria-label={tx.bajar}
            className="card-elevated absolute bottom-3 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground"
          >
            <ChevronDown className="h-5 w-5" />
            {nuevosAbajo > 0 && (
              <span className="absolute -right-1 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-accent-foreground">
                {nuevosAbajo > 99 ? '99+' : nuevosAbajo}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Escribir */}
      <div className="safe-bottom border-t border-border bg-card px-3 pt-2">
        {respondiendo && (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-secondary px-3 py-1.5 text-xs">
            <div className="min-w-0 flex-1 border-l-4 border-accent pl-2">
              <p className="font-bold text-foreground">
                {tx.respondiendo} {nombreDe(respondiendo)}
              </p>
              <p className="truncate text-muted-foreground">{respondiendo.cuerpo}</p>
            </div>
            <button onClick={() => setRespondiendo(null)} aria-label={tx.cerrar}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}
        {error && <p className="mb-2 rounded-xl bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">{error}</p>}
        {!puedeEscribir ? (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-full bg-secondary px-3 py-3 text-xs font-semibold text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            {sala.pausada ? tx.pausa : miembro?.estado === 'pendiente' ? tx.pendiente : tx.soloLectura}
          </div>
        ) : (
          <div className="mb-2 flex items-end gap-2">
            <textarea
              id="comunidad-mensaje"
              value={texto}
              onFocus={intentarEscribir}
              onChange={(e) => setTexto(e.target.value.slice(0, 1000))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviar()
                }
              }}
              rows={1}
              placeholder={tx.escribe}
              className="max-h-28 min-h-[42px] flex-1 resize-none rounded-3xl bg-secondary px-4 py-2.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={enviar}
              disabled={!texto.trim() || enviando}
              aria-label="Enviar"
              className="accent-gradient flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-white transition active:scale-95 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {info && (
        <Hoja titulo={tx.normasTitulo} onCerrar={() => setInfo(false)} cerrarLabel={tx.cerrar}>
          {sala.fijado && <p className="mb-3 whitespace-pre-line text-sm font-semibold text-foreground">{sala.fijado}</p>}
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{sala.normas || '—'}</p>
        </Hoja>
      )}

      {pedirAlias && (
        <AliasSheet
          tx={tx}
          userId={userId}
          onCerrar={() => setPedirAlias(false)}
          onListo={(a) => {
            onAlias(a)
            setPedirAlias(false)
            if (!normasOk) setPedirNormas(true)
          }}
        />
      )}

      {pedirNormas && (
        <Hoja titulo={tx.normasTitulo} onCerrar={() => setPedirNormas(false)} cerrarLabel={tx.cerrar}>
          <p className="mb-3 text-xs text-muted-foreground">{tx.normasSub}</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{sala.normas}</p>
          <button
            onClick={async () => {
              if (await aceptarNormas(sala.id, userId)) {
                setNormasOk(true)
                setPedirNormas(false)
                await onMiembro()
              }
            }}
            className="accent-gradient mt-4 w-full rounded-xl py-3 text-sm font-extrabold text-white active:scale-[0.98]"
          >
            {tx.normasAceptar}
          </button>
        </Hoja>
      )}
    </div>
  )
}

function Hoja({
  titulo,
  onCerrar,
  cerrarLabel,
  children,
}: {
  titulo: string
  onCerrar: () => void
  cerrarLabel: string
  children: ReactNode
}) {
  return (
    <div className="safe-bottom animate-in fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 duration-200 sm:items-center" onClick={onCerrar}>
      <div
        className="card-elevated animate-in fade-in slide-in-from-bottom-4 w-full max-w-sm overflow-hidden rounded-3xl bg-card duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-base font-bold text-foreground">{titulo}</p>
          <button onClick={onCerrar} aria-label={cerrarLabel} className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

function AliasSheet({
  tx,
  userId,
  onCerrar,
  onListo,
}: {
  tx: Tx
  userId: string
  onCerrar: () => void
  onListo: (alias: string) => void
}) {
  const [valor, setValor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function guardar() {
    setGuardando(true)
    setError(null)
    const r = await crearAlias(userId, valor)
    setGuardando(false)
    if (r.ok) return onListo(valor.trim())
    setError(
      r.error === 'duplicado' ? tx.aliasDuplicado : r.error === 'formato' ? tx.aliasFormato : r.error === 'prohibido' ? tx.aliasProhibido : tx.aliasError,
    )
  }

  return (
    <Hoja titulo={tx.aliasTitulo} onCerrar={onCerrar} cerrarLabel={tx.cerrar}>
      <p className="text-xs leading-relaxed text-muted-foreground">{tx.aliasDesc}</p>
      <input
        id="comunidad-alias"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        maxLength={20}
        placeholder={tx.aliasPlaceholder}
        autoComplete="off"
        className="mt-3 w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      {error && <p className="mt-2 text-xs font-semibold text-destructive">{error}</p>}
      <button
        onClick={guardar}
        disabled={valor.trim().length < 3 || guardando}
        className="accent-gradient mt-4 w-full rounded-xl py-3 text-sm font-extrabold text-white active:scale-[0.98] disabled:opacity-40"
      >
        {tx.aliasGuardar}
      </button>
    </Hoja>
  )
}

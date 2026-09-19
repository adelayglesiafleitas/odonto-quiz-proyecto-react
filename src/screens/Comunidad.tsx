import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  BellOff,
  Bell,
  Check,
  ChevronRight,
  Info,
  LogOut,
  Lock,
  Megaphone,
  MoreVertical,
  Pause,
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
  salirDeSala,
  setSilenciado,
  suscribirseASala,
  unirseASala,
  verificarMensaje,
  type MensajeChat,
  type MiembroSala,
  type Sala,
} from '@/lib/comunidad'
import type { Pantalla } from '@/types'

const TX = {
  es: {
    titulo: 'Comunidad',
    chat: 'Chat',
    chatSub: 'Grupos por asignatura para estudiar juntos',
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
    verificada: 'Respuesta verificada por el equipo',
    borrado: 'Mensaje eliminado por el equipo',
    respondiendo: 'Respondiendo a',
    vacio: 'Aún no hay mensajes. ¡Escribe el primero!',
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
    solicitar: 'Solicitar acceso',
  },
  en: {
    titulo: 'Community',
    chat: 'Chat',
    chatSub: 'Subject groups to study together',
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
    verificada: 'Answer verified by the team',
    borrado: 'Message removed by the team',
    respondiendo: 'Replying to',
    vacio: 'No messages yet. Write the first one!',
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
    solicitar: 'Request access',
  },
}

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

function hora(iso: string, idioma: string): string {
  return new Date(iso).toLocaleTimeString(idioma === 'en' ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function Comunidad({ userId, onNavigate }: { userId: string; onNavigate: (p: Pantalla) => void }) {
  const { idioma } = useAppSettings()
  const tx = idioma === 'en' ? TX.en : TX.es

  const [salas, setSalas] = useState<Sala[] | null>(null)
  const [miembros, setMiembros] = useState<Map<string, MiembroSala>>(new Map())
  const [noLeidos, setNoLeidos] = useState<Map<string, number>>(new Map())
  const [equipo, setEquipo] = useState(false)
  const [alias, setAlias] = useState<string | null | undefined>(undefined)
  const [salaId, setSalaId] = useState<string | null>(null)

  const recargarListado = useCallback(async () => {
    const [s, m, n] = await Promise.all([listarSalas(), listarMisMembresias(userId), noLeidosPorSala()])
    setSalas(s)
    setMiembros(m)
    setNoLeidos(n)
  }, [userId])

  useEffect(() => {
    let cancelado = false
    Promise.all([listarSalas(), listarMisMembresias(userId), noLeidosPorSala(), esEquipo(), obtenerAlias(userId)]).then(
      ([s, m, n, e, a]) => {
        if (cancelado) return
        setSalas(s)
        setMiembros(m)
        setNoLeidos(n)
        setEquipo(e)
        setAlias(a)
      },
    )
    return () => {
      cancelado = true
    }
  }, [userId])

  // Estables a propósito: SalaChat los usa como dependencia de la suscripción Realtime.
  const recargarMiembros = useCallback(async () => setMiembros(await listarMisMembresias(userId)), [userId])
  const cambioSala = useCallback(
    (s: Sala) => setSalas((prev) => prev?.map((x) => (x.id === s.id ? s : x)) ?? prev),
    [],
  )

  const sala = useMemo(() => salas?.find((s) => s.id === salaId) ?? null, [salas, salaId])

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

  if (sala) {
    return (
      <SalaChat
        key={sala.id}
        sala={sala}
        userId={userId}
        equipo={equipo}
        alias={alias ?? null}
        miembro={miembros.get(sala.id) ?? null}
        tx={tx}
        idioma={idioma}
        onAlias={setAlias}
        onMiembro={recargarMiembros}
        onSalaCambio={cambioSala}
        onVolver={cerrarSala}
      />
    )
  }

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <h1 className="mt-6 text-lg font-extrabold text-foreground">{tx.titulo}</h1>

      <div className="mt-4">
        <p className="text-[15px] font-bold text-foreground">{tx.chat}</p>
        <p className="text-xs text-muted-foreground">{tx.chatSub}</p>
      </div>

      <div className="card-elevated mt-3 overflow-hidden rounded-2xl bg-card">
        {salas === null && <div className="p-6 text-center text-sm text-muted-foreground">…</div>}
        {salas?.map((s, i) => {
          const m = miembros.get(s.id)
          const n = noLeidos.get(s.id) ?? 0
          const avisos = s.escribe === 'equipo' && !s.asignatura
          return (
            <button
              key={s.id}
              onClick={() => abrirSala(s)}
              className={`flex w-full items-center gap-3 p-3.5 text-left transition active:bg-secondary/60 ${
                i > 0 ? 'border-t border-border' : ''
              }`}
            >
              <Avatar nombre={s.nombre} clave={s.id} size={46} avisos={avisos} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-foreground">
                  {avisos ? tx.avisosNombre : s.nombre}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {m?.estado === 'pendiente'
                    ? tx.pendiente
                    : s.pausada
                      ? tx.pausa
                      : avisos
                        ? tx.soloLectura
                        : s.modoLentoSeg > 0
                          ? tx.lento(s.modoLentoSeg)
                          : s.acceso === 'aprobacion'
                            ? tx.acceso
                            : s.asignatura ?? ''}
                </p>
              </div>
              {m?.silenciado && <BellOff className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              {n > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-extrabold text-accent-foreground">
                  {n > 99 ? '99+' : n}
                </span>
              )}
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 opacity-70">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            {tx.masSecciones}
            <span className="rounded-md bg-muted px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-muted-foreground">
              {tx.proximamente}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{tx.masSeccionesDesc}</p>
        </div>
      </div>

      <BottomNav activo="comunidad" onNavigate={onNavigate} />
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
  tx: typeof TX.es
  idioma: string
  onAlias: (a: string) => void
  onMiembro: () => Promise<void>
  onSalaCambio: (s: Sala) => void
  onVolver: () => void
}

function SalaChat({ sala, userId, equipo, alias, miembro, tx, idioma, onAlias, onMiembro, onSalaCambio, onVolver }: SalaChatProps) {
  const [mensajes, setMensajes] = useState<MensajeChat[] | null>(null)
  const [alias_, setAliases] = useState<Map<string, string>>(new Map())
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
  const finRef = useRef<HTMLDivElement | null>(null)

  const avisos = sala.escribe === 'equipo' && !sala.asignatura
  const nombreSala = avisos ? tx.avisosNombre : sala.nombre
  const activo = equipo || miembro?.estado === 'activo'

  const cargarAliases = useCallback(async (lista: MensajeChat[]) => {
    const faltan = lista.map((m) => m.autorId)
    const nuevos = await aliasDe(faltan)
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

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end' })
  }, [mensajes?.length])

  const porId = useMemo(() => new Map((mensajes ?? []).map((m) => [m.id, m])), [mensajes])

  function nombreDe(m: MensajeChat): string {
    if (m.autorId === userId && !m.esEquipo) return alias ?? tx.tu
    if (m.esEquipo) return alias_.get(m.autorId) ?? tx.equipo
    return alias_.get(m.autorId) ?? tx.anonimo
  }

  const puedeEscribir = equipo || (!avisos && !sala.pausada && sala.escribe === 'todos' && miembro?.estado === 'activo')

  async function intentarEscribir() {
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

  return (
    <div className="mx-auto flex h-[100dvh] w-full flex-col bg-background">
      {/* Cabecera */}
      <header className="relative flex items-center gap-2 border-b border-border bg-card px-3 py-2.5">
        <button onClick={onVolver} aria-label={tx.cerrar} className="flex h-9 w-9 items-center justify-center rounded-full text-foreground active:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar nombre={sala.nombre} clave={sala.id} size={38} avisos={avisos} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold leading-tight text-foreground">{nombreSala}</p>
          <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            {sala.pausada ? (
              <>
                <Pause className="h-3 w-3" /> {tx.pausa}
              </>
            ) : sala.modoLentoSeg > 0 ? (
              tx.lento(sala.modoLentoSeg)
            ) : avisos ? (
              tx.soloLectura
            ) : (
              sala.asignatura
            )}
          </p>
        </div>
        <button onClick={() => setMenu((v) => !v)} aria-label="Menú" className="flex h-9 w-9 items-center justify-center rounded-full text-foreground active:bg-secondary">
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

      {/* Normas fijadas */}
      {sala.normas && !avisos && (
        <button
          onClick={() => setInfo(true)}
          className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-1.5 text-left text-[11px] text-muted-foreground"
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{sala.normas.split('\n')[0]}</span>
        </button>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {miembro?.estado === 'pendiente' && !equipo && (
          <p className="mt-10 text-center text-sm text-muted-foreground">{tx.pendiente}</p>
        )}
        {mensajes && mensajes.length === 0 && activo && (
          <p className="mt-10 text-center text-sm text-muted-foreground">{tx.vacio}</p>
        )}
        {mensajes?.map((m, i) => {
          const propio = m.autorId === userId
          const prev = mensajes[i - 1]
          const sig = mensajes[i + 1]
          const mismoQuePrev = !!prev && prev.autorId === m.autorId && new Date(m.creadoEn).getTime() - new Date(prev.creadoEn).getTime() < 5 * 60_000
          const mismoQueSig = !!sig && sig.autorId === m.autorId && new Date(sig.creadoEn).getTime() - new Date(m.creadoEn).getTime() < 5 * 60_000
          const primero = !mismoQuePrev
          const ultimo = !mismoQueSig
          const citado = m.respondeA ? porId.get(m.respondeA) : undefined
          const nombre = nombreDe(m)

          return (
            <div key={m.id} className={`flex items-end gap-2 ${propio ? 'justify-end' : 'justify-start'} ${primero ? 'mt-3' : 'mt-0.5'}`}>
              {!propio && (
                <div className="w-8 shrink-0">
                  {ultimo && (m.esEquipo ? <Avatar nombre={tx.equipo} clave="equipo" size={32} avisos /> : <Avatar nombre={nombre} clave={m.autorId} size={32} />)}
                </div>
              )}
              <div className={`max-w-[80%] ${propio ? 'items-end' : 'items-start'} flex flex-col`}>
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
                    <p className="mb-0.5 flex items-center gap-1 text-[12px] font-extrabold" style={{ color: m.esEquipo ? 'hsl(var(--accent))' : `hsl(${tono(m.autorId)} 55% 42%)` }}>
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
                {!m.borrado && (
                  <div className="mt-0.5 flex gap-3">
                    {puedeEscribir && (
                      <button onClick={() => setRespondiendo(m)} className="text-[11px] font-semibold text-muted-foreground">
                        {tx.responder}
                      </button>
                    )}
                  </div>
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
          )
        })}
        <div ref={finRef} />
      </div>

      {/* Composer */}
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
          <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-3 text-xs font-semibold text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            {sala.pausada ? tx.pausa : miembro?.estado === 'pendiente' ? tx.pendiente : tx.soloLectura}
          </div>
        ) : (
          <div className="mb-2 flex items-end gap-2">
            <textarea
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
              className="max-h-28 min-h-[42px] flex-1 resize-none rounded-2xl bg-secondary px-4 py-2.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
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
  tx: typeof TX.es
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

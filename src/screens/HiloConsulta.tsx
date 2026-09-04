import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Clock } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { Spinner } from '@/components/Spinner'
import { RUTA, RUTA_SOPORTE } from '@/lib/rutas'
import {
  obtenerTicket,
  obtenerMensajes,
  enviarMensaje,
  marcarLeidoUsuario,
  suscribirseAMensajesTicket,
  type Ticket,
  type Mensaje,
  type EstadoTicket,
} from '@/lib/tickets'

const ESTILO_ESTADO: Record<EstadoTicket, string> = {
  abierto: 'bg-info/12 text-info',
  en_progreso: 'bg-accent/12 text-accent',
  resuelto: 'bg-success/12 text-success',
  cerrado: 'bg-secondary text-muted-foreground',
}

export function HiloConsulta({ userId }: { userId: string }) {
  const { t, idioma } = useAppSettings()
  const formatoHora = new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es', { hour: '2-digit', minute: '2-digit' })
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [cargando, setCargando] = useState(true)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    let cancelado = false
    setCargando(true)
    Promise.all([obtenerTicket(id), obtenerMensajes(id)]).then(([t, m]) => {
      if (cancelado) return
      setTicket(t)
      setMensajes(m)
      setCargando(false)
    })
    marcarLeidoUsuario(id)
    const desuscribir = suscribirseAMensajesTicket(
      id,
      (m) => setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m])),
      () => {
        obtenerTicket(id).then((t) => {
          if (!cancelado) setTicket(t)
        })
      },
    )
    return () => {
      cancelado = true
      desuscribir()
    }
  }, [id])

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end' })
  }, [mensajes.length])

  async function enviar() {
    if (!id || !texto.trim() || enviando) return
    setEnviando(true)
    const cuerpo = texto.trim()
    const { ok } = await enviarMensaje(id, userId, cuerpo)
    if (ok) setTexto('')
    setEnviando(false)
  }

  if (cargando) {
    return (
      <div className="app-shell flex items-center justify-center bg-background text-muted-foreground">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="app-shell flex flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">—</p>
        <button onClick={() => navigate(RUTA.ayuda)} className="text-sm font-bold text-accent">
          {t.comun.cancelar}
        </button>
      </div>
    )
  }

  const reabreAlEscribir = ticket.estado === 'resuelto' || ticket.estado === 'cerrado'

  return (
    <div className="app-shell flex h-screen max-h-screen flex-col bg-background">
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-4">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="flex shrink-0 items-center gap-2.5 border-b border-border px-5 py-4">
        <button
          onClick={() => navigate(RUTA_SOPORTE)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card shadow-sm"
          aria-label={t.comun.cancelar}
        >
          <ArrowLeft className="h-[17px] w-[17px] text-foreground" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-extrabold text-foreground">{ticket.asunto}</p>
          <span
            className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${ESTILO_ESTADO[ticket.estado]}`}
          >
            <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
            {t.soporte.estado[ticket.estado]}
          </span>
        </div>
      </div>

      {ticket.origen === 'pregunta' && ticket.preguntaNumero != null && (
        <div className="mx-5 mt-3 shrink-0 rounded-xl bg-accent/10 px-3.5 py-2.5">
          <p className="text-xs font-extrabold text-accent">
            {t.soporte.preguntaChip(ticket.preguntaNumero)}
            {ticket.preguntaCapitulo ? ` · ${ticket.preguntaCapitulo}` : ''}
          </p>
          {ticket.preguntaTexto && <p className="mt-0.5 text-xs text-foreground/80">{ticket.preguntaTexto}</p>}
        </div>
      )}

      <div className="flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
        {mensajes.map((m) => {
          const esMio = m.autorId === userId
          return (
            <div key={m.id} className={esMio ? 'flex justify-end' : 'flex justify-start'}>
              <div className={`max-w-[80%] ${esMio ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                    esMio
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-secondary text-foreground'
                  }`}
                >
                  {m.cuerpo}
                </div>
                <p className="mt-1 px-0.5 text-[10.5px] text-muted-foreground">{formatoHora.format(new Date(m.creadoEn))}</p>
              </div>
            </div>
          )
        })}
        <div ref={finRef} />
      </div>

      <div className="safe-bottom shrink-0 px-5 pb-4 pt-2">
        {reabreAlEscribir && (
          <div className="mb-2.5 flex items-center gap-2 rounded-xl bg-muted/70 px-3 py-2.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-snug text-muted-foreground">{t.soporte.reabreAviso}</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') enviar()
            }}
            placeholder={t.soporte.escribirPlaceholder}
            className="h-11 flex-1 rounded-full border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={enviar}
            disabled={!texto.trim() || enviando}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground disabled:opacity-50"
            aria-label={t.soporte.enviar}
          >
            {enviando ? <Spinner className="h-4 w-4" /> : <Send className="h-[17px] w-[17px]" />}
          </button>
        </div>
      </div>
    </div>
  )
}

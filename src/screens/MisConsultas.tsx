import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Plus, Inbox } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { Spinner } from '@/components/Spinner'
import { NuevaConsultaModal } from '@/components/NuevaConsultaModal'
import { BottomNav } from '@/components/BottomNav'
import { RUTA, rutaSoporteDetalle } from '@/lib/rutas'
import {
  listarMisTickets,
  suscribirseAMisTickets,
  formatoRelativo,
  type Ticket,
  type EstadoTicket,
} from '@/lib/tickets'
import type { Pantalla } from '@/types'

const ESTILO_ESTADO: Record<EstadoTicket, string> = {
  abierto: 'bg-info/12 text-info',
  en_progreso: 'bg-accent/12 text-accent',
  resuelto: 'bg-success/12 text-success',
  cerrado: 'bg-secondary text-muted-foreground',
}

export function MisConsultas({ userId, onNavigate }: { userId: string; onNavigate: (p: Pantalla) => void }) {
  const { t, idioma } = useAppSettings()
  const navigate = useNavigate()
  const location = useLocation()

  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [nuevoAbierto, setNuevoAbierto] = useState(() => Boolean((location.state as { abrirNuevo?: boolean } | null)?.abrirNuevo))

  async function recargar() {
    const lista = await listarMisTickets(userId)
    setTickets(lista)
  }

  useEffect(() => {
    recargar()
    return suscribirseAMisTickets(userId, recargar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => navigate(RUTA.ayuda)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card shadow-sm"
          aria-label={t.comun.cancelar}
        >
          <ArrowLeft className="h-[18px] w-[18px] text-foreground" />
        </button>
        <h1 className="flex-1 text-lg font-extrabold text-foreground">{t.soporte.tituloLista}</h1>
        <button
          onClick={() => setNuevoAbierto(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"
          aria-label={t.soporte.nuevaConsulta}
        >
          <Plus className="h-[18px] w-[18px]" />
        </button>
      </div>
      <p className="mt-1 px-1 text-xs text-muted-foreground">{t.soporte.subtituloLista}</p>

      <div className="mt-5 space-y-2.5">
        {tickets === null ? (
          <div className="flex items-center justify-center rounded-2xl bg-card py-16 text-muted-foreground">
            <Spinner className="h-5 w-5" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="card-elevated flex flex-col items-center gap-2 rounded-2xl bg-card px-4 py-14 text-center">
            <Inbox className="h-9 w-9 text-muted-foreground/60" />
            <p className="font-bold text-foreground">{t.soporte.vacioTitulo}</p>
            <p className="max-w-xs text-sm text-muted-foreground">{t.soporte.vacioTexto}</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => navigate(rutaSoporteDetalle(ticket.id))}
              className="card-elevated w-full rounded-2xl bg-card p-3.5 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold ${ESTILO_ESTADO[ticket.estado]}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  {t.soporte.estado[ticket.estado]}
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
                  {formatoRelativo(ticket.ultimaActividadEn, idioma)}
                </span>
              </div>

              {ticket.origen === 'pregunta' && ticket.preguntaNumero != null && (
                <span className="mt-1.5 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10.5px] font-extrabold text-accent">
                  {t.soporte.preguntaChip(ticket.preguntaNumero)}
                </span>
              )}

              <div className="mt-1 flex items-center gap-1.5">
                {ticket.noLeidoUsuario && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />}
                <p className="truncate text-[14.5px] font-extrabold text-foreground">{ticket.asunto}</p>
              </div>
            </button>
          ))
        )}
      </div>

      <NuevaConsultaModal
        abierto={nuevoAbierto}
        onClose={() => setNuevoAbierto(false)}
        onCreado={(ticketId) => navigate(rutaSoporteDetalle(ticketId))}
      />

      <BottomNav activo="ayuda" onNavigate={onNavigate} />
    </div>
  )
}

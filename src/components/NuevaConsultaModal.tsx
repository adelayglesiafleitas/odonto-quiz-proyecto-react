import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/Spinner'
import { useAppSettings } from '@/context/AppSettings'
import { crearTicket, type OrigenTicket } from '@/lib/tickets'
import { Check, ChevronDown, CreditCard, MoreHorizontal, User, type LucideIcon } from 'lucide-react'

const MOTIVOS: Exclude<OrigenTicket, 'pregunta'>[] = ['cuenta', 'pagos', 'otro']

const ICONOS_MOTIVO: Record<(typeof MOTIVOS)[number], LucideIcon> = {
  cuenta: User,
  pagos: CreditCard,
  otro: MoreHorizontal,
}

// Modal de "nueva consulta" para /ayuda/soporte — mismo patrón visual que
// ReportarPregunta.tsx (bottom-sheet en mobile, card-elevated), pero crea un
// ticket de soporte general en vez de reportar una pregunta puntual.
export function NuevaConsultaModal({
  abierto,
  onClose,
  onCreado,
}: {
  abierto: boolean
  onClose: () => void
  onCreado: (ticketId: string) => void
}) {
  const { t } = useAppSettings()
  const [motivo, setMotivo] = useState<Exclude<OrigenTicket, 'pregunta'> | null>(null)
  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'error'>('idle')
  const [motivoAbierto, setMotivoAbierto] = useState(false)
  const motivoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motivoAbierto) return
    function alClickAfuera(e: MouseEvent) {
      if (motivoRef.current && !motivoRef.current.contains(e.target as Node)) {
        setMotivoAbierto(false)
      }
    }
    document.addEventListener('mousedown', alClickAfuera)
    return () => document.removeEventListener('mousedown', alClickAfuera)
  }, [motivoAbierto])

  function cerrar() {
    onClose()
    setTimeout(() => {
      setMotivo(null)
      setAsunto('')
      setMensaje('')
      setEstado('idle')
      setMotivoAbierto(false)
    }, 200)
  }

  async function enviar() {
    if (!motivo || !asunto.trim() || !mensaje.trim()) {
      setEstado('error')
      return
    }
    setEstado('enviando')
    const { ok, ticketId } = await crearTicket({ asunto: asunto.trim(), origen: motivo, cuerpo: mensaje.trim() })
    if (ok && ticketId) {
      onCreado(ticketId)
      cerrar()
    } else {
      setEstado('error')
    }
  }

  if (!abierto) return null

  const IconoElegido = motivo ? ICONOS_MOTIVO[motivo] : null

  return (
    <div className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="card-elevated w-full max-w-sm rounded-3xl bg-card p-6">
        <h3 className="text-base font-bold text-foreground">{t.soporte.nuevoTitulo}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.soporte.nuevoSubtitulo}</p>

        <label className="mt-4 block text-xs font-semibold text-muted-foreground">{t.soporte.motivoLabel}</label>
        <div ref={motivoRef} className="relative mt-1.5">
          <button
            type="button"
            onClick={() => setMotivoAbierto((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={motivoAbierto}
            className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-accent ${
              motivoAbierto ? 'border-accent bg-secondary' : 'border-border bg-secondary/50'
            }`}
          >
            {IconoElegido && <IconoElegido className="h-4 w-4 shrink-0 text-accent" />}
            <span className={motivo ? 'font-medium text-foreground' : 'text-muted-foreground'}>
              {motivo ? t.soporte.motivo[motivo] : t.soporte.motivoPlaceholder}
            </span>
            <ChevronDown
              className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                motivoAbierto ? 'rotate-180' : ''
              }`}
            />
          </button>

          {motivoAbierto && (
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 rounded-xl border border-border bg-popover p-1.5 shadow-lg"
            >
              {MOTIVOS.map((m) => {
                const Icono = ICONOS_MOTIVO[m]
                const seleccionado = motivo === m
                return (
                  <li key={m}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={seleccionado}
                      onClick={() => {
                        setMotivo(m)
                        setMotivoAbierto(false)
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                        seleccionado ? 'text-accent' : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Icono className="h-4 w-4 shrink-0" />
                      <span>{t.soporte.motivo[m]}</span>
                      {seleccionado && <Check className="ml-auto h-4 w-4 shrink-0" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <label className="mt-3.5 block text-xs font-semibold text-muted-foreground">{t.soporte.asuntoLabel}</label>
        <input
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder={t.soporte.asuntoPlaceholder}
          maxLength={120}
          className="mt-1.5 w-full rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <label className="mt-3 block text-xs font-semibold text-muted-foreground">{t.soporte.mensajeLabel}</label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder={t.soporte.mensajePlaceholder}
          rows={3}
          className="mt-1.5 w-full resize-none rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />

        {estado === 'error' && (
          <p className="mt-2 text-xs font-semibold text-destructive">
            {!motivo || !asunto.trim() || !mensaje.trim() ? t.soporte.camposRequeridos : t.soporte.error}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={cerrar}>
            {t.comun.cancelar}
          </Button>
          <Button className="h-11 flex-1 rounded-xl" disabled={estado === 'enviando'} onClick={enviar}>
            {estado === 'enviando' ? <Spinner className="h-4 w-4" /> : t.soporte.enviar}
          </Button>
        </div>
      </div>
    </div>
  )
}

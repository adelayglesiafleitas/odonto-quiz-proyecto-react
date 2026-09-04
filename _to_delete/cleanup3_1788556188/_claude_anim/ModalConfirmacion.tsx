import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/Spinner'
import { useAppSettings } from '@/context/AppSettings'

// Modal de confirmación genérico para acciones destructivas del lado del
// cliente — no existía ninguno acá todavía (a diferencia del panel admin,
// que ya tiene el suyo). Mismo bottom-sheet/card-elevated que
// NuevaConsultaModal.tsx y ReportarPregunta.tsx, para no introducir un
// cuarto patrón visual de modal en la app — pero con lo que a esos les
// faltaba (rol de diálogo, cierre con Escape, foco inicial) agregado acá
// una sola vez, ya que este es el que se piensa reusar de ahora en más.
//
// Primer uso: "Restablecer estadísticas" en Configuracion.tsx.
export function ModalConfirmacion({
  abierto,
  titulo,
  items,
  advertencia,
  error,
  confirmarLabel,
  cargando = false,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean
  titulo: string
  items: string[]
  advertencia?: string
  // Se muestra dentro del modal (no atrás, donde quedaría tapado) cuando
  // `onConfirmar` falló y se quiere dejar reintentar sin cerrar el modal.
  error?: string
  confirmarLabel: string
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const { t } = useAppSettings()
  const confirmarRef = useRef<HTMLButtonElement>(null)

  // Foco inicial en el botón de confirmar al abrir (para teclado/lector de
  // pantalla) y cierre con Escape — salvo mientras `cargando`, para no
  // poder escaparse de una acción ya en curso.
  useEffect(() => {
    if (!abierto) return
    confirmarRef.current?.focus()

    function alEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && !cargando) onCancelar()
    }
    document.addEventListener('keydown', alEscape)
    return () => document.removeEventListener('keydown', alEscape)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto])

  if (!abierto) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirmacion-titulo"
      className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
    >
      <div className="card-elevated w-full max-w-sm rounded-3xl bg-card p-6">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/12 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h3 id="modal-confirmacion-titulo" className="mt-3 text-center text-base font-bold text-foreground">
          {titulo}
        </h3>

        {items.length > 0 && (
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-muted-foreground">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {advertencia && <p className="mt-3 text-center text-xs font-bold text-destructive">{advertencia}</p>}

        {error && (
          <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs font-semibold text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={onCancelar} disabled={cargando}>
            {t.comun.cancelar}
          </Button>
          <Button ref={confirmarRef} variant="destructive" className="h-11 flex-1 rounded-xl" onClick={onConfirmar} disabled={cargando}>
            {cargando ? <Spinner className="h-4 w-4" /> : confirmarLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

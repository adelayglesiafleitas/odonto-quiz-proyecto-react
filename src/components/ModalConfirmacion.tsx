import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/Spinner'
import { useAppSettings } from '@/context/AppSettings'

// Modal de confirmación genérico para acciones destructivas del lado del
// cliente — no existía ninguno acá todavía (a diferencia del panel admin,
// que ya tiene el suyo). Mismo bottom-sheet/card-elevated que
// NuevaConsultaModal.tsx y ReportarPregunta.tsx, para no introducir un
// cuarto patrón visual de modal en la app.
//
// Primer uso: "Restablecer estadísticas" en Configuracion.tsx. Pensado para
// reusarse en cualquier acción futura que borre algo sin vuelta atrás.
export function ModalConfirmacion({
  abierto,
  titulo,
  items,
  advertencia,
  confirmarLabel,
  cargando = false,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean
  titulo: string
  items: string[]
  advertencia?: string
  confirmarLabel: string
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const { t } = useAppSettings()

  if (!abierto) return null

  return (
    <div className="safe-bottom fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="card-elevated w-full max-w-sm rounded-3xl bg-card p-6">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/12 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h3 className="mt-3 text-center text-base font-bold text-foreground">{titulo}</h3>

        {items.length > 0 && (
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-muted-foreground">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {advertencia && <p className="mt-3 text-center text-xs font-bold text-destructive">{advertencia}</p>}

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={onCancelar} disabled={cargando}>
            {t.comun.cancelar}
          </Button>
          <Button variant="destructive" className="h-11 flex-1 rounded-xl" onClick={onConfirmar} disabled={cargando}>
            {cargando ? <Spinner className="h-4 w-4" /> : confirmarLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'

/**
 * Spinner circular chico, para usar dentro de tarjetas o filas mientras se
 * espera un dato puntual (estadísticas, configuración guardada, etc.), a
 * diferencia de LoadingScreen que ocupa toda la pantalla.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  )
}

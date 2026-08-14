import { LogoMark } from '@/components/Logo'
import { useAppSettings } from '@/context/AppSettings'

/**
 * Pantalla de carga a pantalla completa: un anillo girando (spinner) alrededor
 * del logo de la app, más una barra de progreso indeterminada debajo. Se usa
 * al abrir la app (mientras se resuelve la sesión) y en cualquier otro punto
 * donde haga falta bloquear la pantalla completa hasta que algo termine de
 * cargar.
 *
 * Nota: esta pantalla solo puede aparecer una vez React ya montó. Para la
 * carga inicial "en frío" (antes de que el bundle de JS siquiera se
 * descargue) existe un loader estático equivalente en index.html.
 */
export function LoadingScreen({ label }: { label?: string }) {
  const { t } = useAppSettings()
  const texto = label ?? t.comun.cargando

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 overflow-hidden bg-[#04141c]">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[#1fc6c6]/10 blur-3xl" />

      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-white/15 border-t-[#1fc6c6]" />
        <LogoMark className="relative h-10 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />
      </div>

      {texto && (
        <p className="animate-float-up text-sm font-medium text-white/70" style={{ animationDelay: '0.15s' }}>
          {texto}
        </p>
      )}

      <div className="h-1 w-40 overflow-hidden rounded-full bg-white/15">
        <div className="h-full w-1/3 rounded-full bg-[#1fc6c6] animate-progress-indeterminate" />
      </div>
    </div>
  )
}

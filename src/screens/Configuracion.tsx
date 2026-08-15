import { LogOut, User } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import type { Pantalla } from '@/types'

/**
 * Pestaña "Config": cuenta, preferencias (tema/idioma) y cerrar sesión —
 * el equivalente al ícono de engranaje del nav de LinkedIn.
 */
export function Configuracion({
  nickname,
  onNavigate,
  onLogout,
}: {
  nickname: string | null
  onNavigate: (p: Pantalla) => void
  onLogout: () => void
}) {
  const { t } = useAppSettings()
  const nombreMostrado = nickname && nickname.trim().length > 0 ? nickname : t.home.estudiante

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
      </div>

      <h1 className="mt-6 text-lg font-extrabold text-foreground">{t.config.titulo}</h1>

      <div className="card-elevated mt-4 flex items-center gap-3 rounded-2xl bg-card p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t.config.cuenta}</p>
          <p className="truncate text-[15px] font-bold text-foreground">{nombreMostrado}</p>
        </div>
      </div>

      <div className="card-elevated mt-3 rounded-2xl bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.config.preferencias}</p>
        <div className="mt-3">
          <SettingsToggle />
        </div>
      </div>

      <button
        onClick={onLogout}
        className="card-elevated mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm font-bold text-destructive transition active:scale-[0.98]"
      >
        <LogOut className="h-4 w-4" />
        {t.home.cerrarSesion}
      </button>

      <BottomNav activo="config" onNavigate={onNavigate} />
    </div>
  )
}

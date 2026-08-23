import { GraduationCap, Sparkles } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import type { Pantalla } from '@/types'

/**
 * Pestaña "Academia": espacio de aprendizaje. Por ahora es solo un mensaje
 * de bienvenida; más adelante se suman clases y contenido nuevo.
 */
export function Academia({ onNavigate }: { onNavigate: (p: Pantalla) => void }) {
  const { t } = useAppSettings()

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-7 flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-accent/12 text-accent">
          <GraduationCap className="h-6 w-6" />
        </span>
        <h1 className="mt-3 text-lg font-extrabold text-foreground">{t.academia.bienvenidaTitulo}</h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{t.academia.bienvenidaTexto}</p>
      </div>

      <div className="mt-6 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {t.academia.proximamente}
        </span>
      </div>

      <BottomNav activo="academia" onNavigate={onNavigate} />
    </div>
  )
}

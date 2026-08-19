import { Stethoscope, Plus, ChevronRight } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'
import { LogoMark } from '@/components/Logo'
import { BottomNav } from '@/components/BottomNav'
import { getAsignaturas } from '@/lib/asignaturas'
import type { Pantalla } from '@/types'

/**
 * Paso previo a "Configurar examen": elegís la asignatura que vas a
 * examinar. Por ahora solo hay una disponible (Pacientes especiales); esta
 * pantalla ya queda lista para cuando se sumen más (ver lib/asignaturas.ts).
 */
export function ElegirAsignatura({
  onSeleccionar,
  onNavigate,
}: {
  onSeleccionar: (asignaturaId: string) => void
  onNavigate: (p: Pantalla) => void
}) {
  const { t, idioma } = useAppSettings()
  const asignaturas = getAsignaturas(idioma)

  return (
    <div className="app-shell bg-background px-6 pb-28 pt-6">
      <div className="flex items-center justify-between gap-3">
        <LogoMark className="h-8 w-auto" />
        <SettingsToggle />
      </div>

      <div className="mt-6">
        <h1 className="text-lg font-extrabold text-foreground">{t.asignaturas.titulo}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.asignaturas.subtitulo}</p>
      </div>

      <div className="mt-5 space-y-3">
        {asignaturas.map((asig) => (
          <button
            key={asig.id}
            onClick={() => onSeleccionar(asig.id)}
            className="card-elevated flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left transition active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
              <Stethoscope className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 text-[15px] font-bold text-foreground">{asig.nombre}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        ))}

        <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border p-4 text-muted-foreground">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary">
            <Plus className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1 text-sm font-bold">{t.configurar.masAsignaturas}</span>
        </div>
      </div>

      <BottomNav activo="simulacro" onNavigate={onNavigate} />
    </div>
  )
}

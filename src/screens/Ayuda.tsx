import { ArrowLeft, ClipboardList, Target, BookOpenCheck, SlidersHorizontal } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import { SettingsToggle } from '@/components/SettingsToggle'

export function Ayuda({ onBack }: { onBack: () => void }) {
  const { t } = useAppSettings()

  const items = [
    { icon: ClipboardList, titulo: t.ayuda.simulacroTitulo, texto: t.ayuda.simulacroTexto },
    { icon: SlidersHorizontal, titulo: t.ayuda.configurarTitulo, texto: t.ayuda.configurarTexto },
    { icon: Target, titulo: t.ayuda.puntuacionTitulo, texto: t.ayuda.puntuacionTexto },
    { icon: BookOpenCheck, titulo: t.ayuda.estudioTitulo, texto: t.ayuda.estudioTexto },
  ]

  return (
    <div className="app-shell bg-background px-6 pb-10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-extrabold text-foreground">{t.ayuda.titulo}</h1>
        </div>
        <SettingsToggle />
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.titulo} className="card-elevated rounded-2xl bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-[15px] font-bold text-foreground">{item.titulo}</p>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.texto}</p>
            </div>
          )
        })}
      </div>

      <div className="card-elevated mt-4 rounded-2xl bg-secondary p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{t.ayuda.footer}</p>
      </div>
    </div>
  )
}

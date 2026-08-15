import { Gauge, GraduationCap, LifeBuoy, UserCog, ClipboardCheck } from 'lucide-react'
import { useAppSettings } from '@/context/AppSettings'
import type { Pantalla } from '@/types'

export type TabActivo = 'home' | 'academia' | 'ayuda' | 'config'

/**
 * Barra de navegación inferior: 4 pestañas planas más un botón circular
 * elevado en el centro para la acción principal (iniciar un simulacro).
 * Íconos temáticos de estudio/examen en vez de un set genérico, para que
 * no recuerde a la barra de LinkedIn.
 */
export function BottomNav({ activo, onNavigate }: { activo: TabActivo; onNavigate: (p: Pantalla) => void }) {
  const { t } = useAppSettings()

  const izquierda: { id: TabActivo; icon: typeof Gauge; label: string }[] = [
    { id: 'home', icon: Gauge, label: t.nav.home },
    { id: 'academia', icon: GraduationCap, label: t.nav.academia },
  ]
  const derecha: { id: TabActivo; icon: typeof Gauge; label: string }[] = [
    { id: 'ayuda', icon: LifeBuoy, label: t.nav.ayuda },
    { id: 'config', icon: UserCog, label: t.nav.config },
  ]

  function Item({ tab }: { tab: { id: TabActivo; icon: typeof Gauge; label: string } }) {
    const Icon = tab.icon
    const esActivo = activo === tab.id
    return (
      <button
        onClick={() => onNavigate(tab.id)}
        aria-current={esActivo ? 'page' : undefined}
        className={`relative flex flex-1 flex-col items-center gap-0.5 px-1 pb-0.5 pt-2 transition ${
          esActivo ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        {esActivo && <span className="absolute -top-[7px] h-[3px] w-6 rounded-full bg-accent" />}
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-bold">{tab.label}</span>
      </button>
    )
  }

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md">
      <div className="relative flex items-stretch border-t border-border bg-card px-1 pt-1 shadow-[0_-8px_24px_-16px_rgba(9,41,54,0.25)]">
        {izquierda.map((tab) => (
          <Item key={tab.id} tab={tab} />
        ))}

        <button
          onClick={() => onNavigate('configurar')}
          aria-label={t.nav.simulacro}
          className="relative flex flex-1 flex-col items-center justify-end pb-0.5"
        >
          <span className="accent-gradient absolute -top-6 flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-[0_10px_22px_-6px_rgba(9,60,74,0.55)] ring-4 ring-card transition active:scale-95">
            <ClipboardCheck className="h-6 w-6" />
          </span>
          <span className="mt-[36px] text-[9px] font-extrabold text-primary">{t.nav.simulacro}</span>
        </button>

        {derecha.map((tab) => (
          <Item key={tab.id} tab={tab} />
        ))}
      </div>
    </nav>
  )
}
